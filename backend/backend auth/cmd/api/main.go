package main

import (
	"log"

	"protect-user-auth/config"
	"protect-user-auth/bootstrap"
)

func main() {
	app, err := bootstrap.NewApp()
	if err != nil {
		log.Fatalf("Failed to initialize application: %v", err)
	}
	defer app.Cleanup()

	log.Printf("Protect User Auth Service running on port %s", config.AppConfig.Port)
	if err := app.Router.Run(":" + config.AppConfig.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
