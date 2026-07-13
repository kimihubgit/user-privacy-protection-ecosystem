package providers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"time"

	"protect-user-auth/config"
	"protect-user-auth/internal/dto/request"
)

type githubUser struct {
	ID        int64  `json:"id"`
	Login     string `json:"login"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url"`
}

type githubEmail struct {
	Email    string `json:"email"`
	Primary  bool   `json:"primary"`
	Verified bool   `json:"verified"`
}

// GithubProvider handles token exchange and profile fetching for GitHub.
type GithubProvider struct{}

func NewGithubProvider() *GithubProvider {
	return &GithubProvider{}
}

func (p *GithubProvider) ResolveProfile(ctx context.Context, req request.SocialLoginRequest) (*request.SocialLoginRequest, error) {
	if req.Code == "" {
		return nil, fmt.Errorf("oauth authorization code is required for github login")
	}

	clientID := config.OauthConfig.GithubClientID
	clientSecret := config.OauthConfig.GithubClientSecret

	if clientID == "" || clientSecret == "" {
		return nil, fmt.Errorf("social login provider is temporarily unavailable")
	}

	// 1. Exchange code for access token
	tokenReqBody, _ := json.Marshal(map[string]string{
		"client_id":     clientID,
		"client_secret": clientSecret,
		"code":          req.Code,
	})

	tokenReq, err := http.NewRequestWithContext(ctx, "POST", "https://github.com/login/oauth/access_token", bytes.NewBuffer(tokenReqBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create GitHub token request: %w", err)
	}
	tokenReq.Header.Set("Content-Type", "application/json")
	tokenReq.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(tokenReq)
	if err != nil {
		return nil, fmt.Errorf("failed to contact GitHub OAuth server: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read GitHub token response: %w", err)
	}

	var tokenRes struct {
		AccessToken string `json:"access_token"`
		Error       string `json:"error"`
		ErrorDesc   string `json:"error_description"`
	}
	if err := json.Unmarshal(respBytes, &tokenRes); err != nil {
		return nil, fmt.Errorf("failed to parse GitHub token response: %w", err)
	}

	if tokenRes.Error != "" {
		return nil, fmt.Errorf("GitHub OAuth error: %s (%s)", tokenRes.Error, tokenRes.ErrorDesc)
	}

	if tokenRes.AccessToken == "" {
		return nil, fmt.Errorf("no access token returned from GitHub")
	}

	// 2. Fetch user profile
	profileReq, err := http.NewRequestWithContext(ctx, "GET", "https://api.github.com/user", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create GitHub profile request: %w", err)
	}
	profileReq.Header.Set("Authorization", "Bearer "+tokenRes.AccessToken)
	profileReq.Header.Set("Accept", "application/json")

	profileResp, err := client.Do(profileReq)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch GitHub profile: %w", err)
	}
	defer profileResp.Body.Close()

	profileBytes, err := io.ReadAll(profileResp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read GitHub profile response: %w", err)
	}

	var gUser githubUser
	if err := json.Unmarshal(profileBytes, &gUser); err != nil {
		return nil, fmt.Errorf("failed to parse GitHub profile: %w", err)
	}

	primaryEmail := gUser.Email

	// 3. If email is private/empty, fetch emails list
	if primaryEmail == "" {
		emailsReq, err := http.NewRequestWithContext(ctx, "GET", "https://api.github.com/user/emails", nil)
		if err == nil {
			emailsReq.Header.Set("Authorization", "Bearer "+tokenRes.AccessToken)
			emailsReq.Header.Set("Accept", "application/json")
			if emailsResp, err := client.Do(emailsReq); err == nil {
				defer emailsResp.Body.Close()
				if emailsBytes, err := io.ReadAll(emailsResp.Body); err == nil {
					var emails []githubEmail
					if err := json.Unmarshal(emailsBytes, &emails); err == nil {
						for _, e := range emails {
							if e.Primary {
								primaryEmail = e.Email
								break
							}
						}
						if primaryEmail == "" && len(emails) > 0 {
							primaryEmail = emails[0].Email
						}
					}
				}
			}
		}
	}

	displayName := gUser.Name
	if displayName == "" {
		displayName = gUser.Login
	}

	// Update the request with fetched info
	req.ProviderID = strconv.FormatInt(gUser.ID, 10)
	req.Email = primaryEmail
	req.Name = displayName
	req.Avatar = gUser.AvatarURL

	return &req, nil
}
