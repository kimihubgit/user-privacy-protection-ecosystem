package oauth

import "time"

// ProviderConfig represents configuration options for an OAuth provider
type ProviderConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
	Scopes       []string
	Timeout      time.Duration
}
