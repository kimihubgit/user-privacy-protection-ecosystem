package handlers

import (
	"log"
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
	clientType := c.Query("type") // "moderator" | "client"

	var username string
	var role string

	// 1. Explicitly check if connection is intended for Moderator Dashboard listener
	if clientType == "moderator" || strings.HasPrefix(tokenStr, "mock-admin-") || strings.HasPrefix(tokenStr, "mock-moderator-") {
		role = "moderator"
		if tokenStr != "" {
			if strings.HasPrefix(tokenStr, "mock-admin-") {
				role = "admin"
			}
			username = "Support Admin"
			if sessionID == "" {
				sessionID = "mock-moderator-id"
			}
		} else {
			username = "Moderator"
			if sessionID == "" {
				sessionID = "moderator-session"
			}
		}
	} else {
		// 2. All connections from user support chat UI are Client Support Requests
		role = "user"
		guestName := c.DefaultQuery("name", "")
		if guestName != "" {
			username = guestName
		} else {
			username = "Khách Hàng"
		}

		if tokenStr != "" && !strings.HasPrefix(tokenStr, "mock-") {
			// If token is present, try extracting name from JWT claims
			claims, err := jwtutil.ValidateToken(tokenStr, config.AppConfig.PublicKey)
			if err == nil && claims != nil {
				if usernameVal, ok := claims["username"].(string); ok && usernameVal != "" {
					username = usernameVal
				} else if nameVal, ok := claims["name"].(string); ok && nameVal != "" {
					username = nameVal
				} else if emailVal, ok := claims["email"].(string); ok && emailVal != "" {
					username = emailVal
				}
			}
		}

		if sessionID == "" {
			sessionID = "session_" + username
		}
	}

	// 3. Upgrade connection to WebSocket
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
