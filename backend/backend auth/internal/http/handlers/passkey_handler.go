package handlers

import (
	"context"
	"io"
	"net/http"
	"strings"

	"protect-user-auth/config"
	dtoresponse "protect-user-auth/internal/dto/response"
	"protect-user-auth/internal/http/response"
	jwtutil "protect-user-auth/internal/pkg/jwt"
	"protect-user-auth/internal/services/auth"
	"protect-user-auth/internal/services/passkey"

	"github.com/gin-gonic/gin"
)

type PasskeyHandler struct {
	passkeyService passkey.Service
	authService    auth.Service
}

func NewPasskeyHandler(passkeyService passkey.Service, authService auth.Service) *PasskeyHandler {
	return &PasskeyHandler{
		passkeyService: passkeyService,
		authService:    authService,
	}
}

type emailRequest struct {
	Email string `json:"email" binding:"omitempty,email"`
}

func (h *PasskeyHandler) RegisterBegin(c *gin.Context) {
	var req emailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", response.FormatValidationError(err))
		return
	}

	// Try to extract authenticated email from JWT token in Authorization header
	authHeader := c.GetHeader("Authorization")
	var authEmail string
	if authHeader != "" {
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && parts[0] == "Bearer" {
			tokenString := parts[1]
			claims, err := jwtutil.ValidateToken(tokenString, config.AppConfig.PublicKey)
			if err == nil {
				if emailVal, ok := claims["email"].(string); ok {
					authEmail = emailVal
				}
			}
		}
	}

	ctx := c.Request.Context()
	if authEmail != "" {
		ctx = context.WithValue(ctx, "authenticatedEmail", authEmail)
	}

	options, sessionID, err := h.passkeyService.BeginRegistration(ctx, req.Email)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"options":    options,
		"session_id": sessionID,
	})
}

func (h *PasskeyHandler) RegisterFinish(c *gin.Context) {
	sessionID := c.GetHeader("X-Session-ID")
	if sessionID == "" {
		sessionID = c.Query("session_id")
	}
	if sessionID == "" {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", "session_id query parameter or X-Session-ID header is required")
		return
	}

	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "BAD_REQUEST", "failed to read request body")
		return
	}

	user, err := h.passkeyService.FinishRegistration(c.Request.Context(), sessionID, bodyBytes)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}

	token, err := h.authService.GenerateToken(user)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to generate token")
		return
	}

	c.JSON(http.StatusOK, dtoresponse.AuthResponse{
		Token: token,
		User: dtoresponse.UserResponse{
			ID:        user.ID.Hex(),
			Username:  user.Username,
			Email:     user.Email,
			Name:      user.Name,
			Avatar:    user.Avatar,
			Role:      user.Role,
			CreatedAt: &user.CreatedAt,
		},
	})
}

func (h *PasskeyHandler) LoginBegin(c *gin.Context) {
	var req emailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", response.FormatValidationError(err))
		return
	}

	options, sessionID, err := h.passkeyService.BeginLogin(c.Request.Context(), req.Email)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"options":    options,
		"session_id": sessionID,
	})
}

func (h *PasskeyHandler) LoginFinish(c *gin.Context) {
	sessionID := c.GetHeader("X-Session-ID")
	if sessionID == "" {
		sessionID = c.Query("session_id")
	}
	if sessionID == "" {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", "session_id query parameter or X-Session-ID header is required")
		return
	}

	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "BAD_REQUEST", "failed to read request body")
		return
	}

	user, err := h.passkeyService.FinishLogin(c.Request.Context(), sessionID, bodyBytes)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}

	token, err := h.authService.GenerateToken(user)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to generate token")
		return
	}

	c.JSON(http.StatusOK, dtoresponse.AuthResponse{
		Token: token,
		User: dtoresponse.UserResponse{
			ID:        user.ID.Hex(),
			Username:  user.Username,
			Email:     user.Email,
			Name:      user.Name,
			Avatar:    user.Avatar,
			Role:      user.Role,
			CreatedAt: &user.CreatedAt,
		},
	})
}
