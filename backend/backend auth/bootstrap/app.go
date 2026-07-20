package bootstrap

import (
	"protect-user-auth/config"
	"protect-user-auth/internal/http/handlers"
	"protect-user-auth/internal/http/router"
	"protect-user-auth/internal/infrastructure/database"
	"protect-user-auth/internal/infrastructure/oauth"
	"protect-user-auth/internal/infrastructure/oauth/providers"
	"protect-user-auth/internal/infrastructure/repository/blacklist"
	reportRepo "protect-user-auth/internal/infrastructure/repository/report"
	"protect-user-auth/internal/infrastructure/repository/user"
	"protect-user-auth/internal/services/auth"
	"protect-user-auth/internal/services/chat"
	"protect-user-auth/internal/services/passkey"
	reportService "protect-user-auth/internal/services/report"

	"github.com/gin-gonic/gin"
)

// App encapsulates the application router and resources cleanup func
type App struct {
	Router  *gin.Engine
	Cleanup func()
}

// NewApp initializes database connections and wires all application dependencies
func NewApp() (*App, error) {
	// 1. Initialize configuration
	config.LoadConfig()

	// 2. Connect to MongoDB
	database.ConnectDB()
	cleanup := func() {
		database.DisconnectDB()
	}

	// 3. Initialize repositories
	userRepo := user.NewMongoRepository(database.DB)
	blacklistRepo := blacklist.NewMongoRepository(database.DB)
	repRepo := reportRepo.NewMongoRepository(database.DB)

	// 4. Initialize services
	authService := auth.NewService(userRepo, blacklistRepo)
	passkeyService, err := passkey.NewService(userRepo, authService)
	if err != nil {
		cleanup()
		return nil, err
	}
	repService := reportService.NewService(repRepo)
	chatHub := chat.NewHub()
	go chatHub.Run()

	// 5. Initialize OAuth Providers Registry
	oauthRegistry := oauth.NewRegistry()
	oauthRegistry.Register("github", providers.NewGithubProvider())
	oauthRegistry.Register("google", providers.NewGoogleProvider())
	oauthRegistry.Register("microsoft", providers.NewMicrosoftProvider())
	oauthRegistry.Register("telegram", providers.NewTelegramProvider())
	oauthRegistry.Register("facebook", providers.NewFacebookProvider())
	oauthRegistry.Register("apple", providers.NewAppleProvider())

	// 6. Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, oauthRegistry)
	passkeyHandler := handlers.NewPasskeyHandler(passkeyService, authService)
	reportHandler := handlers.NewReportHandler(repService)
	userHandler := handlers.NewUserHandler(authService)
	adminHandler := handlers.NewAdminHandler(authService, repService)
	chatHandler := handlers.NewChatHandler(chatHub, authService)

	// 7. Setup Router
	r := router.SetupRouter(authService, authHandler, passkeyHandler, reportHandler, userHandler, adminHandler, chatHandler)

	return &App{
		Router:  r,
		Cleanup: cleanup,
	}, nil
}
