package router

import (
	"time"

	"protect-user-auth/config"
	"protect-user-auth/internal/http/handlers"
	"protect-user-auth/internal/http/middleware"
	"protect-user-auth/internal/services/auth"

	"github.com/gin-gonic/gin"
)

func SetupRouter(
	authService auth.Service,
	authHandler *handlers.AuthHandler,
	passkeyHandler *handlers.PasskeyHandler,
	reportHandler *handlers.ReportHandler,
	userHandler *handlers.UserHandler,
	adminHandler *handlers.AdminHandler,
	chatHandler *handlers.ChatHandler,
) *gin.Engine {
	r := gin.Default()

	// 1. Max Request Body Size Limit (1MB)
	r.Use(middleware.MaxAllowedPayload(1024 * 1024))

	// CORS Middleware
	r.Use(middleware.CORS(config.AppConfig.RPOrigins, true))

	// Security Headers Middleware
	r.Use(middleware.Secure(true))

	// Instantiate the global rate limiter (100 requests per minute)
	globalLimiter := middleware.RateLimit(100, time.Minute)

	api := r.Group("/api/v1")
	{
		// WebSocket Chat route (handles its own authorization internally)
		api.GET("/ws/chat", chatHandler.HandleWS)

		authGroup := api.Group("/auth", globalLimiter)
		{
			authGroup.POST("/register", middleware.RateLimit(15, 15*time.Minute), authHandler.Register)
			authGroup.POST("/login", middleware.RateLimit(15, 15*time.Minute), authHandler.Login)
			authGroup.POST("/social-login", middleware.RateLimit(15, 15*time.Minute), authHandler.SocialLogin)
			authGroup.GET("/callback/:provider", authHandler.OAuthCallback)
			authGroup.GET("/check-email", userHandler.CheckEmail)
			authGroup.GET("/check-username", userHandler.CheckUsername)
			// Passkey routes
			passkey := authGroup.Group("/passkey")
			{
				passkey.POST("/register/begin", passkeyHandler.RegisterBegin)
				passkey.POST("/register/finish", passkeyHandler.RegisterFinish)
				passkey.POST("/login/begin", passkeyHandler.LoginBegin)
				passkey.POST("/login/finish", passkeyHandler.LoginFinish)
			}

			// Protected auth routes (requires authentication)
			authProtected := authGroup.Group("")
			authProtected.Use(middleware.JWTAuth(authService))
			{
				authProtected.POST("/logout", authHandler.Logout)
			}
		}

		reportGroup := api.Group("")
		{
			// Public report submission (ONLY limited by 5 requests per 5 minutes, independent of global limiter)
			reportGroup.POST("/reports", middleware.RateLimit(5, 5*time.Minute), reportHandler.SubmitReport)

			// Protected report status checking (applies global rate limiter + JWT verification)
			reportProtected := reportGroup.Group("", globalLimiter)
			reportProtected.Use(middleware.JWTAuth(authService))
			{
				reportProtected.GET("/status", reportHandler.GetReporterReports)
			}
		}

		userGroup := api.Group("/users", globalLimiter)
		{
			// Public user checks
			userGroup.GET("/check-email", userHandler.CheckEmail)
			userGroup.GET("/check-username", userHandler.CheckUsername)

			// Protected user routes
			userProtected := userGroup.Group("")
			userProtected.Use(middleware.JWTAuth(authService))
			{
				userProtected.GET("/me", userHandler.GetMe)
			}
		}

		adminGroup := api.Group("/admin", globalLimiter)
		adminGroup.Use(middleware.IPWhitelist(config.AppConfig.AdminAllowedIPs))
		adminGroup.Use(middleware.JWTAuth(authService))
		adminGroup.Use(middleware.RequireRole("moderator", "super_admin", "admin"))
		{
			adminGroup.GET("/reports", reportHandler.ListReports)
			adminGroup.GET("/reports/stats", reportHandler.GetGlobalStats)
			adminGroup.GET("/reports/:id", reportHandler.GetReportByID)
			adminGroup.PUT("/reports/:id/status", reportHandler.UpdateReportStatus)

			// URL Blocklist management (proxied to backend check)
			adminGroup.POST("/urls", adminHandler.AddScamURL)
			adminGroup.GET("/urls", adminHandler.ListScamURLs)
			adminGroup.DELETE("/urls/:id", adminHandler.DeleteScamURL)
			adminGroup.GET("/stats", adminHandler.GetStats)
			adminGroup.GET("/dashboard-stats", adminHandler.GetDashboardStats)

			// Allowlist management (proxied to backend check)
			adminGroup.POST("/allowlist", adminHandler.AddAllowURL)
			adminGroup.GET("/allowlist", adminHandler.ListAllowURLs)
			adminGroup.DELETE("/allowlist/:id", adminHandler.DeleteAllowURL)

			// Scammer registry management (proxied to backend check)
			adminGroup.POST("/scammers", adminHandler.AddScammer)
			adminGroup.GET("/scammers", adminHandler.ListScammers)
			adminGroup.DELETE("/scammers/:id", adminHandler.DeleteScammer)

			// User management endpoints
			adminGroup.GET("/users", adminHandler.ListUsers)
			adminGroup.GET("/users/:id", adminHandler.GetUserDetails)
		}
	}

	return r
}
