package handlers

import (
	"net/http"

	"protect-user-backend/internal/dto/request"
	"protect-user-backend/internal/services/scamuser"
	"protect-user-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type ScamUserHandler struct {
	service scamuser.Service
}

func NewScamUserHandler(service scamuser.Service) *ScamUserHandler {
	return &ScamUserHandler{service: service}
}

// CheckScamUser checks if a target is a known scammer.
func (h *ScamUserHandler) CheckScamUser(c *gin.Context) {
	var req request.CheckScamUserInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationError(err)})
		return
	}

	res, err := h.service.CheckScamUser(c.Request.Context(), req.Target)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

// AddScamUser manually inserts a scammer target.
func (h *ScamUserHandler) AddScamUser(c *gin.Context) {
	var input request.AddScamUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationError(err)})
		return
	}

	scammer, err := h.service.AddScammerFromInput(c.Request.Context(), input.Target, input.Type, input.Name, input.BankName, input.Description, input.SourceReportID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Scammer successfully added to blocklist",
		"data":    scammer,
	})
}
