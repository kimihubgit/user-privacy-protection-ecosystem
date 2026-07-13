package auth

import (
	"context"
	"errors"
	"strings"

	"protect-user-auth/internal/infrastructure/cuckoo"

	"go.mongodb.org/mongo-driver/mongo"
)

func (s *service) CheckEmailExists(ctx context.Context, email string) (bool, error) {
	email = strings.TrimSpace(strings.ToLower(email))

	// Check Cuckoo Filter first
	if cuckoo.EmailFilter != nil && !cuckoo.EmailFilter.Test([]byte("e:"+email)) {
		return false, nil
	}

	_, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (s *service) CheckUsernameExists(ctx context.Context, username string) (bool, error) {
	username = strings.TrimSpace(strings.ToLower(username))

	// Check Cuckoo Filter first
	if cuckoo.EmailFilter != nil && !cuckoo.EmailFilter.Test([]byte("u:"+username)) {
		return false, nil
	}

	_, err := s.userRepo.FindByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}
