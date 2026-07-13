package providers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"protect-user-auth/config"
	"protect-user-auth/internal/dto/request"
	"protect-user-auth/internal/infrastructure/oauth"
)

type googleProfile struct {
	Sub     string `json:"sub"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
	Aud     string `json:"aud"`
}

// GoogleProvider handles validation for Google Sign-In.
type GoogleProvider struct{}

func NewGoogleProvider() *GoogleProvider {
	return &GoogleProvider{}
}

func (p *GoogleProvider) ResolveProfile(ctx context.Context, req request.SocialLoginRequest) (*request.SocialLoginRequest, error) {
	if req.Code == "" {
		return nil, fmt.Errorf("oauth code or token is required for google login")
	}

	var profile googleProfile
	var err error

	// If it contains two dots, treat it as a Google ID Token (JWT)
	if strings.Count(req.Code, ".") == 2 {
		profile, err = p.verifyIDToken(ctx, req.Code)
	} else {
		// Otherwise, treat it as a Google Access Token
		profile, err = p.verifyAccessToken(ctx, req.Code)
	}

	if err != nil {
		return nil, fmt.Errorf("google authentication failed: %w", err)
	}

	if profile.Sub == "" {
		return nil, fmt.Errorf("google login failed: empty provider user ID")
	}

	// Verify audience if configured
	if config.OauthConfig.GoogleClientID != "" && profile.Aud != "" {
		if profile.Aud != config.OauthConfig.GoogleClientID {
			return nil, fmt.Errorf("google login failed: audience mismatch")
		}
	}

	// Overwrite user-supplied fields with verified data from Google
	req.ProviderID = profile.Sub
	req.Email = profile.Email
	req.Name = profile.Name
	req.Avatar = profile.Picture

	return &req, nil
}

func (p *GoogleProvider) verifyIDToken(ctx context.Context, idToken string) (googleProfile, error) {
	var profile googleProfile
	url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return profile, err
	}

	resp, err := oauth.HTTPClient.Do(req)
	if err != nil {
		return profile, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return profile, fmt.Errorf("tokeninfo endpoint returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return profile, err
	}

	if err := json.Unmarshal(body, &profile); err != nil {
		return profile, err
	}

	return profile, nil
}

func (p *GoogleProvider) verifyAccessToken(ctx context.Context, accessToken string) (googleProfile, error) {
	var profile googleProfile
	url := "https://www.googleapis.com/oauth2/v3/userinfo"

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return profile, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := oauth.HTTPClient.Do(req)
	if err != nil {
		return profile, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return profile, fmt.Errorf("userinfo endpoint returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return profile, err
	}

	if err := json.Unmarshal(body, &profile); err != nil {
		return profile, err
	}

	return profile, nil
}
