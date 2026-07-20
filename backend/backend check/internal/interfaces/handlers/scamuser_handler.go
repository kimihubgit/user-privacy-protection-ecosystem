package handlers

import (
	"net/http"
	"strconv"

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

// ListScamUsers returns the paginated list of scammers
func (h *ScamUserHandler) ListScamUsers(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "20")
	targetType := c.Query("type")

	page, _ := strconv.ParseInt(pageStr, 10, 64)
	limit, _ := strconv.ParseInt(limitStr, 10, 64)

	scammers, total, err := h.service.ListScammers(c.Request.Context(), page, limit, targetType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  scammers,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// DeleteScamUser removes a scammer by ID
func (h *ScamUserHandler) DeleteScamUser(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID parameter is required"})
		return
	}

	err := h.service.DeleteScammer(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Scammer successfully deleted"})
}
