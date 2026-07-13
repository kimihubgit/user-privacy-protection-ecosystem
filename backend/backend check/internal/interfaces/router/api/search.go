package api

import (
	"protect-user-backend/internal/infrastructure/database"
	"protect-user-backend/internal/interfaces/handlers"
	"protect-user-backend/internal/interfaces/middleware"

	"github.com/gin-gonic/gin"
)

// LoadSearchRouter initializes the handler for Search & Auto-complete endpoints and registers routes.
func LoadSearchRouter(apiGroup *gin.RouterGroup, db *database.DB) {
	searchHandler := handlers.NewSearchHandler(db)

	// Suggestions route (Rate Limit: 20 req/sec, burst 50 - called frequently as the user types)
	apiGroup.GET("/search/suggestions", middleware.RateLimitMiddleware(20.0, 50.0), searchHandler.GetSuggestions)

	// Detail route (Rate Limit: 5 req/sec, burst 20)
	apiGroup.GET("/check/detail", middleware.RateLimitMiddleware(5.0, 20.0), searchHandler.GetDetail)
}
