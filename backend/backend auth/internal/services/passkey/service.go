package passkey

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"protect-user-auth/config"
	"protect-user-auth/internal/domain/entity"
	"protect-user-auth/internal/domain/repository"
	"protect-user-auth/internal/infrastructure/cuckoo"
	"protect-user-auth/internal/services/auth"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Service interface {
	BeginRegistration(ctx context.Context, email string) (*protocol.CredentialCreation, string, error)
	FinishRegistration(ctx context.Context, sessionID string, responseJSON []byte) (*entity.User, error)
	BeginLogin(ctx context.Context, email string) (*protocol.CredentialAssertion, string, error)
	FinishLogin(ctx context.Context, sessionID string, responseJSON []byte) (*entity.User, error)
}

type service struct {
	userRepo    repository.UserRepository
	authService auth.Service
	webAuthn    *webauthn.WebAuthn
	sessions    sync.Map // Map sessionID -> webauthn.SessionData
}

type sessionDataWrapper struct {
	Session    webauthn.SessionData
	UserEmail  string
	IsRegister bool
	CreatedAt  time.Time
}

func NewService(userRepo repository.UserRepository, authService auth.Service) (Service, error) {
	requireResidentKey := true
	w, err := webauthn.New(&webauthn.Config{
		RPID:          config.AppConfig.RPID,
		RPDisplayName: config.AppConfig.RPDisplayName,
		RPOrigins:     config.AppConfig.RPOrigins,
		AuthenticatorSelection: protocol.AuthenticatorSelection{
			RequireResidentKey:      &requireResidentKey,
			ResidentKey:             protocol.ResidentKeyRequirementRequired,
			AuthenticatorAttachment: protocol.Platform,
		},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create WebAuthn instance: %w", err)
	}

	s := &service{
		userRepo:    userRepo,
		authService: authService,
		webAuthn:    w,
	}

	// Periodically clean up old sessions (older than 10 minutes)
	go s.cleanupSessions()

	return s, nil
}

func (s *service) BeginRegistration(ctx context.Context, email string) (*protocol.CredentialCreation, string, error) {
	email = strings.ToLower(email)
	u, err := s.userRepo.FindByEmail(ctx, email)
	if err == nil && u != nil {
		// Existing user: require that the requester is authenticated as this user
		authEmailVal := ctx.Value("authenticatedEmail")
		if authEmailVal == nil {
			return nil, "", errors.New("email already registered. Please log in first to add a passkey")
		}
		authEmail, ok := authEmailVal.(string)
		if !ok || strings.ToLower(authEmail) != email {
			return nil, "", errors.New("unauthorized to register passkey for this email")
		}
	} else {
		if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
			return nil, "", err
		}
		// Create user placeholder in-memory only (do not write to DB yet)
		u = &entity.User{
			ID:             primitive.NewObjectID(),
			Email:          email,
			Name:           email,
			Role:           "user",
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
			SocialAccounts: []entity.SocialAccount{},
			Passkeys:       []webauthn.Credential{},
		}
	}

	options, sessionData, err := s.webAuthn.BeginRegistration(u)
	if err != nil {
		return nil, "", err
	}

	sessionID := generateSessionID()
	s.sessions.Store(sessionID, sessionDataWrapper{
		Session:    *sessionData,
		UserEmail:  email,
		IsRegister: true,
		CreatedAt:  time.Now(),
	})

	return options, sessionID, nil
}

