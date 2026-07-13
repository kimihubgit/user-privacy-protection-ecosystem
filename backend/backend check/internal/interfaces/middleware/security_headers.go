package middleware

import (
	"github.com/gin-gonic/gin"
)

// SecurityHeadersMiddleware sets high-leverage security headers on every response.
func SecurityHeadersMiddleware() gin.HandlerFunc {
	isProduction := gin.Mode() == gin.ReleaseMode
	return func(c *gin.Context) {
		h := c.Writer.Header()
		h.Set("X-Content-Type-Options", "nosniff")
		h.Set("X-Frame-Options", "DENY")
		h.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		
		// API responses are JSON; they never legitimately load
		// scripts, styles, frames, or images. default-src 'none' makes
		// any accidental HTML response inert in the browser.
		h.Set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
		
		// Permissions-Policy: deny everything by default to protect powerful client browser APIs.
		h.Set("Permissions-Policy", "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()")
		
		if isProduction {
			// HSTS only in production to force browser-side HTTPS enforcement.
			h.Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}
		
		c.Next()
	}
}
