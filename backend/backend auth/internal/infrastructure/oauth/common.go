package oauth

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"protect-user-auth/internal/dto/request"
)

// HTTPClient is a shared HTTP client configured for OAuth requests
var HTTPClient = &http.Client{
	Timeout: 10 * time.Second,
}

// PassThroughProvider is a default provider that trusts the profile information sent by the client.
type PassThroughProvider struct{}

// ResolveProfile returns the profile info as-is since client handles verification
func (p *PassThroughProvider) ResolveProfile(ctx context.Context, req request.SocialLoginRequest) (*request.SocialLoginRequest, error) {
	if req.ProviderID == "" {
		return nil, fmt.Errorf("provider_id is required for provider %s", req.Provider)
	}
	return &req, nil
}