func (s *service) FinishRegistration(ctx context.Context, sessionID string, responseJSON []byte) (*entity.User, error) {
	val, ok := s.sessions.Load(sessionID)
	if !ok {
		return nil, errors.New("session not found or expired")
	}
	s.sessions.Delete(sessionID) // Use-once session

	wrapper := val.(sessionDataWrapper)
	if !wrapper.IsRegister {
		return nil, errors.New("invalid session type")
	}

	email := strings.ToLower(wrapper.UserEmail)
	isNewUser := false

	u, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			isNewUser = true
			var id primitive.ObjectID
			copy(id[:], wrapper.Session.UserID)

			// Generate a unique username from email
			username := strings.Split(email, "@")[0]
			if username == "" {
				username = "user_" + id.Hex()[:8]
			}
			existingUser, _ := s.userRepo.FindByUsername(ctx, username)
			if existingUser != nil {
				username = username + "_" + id.Hex()[:5]
			}

			u = &entity.User{
				ID:             id,
				Username:       username,
				Email:          email,
				Name:           email,
				Role:           "user",
				CreatedAt:      time.Now(),
				UpdatedAt:      time.Now(),
				SocialAccounts: []entity.SocialAccount{},
				Passkeys:       []webauthn.Credential{},
			}
		} else {
			return nil, err
		}
	}

	// Read response using standard bytes mapper
	parsedResponse, err := protocol.ParseCredentialCreationResponseBytes(responseJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to parse credential creation response: %w", err)
	}

	credential, err := s.webAuthn.CreateCredential(u, wrapper.Session, parsedResponse)
	if err != nil {
		return nil, fmt.Errorf("failed to create credential: %w", err)
	}

	// Save the credential
	u.Passkeys = append(u.Passkeys, *credential)

	if isNewUser {
		if err := s.userRepo.Create(ctx, u); err != nil {
			return nil, fmt.Errorf("failed to create user: %w", err)
		}
		// Add new user email and username to Cuckoo Filter
		if cuckoo.EmailFilter != nil {
			if email != "" {
				_ = cuckoo.EmailFilter.Add([]byte("e:" + email))
			}
			if u.Username != "" {
				_ = cuckoo.EmailFilter.Add([]byte("u:" + u.Username))
			}
		}
	} else {
		if err := s.userRepo.Update(ctx, u); err != nil {
			return nil, fmt.Errorf("failed to save credential: %w", err)
		}
	}

	return u, nil
}

func (s *service) BeginLogin(ctx context.Context, email string) (*protocol.CredentialAssertion, string, error) {
	var u *entity.User
	var err error

	if email != "" {
		email = strings.ToLower(email)
		u, err = s.userRepo.FindByEmail(ctx, email)
		if err != nil {
			if errors.Is(err, mongo.ErrNoDocuments) {
				return nil, "", errors.New("user not found")
			}
			return nil, "", err
		}
		if len(u.Passkeys) == 0 {
			return nil, "", errors.New("user does not have any passkeys registered")
		}
	} else {
		// Discoverable login (username-less): create a dummy user with one dummy credential to bypass library check
		dummyCredential := webauthn.Credential{
			ID: []byte("dummy"),
		}
		u = &entity.User{
			ID:       primitive.NewObjectID(),
			Passkeys: []webauthn.Credential{dummyCredential},
		}
	}

	options, sessionData, err := s.webAuthn.BeginLogin(u)
	if err != nil {
		return nil, "", err
	}

	if email == "" {
		// Strip AllowedCredentials so browser prompts for any credential on the device
		options.Response.AllowedCredentials = nil
		// Clear session UserID so ValidateLogin doesn't enforce dummy user ID check
		sessionData.UserID = nil
	}

	sessionID := generateSessionID()
	s.sessions.Store(sessionID, sessionDataWrapper{
		Session:    *sessionData,
		UserEmail:  email,
		IsRegister: false,
		CreatedAt:  time.Now(),
	})

	return options, sessionID, nil
}

func (s *service) FinishLogin(ctx context.Context, sessionID string, responseJSON []byte) (*entity.User, error) {
	val, ok := s.sessions.Load(sessionID)
	if !ok {
		return nil, errors.New("session not found or expired")
	}
	s.sessions.Delete(sessionID) // Use-once session

	wrapper := val.(sessionDataWrapper)
	if wrapper.IsRegister {
		return nil, errors.New("invalid session type")
	}

	parsedResponse, err := protocol.ParseCredentialRequestResponseBytes(responseJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to parse credential assertion response: %w", err)
	}

	var u *entity.User
	if wrapper.UserEmail == "" {
		// Discoverable login: find user by credential ID
		u, err = s.userRepo.FindByCredentialID(ctx, parsedResponse.RawID)
		if err != nil {
			return nil, errors.New("no user found matching this passkey")
		}
	} else {
		// Normal login: find user by email stored in session
		email := strings.ToLower(wrapper.UserEmail)
		u, err = s.userRepo.FindByEmail(ctx, email)
		if err != nil {
			return nil, err
		}
	}

	_, err = s.webAuthn.ValidateLogin(u, wrapper.Session, parsedResponse)
	if err != nil {
		return nil, fmt.Errorf("failed to validate login: %w", err)
	}

	// Login success, update user if needed (e.g. tracking last login time)
	return u, nil
}

func generateSessionID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *service) cleanupSessions() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		s.sessions.Range(func(key, value interface{}) bool {
			wrapper := value.(sessionDataWrapper)
			if time.Since(wrapper.CreatedAt) > 10*time.Minute {
				s.sessions.Delete(key)
			}
			return true
		})
	}
}
