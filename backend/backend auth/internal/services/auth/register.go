package auth

import (
	"bufio"
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"protect-user-auth/config"
	"protect-user-auth/internal/domain/entity"
	"protect-user-auth/internal/dto/request"
	"protect-user-auth/internal/dto/response"
	"protect-user-auth/internal/infrastructure/cuckoo"
	"protect-user-auth/internal/pkg/hash"

	"github.com/go-webauthn/webauthn/webauthn"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var disposableList = make(map[string]struct{}, 4000)

func init() {
	scanner := bufio.NewScanner(strings.NewReader(config.DisposableEmailBlocklist))
	for scanner.Scan() {
		domain := strings.TrimSpace(strings.ToLower(scanner.Text()))
		if domain != "" && !strings.HasPrefix(domain, "#") {
			disposableList[domain] = struct{}{}
		}
	}
}

func isDisposableEmail(email string) bool {
	email = strings.TrimSpace(strings.ToLower(email))
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return true // treat invalid format as invalid/disposable
	}

	domain := parts[1]
	domainParts := strings.Split(domain, ".")

	for i := 0; i < len(domainParts)-1; i++ {
		checkDomain := strings.Join(domainParts[i:], ".")
		if _, ok := disposableList[checkDomain]; ok {
			return true
		}
	}

	return false
}

func (s *service) Register(ctx context.Context, req request.RegisterRequest) (*response.AuthResponse, error) {
	if req.Password != req.RePassword {
		return nil, errors.New("passwords do not match")
	}

	email := strings.TrimSpace(strings.ToLower(req.Email))
	if isDisposableEmail(email) {
		return nil, errors.New("temporary or disposable emails are not allowed")
	}

	username := strings.TrimSpace(strings.ToLower(req.Username))

	if !usernameRegex.MatchString(username) {
		return nil, errors.New("username must be 3-20 characters and contain only lowercase letters, numbers, underscores, or hyphens (no spaces or unicode)")
	}

	// 1. Check Email in Cuckoo Filter
	emailExists := true
	if cuckoo.EmailFilter != nil && !cuckoo.EmailFilter.Test([]byte("e:"+email)) {
		emailExists = false
	}
	if emailExists {
		existingUser, err := s.userRepo.FindByEmail(ctx, email)
		if err == nil && existingUser != nil {
			return nil, errors.New("email already registered")
		}
	}

	// 2. Check Username in Cuckoo Filter
	usernameExists := true
	if cuckoo.EmailFilter != nil && !cuckoo.EmailFilter.Test([]byte("u:"+username)) {
		usernameExists = false
	}
	if usernameExists {
		existingUser, err := s.userRepo.FindByUsername(ctx, username)
		if err == nil && existingUser != nil {
			return nil, errors.New("username already taken")
		}
	}

	hashedPassword, err := hash.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	newUser := &entity.User{
		ID:             primitive.NewObjectID(),
		Username:       username,
		Email:          email,
		Password:       string(hashedPassword),
		Name:           username,
		Role:           "user",
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
		SocialAccounts: []entity.SocialAccount{},
		Passkeys:       []webauthn.Credential{},
	}

	if err := s.userRepo.Create(ctx, newUser); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Add email and username to Cuckoo Filter
	if cuckoo.EmailFilter != nil {
		_ = cuckoo.EmailFilter.Add([]byte("e:" + email))
		_ = cuckoo.EmailFilter.Add([]byte("u:" + username))
	}

	token, err := s.GenerateToken(newUser)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &response.AuthResponse{
		Token: token,
		User: response.UserResponse{
			Username: newUser.Username,
			Email:    newUser.Email,
			Name:     newUser.Name,
			Avatar:   newUser.Avatar,
		},
	}, nil
}
