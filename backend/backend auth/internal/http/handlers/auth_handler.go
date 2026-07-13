package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"protect-user-auth/config"
	"protect-user-auth/internal/dto/request"
	"protect-user-auth/internal/http/response"
	"protect-user-auth/internal/infrastructure/oauth"
	"protect-user-auth/internal/services/auth"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService   auth.Service
	oauthRegistry *oauth.Registry
}

func NewAuthHandler(authService auth.Service, oauthRegistry *oauth.Registry) *AuthHandler {
	return &AuthHandler{
		authService:   authService,
		oauthRegistry: oauthRegistry,
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req request.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", response.FormatValidationError(err))
		return
	}

	res, err := h.authService.Register(c.Request.Context(), req)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}

	c.JSON(http.StatusCreated, res)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req request.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", response.FormatValidationError(err))
		return
	}

	res, err := h.authService.Login(c.Request.Context(), req)
	if err != nil {
		response.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	c.JSON(http.StatusOK, res)
}

func (h *AuthHandler) SocialLogin(c *gin.Context) {
	var req request.SocialLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", response.FormatValidationError(err))
		return
	}

	// Resolve/Verify social profile using the registered OAuth provider strategy
	resolvedReq, err := h.oauthRegistry.Resolve(c.Request.Context(), req.Provider, req)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}
	req = *resolvedReq

	res, err := h.authService.SocialLogin(c.Request.Context(), req)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}

	c.JSON(http.StatusOK, res)
}

// OAuthCallback handles direct redirect callbacks from OAuth providers (Google, GitHub, etc.)
func (h *AuthHandler) OAuthCallback(c *gin.Context) {
	provider := c.Param("provider")
	code := c.Query("code")
	if code == "" {
		response.SendError(c, http.StatusBadRequest, "BAD_REQUEST", "Authorization code is required")
		return
	}

	req := request.SocialLoginRequest{
		Provider: provider,
		Code:     code,
	}

	resolvedReq, err := h.oauthRegistry.Resolve(c.Request.Context(), provider, req)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}

	res, err := h.authService.SocialLogin(c.Request.Context(), *resolvedReq)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "BAD_REQUEST", err.Error())
		return
	}

	// Redirect back to frontend callback page with the generated token
	frontendURL := "http://localhost:5173"
	if len(config.AppConfig.RPOrigins) > 0 {
		// Use first configured origin (usually frontend)
		frontendURL = config.AppConfig.RPOrigins[0]
	}

	redirectURL := fmt.Sprintf("%s/oauth-callback?token=%s", frontendURL, res.Token)
	c.Redirect(http.StatusFound, redirectURL)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", "Authorization header is required")
		return
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if !(len(parts) == 2 && parts[0] == "Bearer") {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", "Authorization header format must be Bearer {token}")
		return
	}

	tokenString := parts[1]
	err := h.authService.Logout(c.Request.Context(), tokenString)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "Failed to logout")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
