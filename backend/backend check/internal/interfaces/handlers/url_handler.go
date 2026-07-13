package handlers

import (
	"net/http"
	"strconv"

	"protect-user-backend/internal/dto/request"
	"protect-user-backend/internal/models"
	urlService "protect-user-backend/internal/services/url"
	"protect-user-backend/internal/utils"

	"github.com/gin-gonic/gin"
)

type URLHandler struct {
	service urlService.Service
}

func NewURLHandler(service urlService.Service) *URLHandler {
	return &URLHandler{service: service}
}

// CheckURL handles the request to check if a URL is malicious.
func (h *URLHandler) CheckURL(c *gin.Context) {
	var req request.CheckURLInput
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationError(err)})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	res, err := h.service.CheckURL(c.Request.Context(), req.URL, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

// CheckURLGet handles the request to check if a URL is malicious via GET query parameters, supporting HTTP Caching.
func (h *URLHandler) CheckURLGet(c *gin.Context) {
	urlParam := c.Query("url")
	if urlParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tham số url là bắt buộc"})
		return
	}

	ipAddress := c.ClientIP()
	userAgent := c.Request.UserAgent()

	res, err := h.service.CheckURL(c.Request.Context(), urlParam, ipAddress, userAgent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Set cache control headers dynamically based on threat level
	if res.Status == "safe" {
		// Safe results cached short-term (3 minutes)
		c.Header("Cache-Control", "public, max-age=180")
	} else {
		// Malicious/Suspicious results cached longer (10 minutes)
		c.Header("Cache-Control", "public, max-age=600")
	}

	c.JSON(http.StatusOK, res)
}

// AddScamURL reports a new scam URL.
func (h *URLHandler) AddScamURL(c *gin.Context) {
	var input request.AddScamURLInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationError(err)})
		return
	}

	req := models.ScamURL{
		URL:            input.URL,
		Category:       input.Category,
		Description:    input.Description,
		SourceReportID: input.SourceReportID,
		ReportedBy:     "admin",
	}

	err := h.service.AddScamURL(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Scam URL successfully added",
		"data":    req,
	})
}

// AddAllowURL registers a trusted URL/domain into the allowlist
func (h *URLHandler) AddAllowURL(c *gin.Context) {
	var input struct {
		URL         string `json:"url" binding:"required"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": utils.FormatValidationError(err)})
		return
	}

	req := models.AllowURL{
		URL:         input.URL,
		Description: input.Description,
	}

	err := h.service.AddAllowURL(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Allowlist URL successfully added",
		"data":    req,
	})
}

// DeleteAllowURL removes a whitelisted URL from the allowlist
func (h *URLHandler) DeleteAllowURL(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID parameter is required"})
		return
	}

	err := h.service.DeleteAllowURL(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Allowlist URL successfully deleted"})
}

// ListAllowURLs returns whitelisted URLs with pagination
func (h *URLHandler) ListAllowURLs(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "20")

	page, _ := strconv.ParseInt(pageStr, 10, 64)
	limit, _ := strconv.ParseInt(limitStr, 10, 64)

	urls, total, err := h.service.ListAllowURLs(c.Request.Context(), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  urls,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}
