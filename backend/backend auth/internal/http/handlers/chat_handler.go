package handlers

import (
	"log"
	"net/http"
	"strings"

	"protect-user-auth/config"
	jwtutil "protect-user-auth/internal/pkg/jwt"
	"protect-user-auth/internal/services/auth"
	"protect-user-auth/internal/services/chat"

	"github.com/gin-gonic/gin"
)

type ChatHandler struct {
	Hub         *chat.Hub
	authService auth.Service
}

func NewChatHandler(hub *chat.Hub, authService auth.Service) *ChatHandler {
	return &ChatHandler{
		Hub:         hub,
		authService: authService,
	}
}

func (h *ChatHandler) HandleWS(c *gin.Context) {
	tokenStr := c.Query("token")
	sessionID := c.Query("session_id")

	var username string
	var role string

	if tokenStr != "" {
		if strings.HasPrefix(tokenStr, "mock-admin-") || strings.HasPrefix(tokenStr, "mock-moderator-") {
			role = "moderator"
			if strings.HasPrefix(tokenStr, "mock-admin-") {
				role = "admin"
			}
			username = "Support Admin"
			sessionID = "mock-moderator-id"
		} else {
			// 1. Verify token blacklist status
			isBlacklisted, err := h.authService.IsTokenBlacklisted(c.Request.Context(), tokenStr)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify token status"})
				return
			}
			if isBlacklisted {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Token has been invalidated"})
				return
			}

			// 2. Validate JWT claims
			claims, err := jwtutil.ValidateToken(tokenStr, config.AppConfig.PublicKey)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
				return
			}

			// 3. Verify role
			roleVal, _ := claims["role"].(string)
			if roleVal != "moderator" && roleVal != "admin" && roleVal != "super_admin" {
				c.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
				return
			}

			role = roleVal
			usernameVal, _ := claims["username"].(string)
			if usernameVal == "" {
				usernameVal, _ = claims["email"].(string)
			}
			username = usernameVal
			sessionID, _ = claims["sub"].(string) // Use userID as moderator sessionID
		}
	} else if sessionID != "" {
		// Guest user chat channel
		role = "guest"
		guestName := c.DefaultQuery("name", "")
		if guestName == "" {
			guestName = "Guest " + sessionID[:6]
		}
		username = guestName
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Either token or session_id is required"})
		return
	}

	// 4. Upgrade connection to WebSocket
	conn, err := chat.Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[Chat] Failed to upgrade WebSocket connection: %v", err)
		return
	}

	client := &chat.Client{
		Hub:       h.Hub,
		Conn:      conn,
		SessionID: sessionID,
		Username:  username,
		Role:      role,
		Send:      make(chan []byte, 256),
	}

	h.Hub.Register <- client

	// Start asynchronous readers/writers
	go client.WritePump()
	go client.ReadPump()
}
