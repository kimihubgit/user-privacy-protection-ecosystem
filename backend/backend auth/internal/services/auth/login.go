package auth

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"protect-user-auth/internal/domain/entity"
	"protect-user-auth/internal/dto/request"
	"protect-user-auth/internal/dto/response"
	"protect-user-auth/internal/infrastructure/cuckoo"
	"protect-user-auth/internal/pkg/hash"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func (s *service) Login(ctx context.Context, req request.LoginRequest) (*response.AuthResponse, error) {
	username := strings.TrimSpace(strings.ToLower(req.Username))

	// Check Cuckoo Filter first
	if cuckoo.EmailFilter != nil && !cuckoo.EmailFilter.Test([]byte("u:"+username)) {
		return nil, errors.New("invalid username or password")
	}

	u, err := s.userRepo.FindByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, errors.New("invalid username or password")
		}
		return nil, err
	}

	if u.Password == "" {
		return nil, errors.New("this account does not have a password. Please login using social auth or passkey")
	}

	if !hash.CheckPasswordHash(req.Password, u.Password) {
		return nil, errors.New("invalid username or password")
	}

	token, err := s.GenerateToken(u)
	if err != nil {
		return nil, err
	}

	return &response.AuthResponse{
		Token: token,
		User: response.UserResponse{
			ID:        u.ID.Hex(),
			Username:  u.Username,
			Email:     u.Email,
			Name:      u.Name,
			Avatar:    u.Avatar,
			Role:      u.Role,
			CreatedAt: &u.CreatedAt,
		},
	}, nil
}

func (s *service) SocialLogin(ctx context.Context, req request.SocialLoginRequest) (*response.AuthResponse, error) {
	// 1. Try to find user by social account provider & providerID
	u, err := s.userRepo.FindBySocialAccount(ctx, req.Provider, req.ProviderID)
	if err == nil && u != nil {
		// Logged in successfully
		token, err := s.GenerateToken(u)
		if err != nil {
			return nil, err
		}
		return &response.AuthResponse{
			Token: token,
			User: response.UserResponse{
				ID:        u.ID.Hex(),
				Username:  u.Username,
				Email:     u.Email,
				Name:      u.Name,
				Avatar:    u.Avatar,
				Role:      u.Role,
				CreatedAt: &u.CreatedAt,
			},
		}, nil
	}

	// 2. If not found, try to find user by email (if provided)
	email := strings.ToLower(req.Email)
	if email != "" {
		u, err = s.userRepo.FindByEmail(ctx, email)
		if err == nil && u != nil {
			// User exists, but this social account isn't linked yet. Link it!
			u.SocialAccounts = append(u.SocialAccounts, entity.SocialAccount{
				Provider:   req.Provider,
				ProviderID: req.ProviderID,
				LinkedAt:   time.Now(),
			})
			if req.Avatar != "" && u.Avatar == "" {
				u.Avatar = req.Avatar
			}
			err = s.userRepo.Update(ctx, u)
			if err != nil {
				return nil, fmt.Errorf("failed to link social account: %w", err)
			}

			token, err := s.GenerateToken(u)
			if err != nil {
				return nil, err
			}
			return &response.AuthResponse{
				Token: token,
				User: response.UserResponse{
					ID:        u.ID.Hex(),
					Username:  u.Username,
					Email:     u.Email,
					Name:      u.Name,
					Avatar:    u.Avatar,
					Role:      u.Role,
					CreatedAt: &u.CreatedAt,
				},
			}, nil
		}
	}

	// 3. Neither social account nor email exists. Create a brand new user!
	name := req.Name
	if name == "" {
		name = email
	}

	// Generate a unique username from email
	username := strings.Split(email, "@")[0]
	if username == "" {
		username = req.Provider + "_" + req.ProviderID
	}
	existingUser, _ := s.userRepo.FindByUsername(ctx, username)
	if existingUser != nil {
		username = username + "_" + req.ProviderID[:5]
	}

	newUser := &entity.User{
		ID:        primitive.NewObjectID(),
		Username:  username,
		Email:     email,
		Name:      name,
		Role:      "user",
		Avatar:    req.Avatar,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		SocialAccounts: []entity.SocialAccount{
			{
				Provider:   req.Provider,
				ProviderID: req.ProviderID,
				LinkedAt:   time.Now(),
			},
		},
	}

	err = s.userRepo.Create(ctx, newUser)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Add newly created user email and username to Cuckoo Filter
	if cuckoo.EmailFilter != nil {
		if email != "" {
			_ = cuckoo.EmailFilter.Add([]byte("e:" + email))
		}
		_ = cuckoo.EmailFilter.Add([]byte("u:" + username))
	}

	token, err := s.GenerateToken(newUser)
	if err != nil {
		return nil, err
	}

	return &response.AuthResponse{
		Token: token,
		User: response.UserResponse{
			ID:        newUser.ID.Hex(),
			Username:  newUser.Username,
			Email:     newUser.Email,
			Name:      newUser.Name,
			Avatar:    newUser.Avatar,
			Role:      newUser.Role,
			CreatedAt: &newUser.CreatedAt,
		},
	}, nil
}

