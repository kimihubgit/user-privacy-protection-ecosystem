package repository

import (
	"context"
	"protect-user-auth/internal/domain/entity"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	FindByID(ctx context.Context, id primitive.ObjectID) (*entity.User, error)
	FindByEmail(ctx context.Context, email string) (*entity.User, error)
	FindByUsername(ctx context.Context, username string) (*entity.User, error)
	FindBySocialAccount(ctx context.Context, provider, providerID string) (*entity.User, error)
	FindByCredentialID(ctx context.Context, credentialID []byte) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) error
	Delete(ctx context.Context, id primitive.ObjectID) error
	List(ctx context.Context, page, limit int64, search string) ([]entity.User, int64, error)
	GetStats(ctx context.Context) (total int64, newToday int64, err error)
}
