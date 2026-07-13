package handlers

import (
	"net/http"

	dtoresponse "protect-user-auth/internal/dto/response"
	"protect-user-auth/internal/http/response"
	"protect-user-auth/internal/services/auth"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserHandler struct {
	authService auth.Service
}

func NewUserHandler(authService auth.Service) *UserHandler {
	return &UserHandler{
		authService: authService,
	}
}

// GetMe returns the profile of the currently logged-in user.
func (h *UserHandler) GetMe(c *gin.Context) {
	userIDStr, exists := c.Get("userID")
	if !exists {
		response.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Unauthorized")
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", "Invalid user ID format")
		return
	}

	u, err := h.authService.FindUserByID(c.Request.Context(), userID)
	if err != nil {
		response.SendError(c, http.StatusNotFound, "NOT_FOUND", "User not found")
		return
	}

	c.JSON(http.StatusOK, dtoresponse.GetMeResponse{
		Username: u.Username,
		Email:    u.Email,
		Name:     u.Name,
		Avatar:   u.Avatar,
	})
}

// CheckEmail checks if an email is already registered in the system.
func (h *UserHandler) CheckEmail(c *gin.Context) {
	email := c.Query("email")
	if email == "" {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", "email query parameter is required")
		return
	}

	exists, err := h.authService.CheckEmailExists(c.Request.Context(), email)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"exists": exists})
}

// CheckUsername checks if a username is already registered in the system.
func (h *UserHandler) CheckUsername(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", "username query parameter is required")
		return
	}

	exists, err := h.authService.CheckUsernameExists(c.Request.Context(), username)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"exists": exists})
}
