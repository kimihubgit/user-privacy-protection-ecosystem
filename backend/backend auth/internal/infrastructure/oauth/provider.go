package oauth

import (
	"context"
	"protect-user-auth/internal/dto/request"
)

// Provider defines the interface for resolving and validating profiles across social providers.
type Provider interface {
	ResolveProfile(ctx context.Context, req request.SocialLoginRequest) (*request.SocialLoginRequest, error)
}
