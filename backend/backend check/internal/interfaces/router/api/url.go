package api

import (
	"time"

	"protect-user-backend/internal/infrastructure/cache"
	"protect-user-backend/internal/infrastructure/database"
	"protect-user-backend/internal/interfaces/handlers"
	"protect-user-backend/internal/interfaces/middleware"
	urlRepo "protect-user-backend/internal/infrastructure/repository/url"
	urlService "protect-user-backend/internal/services/url"

	"github.com/gin-gonic/gin"
)

// LoadURLRouter initializes the repository, service, and handler for URL endpoints, registers routes, and returns the URL service.
func LoadURLRouter(apiGroup *gin.RouterGroup, adminGroup *gin.RouterGroup, db *database.DB) urlService.Service {
	urlRepository := urlRepo.New(db)
	urlCache := cache.NewMemoryURLCache(5 * time.Minute)
	urlChecker := urlService.New(urlRepository, urlCache)
	urlHandler := handlers.NewURLHandler(urlChecker)

	// Public API
	apiGroup.POST("/urls/check", middleware.RateLimitMiddleware(5.0, 30.0), urlHandler.CheckURL)
	apiGroup.GET("/urls/check", middleware.RateLimitMiddleware(5.0, 30.0), urlHandler.CheckURLGet)

	// Ingestion/Sync API
	adminGroup.POST("/urls", urlHandler.AddScamURL)
	adminGroup.POST("/allowlist", urlHandler.AddAllowURL)
	adminGroup.DELETE("/allowlist/:id", urlHandler.DeleteAllowURL)
	adminGroup.GET("/allowlist", urlHandler.ListAllowURLs)

	return urlChecker
}
