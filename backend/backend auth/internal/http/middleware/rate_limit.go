package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type ipLimiter struct {
	tokens     float64
	lastRefill time.Time
}

// RateLimit limits requests to maxRequests per period.
// Uses a thread-safe token bucket algorithm per IP.
func RateLimit(maxRequests float64, period time.Duration) gin.HandlerFunc {
	refillRate := maxRequests / period.Seconds()
	limiters := make(map[string]*ipLimiter)
	var mu sync.Mutex

	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.Lock()
		limiter, exists := limiters[ip]
		if !exists {
			limiter = &ipLimiter{
				tokens:     maxRequests,
				lastRefill: time.Now(),
			}
			limiters[ip] = limiter
		}

		// Refill tokens based on time elapsed
		now := time.Now()
		elapsed := now.Sub(limiter.lastRefill).Seconds()
		limiter.tokens += elapsed * refillRate
		if limiter.tokens > maxRequests {
			limiter.tokens = maxRequests
		}
		limiter.lastRefill = now

		// Check if we have enough tokens
		if limiter.tokens < 1.0 {
			mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "RATE_LIMIT_EXCEEDED",
					"message": "Too many requests. Please try again later.",
				},
			})
			c.Abort()
			return
		}

		limiter.tokens -= 1.0
		mu.Unlock()

		c.Next()
	}
}

// MaxAllowedPayload restricts the size of incoming JSON request payloads to protect against DoS.
func MaxAllowedPayload(maxSize int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxSize)
		c.Next()
	}
}
