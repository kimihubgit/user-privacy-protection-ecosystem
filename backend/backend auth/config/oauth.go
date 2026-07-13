package config

import (
	"os"
	"log"
)

// OAuthConfig holds the client IDs and secrets for supported social providers
type OAuthConfig struct {
	GithubClientID     string
	GithubClientSecret string
	GoogleClientID     string
	GoogleClientSecret string
	MicrosoftClientID  string
	MicrosoftClientSecret string
}

// OauthConfig is the global singleton for OAuth configurations
var OauthConfig *OAuthConfig

// LoadOAuthConfig loads the OAuth credentials from environment variables
func LoadOAuthConfig() {
	OauthConfig = &OAuthConfig{
		GithubClientID:        os.Getenv("GITHUB_CLIENT_ID"),
		GithubClientSecret:    os.Getenv("GITHUB_CLIENT_SECRET"),
		GoogleClientID:        os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret:    os.Getenv("GOOGLE_CLIENT_SECRET"),
		MicrosoftClientID:     os.Getenv("MICROSOFT_CLIENT_ID"),
		MicrosoftClientSecret: os.Getenv("MICROSOFT_CLIENT_SECRET"),
	}
	if OauthConfig.GithubClientID == "" || OauthConfig.GithubClientSecret == "" {
		log.Println("[Warning] GitHub OAuth credentials are not fully configured")
	}
	if OauthConfig.GoogleClientID == "" || OauthConfig.GoogleClientSecret == "" {
		log.Println("[Warning] Google OAuth credentials are not fully configured")
	}
	if OauthConfig.MicrosoftClientID == "" || OauthConfig.MicrosoftClientSecret == "" {
		log.Println("[Warning] Microsoft OAuth credentials are not fully configured")
	}
}
