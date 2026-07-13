package oauth

import (
	"context"
	"fmt"
	"protect-user-auth/internal/dto/request"
)

// Registry manages registered OAuth/Social login providers.
type Registry struct {
	providers map[string]Provider
}

// NewRegistry creates a new Registry instance.
func NewRegistry() *Registry {
	return &Registry{
		providers: make(map[string]Provider),
	}
}

// Register registers a provider with a name.
func (r *Registry) Register(name string, provider Provider) {
	r.providers[name] = provider
}

// Resolve resolves the profile for a given provider.
func (r *Registry) Resolve(ctx context.Context, name string, req request.SocialLoginRequest) (*request.SocialLoginRequest, error) {
	provider, exists := r.providers[name]
	if !exists {
		return nil, fmt.Errorf("unsupported social provider: %s", name)
	}
	return provider.ResolveProfile(ctx, req)
}
