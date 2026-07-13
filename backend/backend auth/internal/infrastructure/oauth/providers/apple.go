package providers

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"math/big"
	"net/http"
	"strings"
	"time"

	"protect-user-auth/internal/dto/request"
	"protect-user-auth/internal/infrastructure/oauth"
	"github.com/golang-jwt/jwt/v5"
)

type appleJWK struct {
	Kty string `json:"kty"`
	Kid string `json:"kid"`
	Use string `json:"use"`
	Alg string `json:"alg"`
	N   string `json:"n"`
	E   string `json:"e"`
}

type appleJWKS struct {
	Keys []appleJWK `json:"keys"`
}

// AppleProvider handles signature validation for Apple Identity Token (JWT).
type AppleProvider struct{}

func NewAppleProvider() *AppleProvider {
	return &AppleProvider{}
}

func (p *AppleProvider) ResolveProfile(ctx context.Context, req request.SocialLoginRequest) (*request.SocialLoginRequest, error) {
	if req.Code == "" {
		return nil, fmt.Errorf("oauth identity token (code) is required for apple login")
	}

	claims, err := p.verifyIdentityToken(ctx, req.Code)
	if err != nil {
		return nil, fmt.Errorf("apple authentication failed: %w", err)
	}

	sub, _ := claims["sub"].(string)
	if sub == "" {
		return nil, fmt.Errorf("apple login failed: empty provider user ID")
	}

	email, _ := claims["email"].(string)
	
	// Overwrite user-supplied fields with verified data from Apple Identity Token
	req.ProviderID = sub
	req.Email = email
	if req.Name == "" {
		req.Name = strings.Split(email, "@")[0]
	}

	return &req, nil
}

func (p *AppleProvider) verifyIdentityToken(ctx context.Context, identityToken string) (jwt.MapClaims, error) {
	// 1. Fetch Apple's public keys (JWKS)
	jwks, err := p.fetchAppleJWKS(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch Apple JWKS: %w", err)
	}

	// 2. Parse and verify JWT signature using the matching key from JWKS
	token, err := jwt.Parse(identityToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, fmt.Errorf("kid header not found in apple token")
		}

		// Find matching key
		for _, key := range jwks.Keys {
			if key.Kid == kid {
				return p.getPublicKey(key.N, key.E)
			}
		}

		return nil, fmt.Errorf("key id %s not found in Apple JWKS", kid)
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid apple token claims")
	}

	// 3. Verify issuer
	iss, _ := claims["iss"].(string)
	if iss != "https://appleid.apple.com" {
		return nil, fmt.Errorf("invalid token issuer: %s", iss)
	}

	// 4. Verify expiration
	expFloat, ok := claims["exp"].(float64)
	if !ok {
		return nil, fmt.Errorf("missing expiration claim")
	}
	if time.Now().Unix() > int64(expFloat) {
		return nil, fmt.Errorf("apple token has expired")
	}

	return claims, nil
}

func (p *AppleProvider) fetchAppleJWKS(ctx context.Context) (*appleJWKS, error) {
	url := "https://appleid.apple.com/auth/keys"
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := oauth.HTTPClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch apple keys, status: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var jwks appleJWKS
	if err := json.Unmarshal(body, &jwks); err != nil {
		return nil, err
	}

	return &jwks, nil
}

func (p *AppleProvider) getPublicKey(nStr, eStr string) (*rsa.PublicKey, error) {
	decN, err := base64.RawURLEncoding.DecodeString(nStr)
	if err != nil {
		return nil, fmt.Errorf("failed to decode modulus: %w", err)
	}

	decE, err := base64.RawURLEncoding.DecodeString(eStr)
	if err != nil {
		return nil, fmt.Errorf("failed to decode exponent: %w", err)
	}

	var eVal int
	for _, b := range decE {
		eVal = (eVal << 8) | int(b)
	}

	return &rsa.PublicKey{
		N: new(big.Int).SetBytes(decN),
		E: eVal,
	}, nil
}
