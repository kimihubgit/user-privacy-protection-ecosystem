package api

import (
	"protect-user-backend/internal/interfaces/handlers"
	"protect-user-backend/internal/interfaces/middleware"

	"github.com/gin-gonic/gin"
)

// LoadBreachRouter initializes the handler for Breach Check endpoints and registers routes.
func LoadBreachRouter(apiGroup *gin.RouterGroup) {
	breachHandler := handlers.NewBreachHandler()

	// Public API (Rate limit: 5 requests per second, burst of 30)
	apiGroup.GET("/check-breach/email", middleware.RateLimitMiddleware(5.0, 30.0), breachHandler.CheckEmailBreach)
	apiGroup.GET("/check-breach/email/:email", middleware.RateLimitMiddleware(5.0, 30.0), breachHandler.CheckEmailBreach)
}
