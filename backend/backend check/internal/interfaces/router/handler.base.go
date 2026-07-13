package router

import "github.com/gin-gonic/gin"

// Index handles the root URL.
func Index(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Welcome to the Go Protect User API",
		"status":  "OK",
	})
}

// Ping handles the health check.
func Ping(c *gin.Context) {
	c.String(200, "pong")
}

// NotFound handles 404 responses.
func NotFound(c *gin.Context) {
	c.JSON(404, gin.H{
		"status":  "error",
		"message": "API endpoint not found",
	})
}
