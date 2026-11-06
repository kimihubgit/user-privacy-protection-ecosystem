package api

import (
	"protect-user-backend/internal/infrastructure/database"
	"protect-user-backend/internal/interfaces/handlers"
	"protect-user-backend/internal/interfaces/middleware"
	"protect-user-backend/internal/infrastructure/repository/scamuser"
	scamuserService "protect-user-backend/internal/services/scamuser"

	"github.com/gin-gonic/gin"
)

// LoadScamUserRouter initializes the repository, service, and handler for ScamUser endpoints, registers their routes, and returns the scamUser service.
func LoadScamUserRouter(apiGroup *gin.RouterGroup, adminGroup *gin.RouterGroup, db *database.DB) scamuserService.Service {
	scamUserRepo := scamuser.New(db)
	scamUserVal := scamuserService.New(scamUserRepo)
	scamUserHandler := handlers.NewScamUserHandler(scamUserVal)

	// Public APIs
	apiGroup.POST("/scammers/check", middleware.RateLimitMiddleware(5.0, 30.0), scamUserHandler.CheckScamUser)

	// Ingestion/Sync API
	adminGroup.POST("/scammers", scamUserHandler.AddScamUser)
	adminGroup.GET("/scammers", scamUserHandler.ListScamUsers)
	adminGroup.GET("/scammers/:id", scamUserHandler.GetScamUser)
	adminGroup.PUT("/scammers/:id", scamUserHandler.UpdateScamUser)
	adminGroup.DELETE("/scammers/:id", scamUserHandler.DeleteScamUser)

	return scamUserVal
}
