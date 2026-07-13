package blacklist

import (
	"context"
	"time"

	"protect-user-auth/internal/domain/entity"
	domainRepo "protect-user-auth/internal/domain/repository"
	"protect-user-auth/internal/infrastructure/database"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type mongoRepository struct {
	collection *mongo.Collection
}

// Compile-time check to ensure implementation of the BlacklistRepository interface
var _ domainRepo.BlacklistRepository = (*mongoRepository)(nil)

func NewMongoRepository(db *mongo.Database) domainRepo.BlacklistRepository {
	coll := db.Collection(database.CollectionBlacklistedTokens)

	// Initialize TTL index asynchronously to avoid blocking startup
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		indexModel := mongo.IndexModel{
			Keys:    bson.D{{Key: "expires_at", Value: 1}},
			Options: options.Index().SetExpireAfterSeconds(0), // Delete immediately when expires_at is in the past
		}
		_, _ = coll.Indexes().CreateOne(ctx, indexModel)
	}()

	return &mongoRepository{
		collection: coll,
	}
}

func (r *mongoRepository) BlacklistToken(ctx context.Context, tokenHash string, expiresAt time.Time) error {
	doc := &entity.BlacklistedToken{
		ID:            primitive.NewObjectID(),
		TokenHash:     tokenHash,
		ExpiresAt:     expiresAt,
		BlacklistedAt: time.Now(),
	}

	_, err := r.collection.InsertOne(ctx, doc)
	return err
}

func (r *mongoRepository) IsTokenBlacklisted(ctx context.Context, tokenHash string) (bool, error) {
	var doc entity.BlacklistedToken
	err := r.collection.FindOne(ctx, bson.M{"token_hash": tokenHash}).Decode(&doc)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return false, nil
		}
		return false, err
	}
	return true, nil
}
