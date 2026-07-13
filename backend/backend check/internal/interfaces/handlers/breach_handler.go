package handlers

import (
	"encoding/json"
	"net/http"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
)

type BreachHandler struct {
	httpClient *http.Client
}

func NewBreachHandler() *BreachHandler {
	return &BreachHandler{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (h *BreachHandler) CheckEmailBreach(c *gin.Context) {
	// Support both path parameter (:email) and query parameter (?q=)
	q := c.Param("email")
	if q == "" {
		q = c.Query("q")
	}

	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' or path parameter 'email' is required"})
		return
	}

	lang := c.DefaultQuery("lang", "vi")

	// Call ChongLuaDao API
	targetURL := "https://feeds.chongluadao.vn/checkbreach/email?q=" + url.QueryEscape(q) + "&lang=" + url.QueryEscape(lang)
	resp, err := h.httpClient.Get(targetURL)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch breach data from external service"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadGateway, gin.H{"error": "External breach service returned an error"})
		return
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode external breach service response"})
		return
	}

	c.JSON(http.StatusOK, result)
}
