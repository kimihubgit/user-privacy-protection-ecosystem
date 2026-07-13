package middleware

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

func Secure(development bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Referrer-Policy", "no-referrer")
		c.Writer.Header().Set("Content-Security-Policy", "default-src 'self'")
		c.Writer.Header().Set("X-Download-Options", "noopen")

		// Standard security headers
		c.Writer.Header().Set("X-Frame-Options", "DENY")
		c.Writer.Header().Set("X-Content-Type-Options", "nosniff")
		c.Writer.Header().Set("X-XSS-Protection", "1; mode=block")

		// Strict-Transport-Security (HSTS)
		if !development {
			c.Writer.Header().Set("Strict-Transport-Security", fmt.Sprintf("max-age=%d; includeSubDomains", 31536000))
		}

		c.Next()
	}
}
