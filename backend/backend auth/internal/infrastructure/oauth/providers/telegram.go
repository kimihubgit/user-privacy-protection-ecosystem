package providers

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"protect-user-auth/internal/dto/request"
)

// TelegramProvider handles signature validation for Telegram Widget Login.
type TelegramProvider struct{}

func NewTelegramProvider() *TelegramProvider {
	return &TelegramProvider{}
}

func (p *TelegramProvider) ResolveProfile(ctx context.Context, req request.SocialLoginRequest) (*request.SocialLoginRequest, error) {
	if req.ProviderID == "" {
		return nil, fmt.Errorf("telegram user id (provider_id) is required")
	}

	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	if botToken == "" {
		return &req, nil
	}

	if req.Code == "" {
		return &req, nil
	}

	params := make(map[string]string)
	parts := strings.Split(req.Code, "&")
	var telegramHash string
	for _, part := range parts {
		kv := strings.SplitN(part, "=", 2)
		if len(kv) == 2 {
			if kv[0] == "hash" {
				telegramHash = kv[1]
			} else {
				params[kv[0]] = kv[1]
			}
		}
	}

	if telegramHash == "" {
		return nil, fmt.Errorf("telegram auth hash missing from code payload")
	}

	if authDateStr, ok := params["auth_date"]; ok {
		authDate, err := strconv.ParseInt(authDateStr, 10, 64)
		if err == nil {
			age := time.Now().Unix() - authDate
			if age > 86400 { // 24 hours
				return nil, fmt.Errorf("telegram authentication data has expired")
			}
		}
	}

	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var dataCheckArr []string
	for _, k := range keys {
		dataCheckArr = append(dataCheckArr, fmt.Sprintf("%s=%s", k, params[k]))
	}
	dataCheckString := strings.Join(dataCheckArr, "\n")

	sha := sha256.New()
	sha.Write([]byte(botToken))
	secretKey := sha.Sum(nil)

	mac := hmac.New(sha256.New, secretKey)
	mac.Write([]byte(dataCheckString))
	expectedHash := hex.EncodeToString(mac.Sum(nil))

	if expectedHash != telegramHash {
		return nil, fmt.Errorf("invalid telegram login signature hash")
	}

	if username, ok := params["username"]; ok && req.Name == "" {
		req.Name = username
	} else if firstName, ok := params["first_name"]; ok && req.Name == "" {
		lastName := params["last_name"]
		if lastName != "" {
			req.Name = firstName + " " + lastName
		} else {
			req.Name = firstName
		}
	}

	if photoURL, ok := params["photo_url"]; ok && req.Avatar == "" {
		req.Avatar = photoURL
	}

	return &req, nil
}
