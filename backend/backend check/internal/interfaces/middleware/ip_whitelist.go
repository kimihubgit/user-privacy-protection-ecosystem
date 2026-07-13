package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// IPWhitelist restricts router access to specific IP addresses.
// If the client's IP is not in the allowed list, it returns a fake 404 Page Not Found error to hide the route.
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
				"status":  "error",
				"message": "API endpoint not found",
			})
			return
		}

		c.Next()
	}
}
