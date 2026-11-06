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
			Timeout: 3 * time.Second,
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

	// Call breach service with graceful fallback
	targetURL := "https://feeds.chongluadao.vn/checkbreach/email?q=" + url.QueryEscape(q) + "&lang=" + url.QueryEscape(lang)
	resp, err := h.httpClient.Get(targetURL)
	if err != nil || resp.StatusCode != http.StatusOK {
		if resp != nil && resp.Body != nil {
			_ = resp.Body.Close()
		}
		c.JSON(http.StatusOK, gin.H{
			"status":   "safe",
			"breaches": []interface{}{},
			"total":    0,
			"message":  "Không phát hiện dữ liệu rò rỉ hoặc dịch vụ kiểm tra đang bảo trì.",
		})
		return
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":   "safe",
			"breaches": []interface{}{},
			"total":    0,
			"message":  "Không phát hiện dữ liệu rò rỉ.",
		})
		return
	}

	c.JSON(http.StatusOK, result)
}
