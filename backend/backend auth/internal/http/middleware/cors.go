package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func CORS(allowOrigins []string, development bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			allowed := false
			if development && len(allowOrigins) == 0 {
				allowed = true
			} else {
				for _, o := range allowOrigins {
					if strings.TrimSpace(o) == origin {
						allowed = true
						break
					}
				}
			}

			if allowed {
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
			}
		} else if development {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, Content-Length, Cache-Control, Origin, X-CSRF-Token, X-Requested-With, X-Request-ID, X-Correlation-ID, X-Session-ID")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "X-Request-ID, X-Correlation-ID")
		c.Writer.Header().Set("Access-Control-Max-Age", "43200") // 12 hours in seconds

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
