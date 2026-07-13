package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

const (
	// DefaultBodyMaxBytes is the catch-all global ceiling — 1 MiB.
	DefaultBodyMaxBytes int64 = 1 << 20

	// APIBodyMaxBytes covers checking and reporting endpoints — 100 KiB.
	APIBodyMaxBytes int64 = 100 << 10

	// AuthBodyMaxBytes covers lightweight register/login/OTP payloads — 4 KiB.
	AuthBodyMaxBytes int64 = 4 << 10
)

// MaxBodySize restricts the maximum size of the HTTP request body.
// It checks the Content-Length header first, then wraps the reader to prevent streaming attacks.
func MaxBodySize(limitBytes int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Quick check Content-Length header if present
		if c.Request.ContentLength > limitBytes {
			c.AbortWithStatusJSON(http.StatusRequestEntityTooLarge, gin.H{
				"error": "Request body is too large",
			})
			return
		}

		// 2. Wrap body reader in MaxBytesReader to protect against Chunked Transfer Encoding bypass
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, limitBytes)
		c.Next()
	}
}
