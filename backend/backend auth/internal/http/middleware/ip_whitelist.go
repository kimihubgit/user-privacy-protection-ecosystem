package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// IPWhitelist restricts access to specific IP addresses.
// If the client's IP is not in the allowed list, it returns a 404 fake not found error to hide the admin routes.
func IPWhitelist(allowedIPs string) gin.HandlerFunc {
	// If allowedIPs is empty or "*", allow all IPs
	if allowedIPs == "" || allowedIPs == "*" {
		return func(c *gin.Context) {
			c.Next()
		}
	}

	// Parse comma-separated allowed IPs
	ips := strings.Split(allowedIPs, ",")
	allowedMap := make(map[string]bool)
	for _, ip := range ips {
		trimmed := strings.TrimSpace(ip)
		if trimmed != "" {
			allowedMap[trimmed] = true
		}
	}

	return func(c *gin.Context) {
		clientIP := c.ClientIP()

		if !allowedMap[clientIP] {
			c.AbortWithStatusJSON(http.StatusNotFound, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "NOT_FOUND",
					"message": "Route not found",
				},
			})
			return
		}

		c.Next()
	}
}
