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

type facebookPictureData struct {
	URL string `json:"url"`
}

type facebookPicture struct {
	Data facebookPictureData `json:"data"`
}

type facebookProfile struct {
	ID      string          `json:"id"`
	Name    string          `json:"name"`
	Email   string          `json:"email"`
	Picture facebookPicture `json:"picture"`
}

// FacebookProvider handles validation for Facebook Sign-In.
type FacebookProvider struct{}

func NewFacebookProvider() *FacebookProvider {
	return &FacebookProvider{}
}

func (p *FacebookProvider) ResolveProfile(ctx context.Context, req request.SocialLoginRequest) (*request.SocialLoginRequest, error) {
	if req.Code == "" {
		return nil, fmt.Errorf("oauth access token is required for facebook login")
	}

	profile, err := p.fetchProfile(ctx, req.Code)
	if err != nil {
		return nil, fmt.Errorf("facebook authentication failed: %w", err)
	}

	if profile.ID == "" {
		return nil, fmt.Errorf("facebook login failed: empty provider user ID")
	}

	// Overwrite user-supplied fields with verified data from Facebook Graph API
	req.ProviderID = profile.ID
	req.Email = profile.Email
	req.Name = profile.Name
	req.Avatar = profile.Picture.Data.URL

	return &req, nil
}

func (p *FacebookProvider) fetchProfile(ctx context.Context, accessToken string) (facebookProfile, error) {
	var profile facebookProfile
	url := fmt.Sprintf("https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=%s", accessToken)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return profile, err
	}
	req.Header.Set("Accept", "application/json")

	resp, err := oauth.HTTPClient.Do(req)
	if err != nil {
		return profile, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return profile, fmt.Errorf("facebook Graph API returned status %d", resp.StatusCode)
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
