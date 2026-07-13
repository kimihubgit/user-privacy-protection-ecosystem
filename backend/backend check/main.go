package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"protect-user-backend/internal/config"
	"protect-user-backend/internal/infrastructure/cuckoo"
	"protect-user-backend/internal/infrastructure/database"
	"protect-user-backend/internal/interfaces/router"
)

func main() {
	log.Println("Starting Malicious/Scam URL Checker backend service...")

	// 1. Load config
	cfg := config.LoadConfig()

	// 2. Connect to database
	db, err := database.ConnectDB(cfg.MongoURI, cfg.MongoDBName)
	if err != nil {
		log.Fatalf("Database connection error: %v", err)
	}
	defer db.Close()

	// 2.5 Initialize Cuckoo Filter & Allowlist
	cuckoo.InitURLFilter(db)
	cuckoo.InitURLAllowlist(db)

	// 3. Setup routes with modular loading
	r := router.SetupRouter(cfg, db)

	// 5. Start HTTP server with graceful shutdown
	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}
	go func() {
		log.Printf("Server is running on port %s", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("ListenAndServe failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting gracefully.")
}
