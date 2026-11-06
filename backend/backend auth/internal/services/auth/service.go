package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"regexp"
	"time"

	"protect-user-auth/config"
	"protect-user-auth/internal/domain/entity"
	"protect-user-auth/internal/domain/repository"
	"protect-user-auth/internal/dto/request"
	"protect-user-auth/internal/dto/response"
	jwtutil "protect-user-auth/internal/pkg/jwt"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var usernameRegex = regexp.MustCompile(`^[a-z0-9_-]{3,20}$`)

type Service interface {
	Register(ctx context.Context, req request.RegisterRequest) (*response.AuthResponse, error)
	Login(ctx context.Context, req request.LoginRequest) (*response.AuthResponse, error)
	SocialLogin(ctx context.Context, req request.SocialLoginRequest) (*response.AuthResponse, error)
	GenerateToken(user *entity.User) (string, error)
	CheckEmailExists(ctx context.Context, email string) (bool, error)
	CheckUsernameExists(ctx context.Context, username string) (bool, error)
	Logout(ctx context.Context, tokenStr string) error
	IsTokenBlacklisted(ctx context.Context, tokenStr string) (bool, error)

	// Added for Clean Architecture (Resolving handler direct repository call bypass)
	FindUserByID(ctx context.Context, id primitive.ObjectID) (*entity.User, error)
	ListUsers(ctx context.Context, page, limit int64, search string) ([]entity.User, int64, error)
	GetStats(ctx context.Context) (total int64, newToday int64, err error)
	UpdateUserStatus(ctx context.Context, id primitive.ObjectID, status string) error
	UpdateUserRole(ctx context.Context, id primitive.ObjectID, role string) error
	DeleteUser(ctx context.Context, id primitive.ObjectID) error
}

type service struct {
	userRepo      repository.UserRepository
	blacklistRepo repository.BlacklistRepository
}

func NewService(userRepo repository.UserRepository, blacklistRepo repository.BlacklistRepository) Service {
	return &service{
		userRepo:      userRepo,
		blacklistRepo: blacklistRepo,
	}
}

func (s *service) GenerateToken(user *entity.User) (string, error) {
	role := user.Role
	if role == "" {
		role = "user"
	}
	claims := jwt.MapClaims{
		"sub":      user.ID.Hex(),
		"username": user.Username,
		"email":    user.Email,
		"name":     user.Name,
		"role":     role,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
		"iat":      time.Now().Unix(),
		"iss":      "protect-user-auth",
	}

	tokenString, err := jwtutil.GenerateToken(claims, config.AppConfig.PrivateKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (s *service) Logout(ctx context.Context, tokenStr string) error {
	var expTime time.Time
	claims, err := jwtutil.ValidateToken(tokenStr, config.AppConfig.PublicKey)
	if err == nil {
		if expVal, ok := claims["exp"]; ok {
			switch val := expVal.(type) {
			case float64:
				expTime = time.Unix(int64(val), 0)
			case int64:
				expTime = time.Unix(val, 0)
			}
		}
	}

	if expTime.IsZero() {
		expTime = time.Now().Add(24 * time.Hour)
	}

	tokenHash := s.hashToken(tokenStr)
	return s.blacklistRepo.BlacklistToken(ctx, tokenHash, expTime)
}

func (s *service) IsTokenBlacklisted(ctx context.Context, tokenStr string) (bool, error) {
	tokenHash := s.hashToken(tokenStr)
	return s.blacklistRepo.IsTokenBlacklisted(ctx, tokenHash)
}

func (s *service) hashToken(tokenStr string) string {
	hasher := sha256.New()
	hasher.Write([]byte(tokenStr))
	return hex.EncodeToString(hasher.Sum(nil))
}

func (s *service) FindUserByID(ctx context.Context, id primitive.ObjectID) (*entity.User, error) {
	return s.userRepo.FindByID(ctx, id)
}

func (s *service) ListUsers(ctx context.Context, page, limit int64, search string) ([]entity.User, int64, error) {
	return s.userRepo.List(ctx, page, limit, search)
}

func (s *service) GetStats(ctx context.Context) (total int64, newToday int64, err error) {
	return s.userRepo.GetStats(ctx)
}

func (s *service) UpdateUserStatus(ctx context.Context, id primitive.ObjectID, status string) error {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user not found")
	}
	user.Status = status
	return s.userRepo.Update(ctx, user)
}

func (s *service) UpdateUserRole(ctx context.Context, id primitive.ObjectID, role string) error {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if user == nil {
		return errors.New("user not found")
	}
	user.Role = role
	return s.userRepo.Update(ctx, user)
}

func (s *service) DeleteUser(ctx context.Context, id primitive.ObjectID) error {
	return s.userRepo.Delete(ctx, id)
}


