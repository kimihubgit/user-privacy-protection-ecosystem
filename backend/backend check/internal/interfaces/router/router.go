package router

import (
	"time"

	"protect-user-backend/internal/config"
	"protect-user-backend/internal/infrastructure/database"
	"protect-user-backend/internal/interfaces/middleware"
	"protect-user-backend/internal/interfaces/router/api"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

// SetupRouter initializes Gin, configures middleware, and registers modular routes.
func SetupRouter(cfg *config.Config, db *database.DB) *gin.Engine {
	// Enable strict JSON binding (disallow unknown fields to prevent Mass Assignment)
	binding.EnableDecoderDisallowUnknownFields = true

	r := gin.New()

	// Disable trusting all proxies by default (prevents HTTP Header IP Spoofing)
	r.SetTrustedProxies(nil)

	// Default Gin middlewares
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	// CORS Middleware
	r.Use(middleware.CorsMiddleware())

	// Security Headers Middleware
	r.Use(middleware.SecurityHeadersMiddleware())

	// Timeout Middleware (10s limit per request)
	r.Use(middleware.TimeoutMiddleware(10 * time.Second))

	// Global default request body size ceiling (1 MiB)
	r.Use(middleware.MaxBodySize(middleware.DefaultBodyMaxBytes))

	r.GET("/", Index)

	// Health check route
	r.GET("/ping", Ping)

	r.NoRoute(NotFound)

	// Public API group (tighter limit for check & report payloads: 100 KiB)
	apiGroup := r.Group("/api")
	apiGroup.Use(middleware.MaxBodySize(middleware.APIBodyMaxBytes))

	// Ingestion Admin API group (for syncing data from backend auth: 100 KiB)
	adminGroup := r.Group("/api/admin")
	adminGroup.Use(middleware.IPWhitelist(cfg.AdminAllowedIPs))
	if cfg.JWTPublicKey != "" {
		adminGroup.Use(middleware.JWTAuth(cfg.JWTPublicKey, []string{"moderator", "super_admin", "admin"}))
	} else {
		adminGroup.Use(middleware.APIKeyAuth(cfg.AdminAPIKey))
	}
	adminGroup.Use(middleware.MaxBodySize(middleware.APIBodyMaxBytes))

	// Register sub-routes with self-initialization
	api.LoadURLRouter(apiGroup, adminGroup, db)
	api.LoadScamUserRouter(apiGroup, adminGroup, db)
	api.LoadBreachRouter(apiGroup)
	api.LoadSearchRouter(apiGroup, db)

	return r
}
