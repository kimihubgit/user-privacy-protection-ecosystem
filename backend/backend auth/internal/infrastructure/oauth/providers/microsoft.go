package providers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"protect-user-auth/internal/dto/request"
	"protect-user-auth/internal/infrastructure/oauth"
)

type microsoftProfile struct {
	ID                string `json:"id"`
	DisplayName       string `json:"displayName"`
	Mail              string `json:"mail"`
	UserPrincipalName string `json:"userPrincipalName"`
}

// MicrosoftProvider handles validation for Microsoft Sign-In.
type MicrosoftProvider struct{}

func NewMicrosoftProvider() *MicrosoftProvider {
	return &MicrosoftProvider{}
}

func (p *MicrosoftProvider) ResolveProfile(ctx context.Context, req request.SocialLoginRequest) (*request.SocialLoginRequest, error) {
	if req.Code == "" {
		return nil, fmt.Errorf("oauth code or access token is required for microsoft login")
	}

	profile, err := p.fetchProfile(ctx, req.Code)
	if err != nil {
		return nil, fmt.Errorf("microsoft authentication failed: %w", err)
	}

	if profile.ID == "" {
		return nil, fmt.Errorf("microsoft login failed: empty provider user ID")
	}

	email := profile.Mail
	if email == "" {
		email = profile.UserPrincipalName
	}

	// Overwrite user-supplied fields with verified data from Microsoft Graph
	req.ProviderID = profile.ID
	req.Email = email
	req.Name = profile.DisplayName

	return &req, nil
}

func (p *MicrosoftProvider) fetchProfile(ctx context.Context, accessToken string) (microsoftProfile, error) {
	var profile microsoftProfile
	url := "https://graph.microsoft.com/v1.0/me"

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return profile, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")

	resp, err := oauth.HTTPClient.Do(req)
	if err != nil {
		return profile, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return profile, fmt.Errorf("graph API endpoint returned status %d", resp.StatusCode)
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
