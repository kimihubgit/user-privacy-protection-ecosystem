package user

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

// Compile-time check to ensure implementation of the UserRepository interface
var _ domainRepo.UserRepository = (*mongoRepository)(nil)

func NewMongoRepository(db *mongo.Database) domainRepo.UserRepository {
	return &mongoRepository{
		collection: db.Collection(database.CollectionUsers),
	}
}

func (r *mongoRepository) Create(ctx context.Context, user *entity.User) error {
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	if user.ID.IsZero() {
		user.ID = primitive.NewObjectID()
	}
	_, err := r.collection.InsertOne(ctx, user)
	return err
}

func (r *mongoRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*entity.User, error) {
	var user entity.User
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *mongoRepository) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	var user entity.User
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *mongoRepository) FindByUsername(ctx context.Context, username string) (*entity.User, error) {
	var user entity.User
	err := r.collection.FindOne(ctx, bson.M{"username": username}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *mongoRepository) FindBySocialAccount(ctx context.Context, provider, providerID string) (*entity.User, error) {
	var user entity.User
	filter := bson.M{
		"social_accounts": bson.M{
			"$elemMatch": bson.M{
				"provider":    provider,
				"provider_id": providerID,
			},
		},
	}
	err := r.collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *mongoRepository) FindByCredentialID(ctx context.Context, credentialID []byte) (*entity.User, error) {
	var user entity.User
	// Search in the passkeys array where the credential ID matches
	filter := bson.M{"passkeys.id": credentialID}
	err := r.collection.FindOne(ctx, filter).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *mongoRepository) Update(ctx context.Context, user *entity.User) error {
	user.UpdatedAt = time.Now()
	_, err := r.collection.ReplaceOne(ctx, bson.M{"_id": user.ID}, user)
	return err
}

func (r *mongoRepository) List(ctx context.Context, page, limit int64, search string) ([]entity.User, int64, error) {
	filter := bson.M{}
	if search != "" {
		filter["$or"] = []bson.M{
			{"name": primitive.Regex{Pattern: search, Options: "i"}},
			{"email": primitive.Regex{Pattern: search, Options: "i"}},
			{"username": primitive.Regex{Pattern: search, Options: "i"}},
		}
	}

	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	skip := (page - 1) * limit
	opts := options.Find().
		SetSkip(skip).
		SetLimit(limit).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var users []entity.User
	if err := cursor.All(ctx, &users); err != nil {
		return nil, 0, err
	}

	if users == nil {
		users = []entity.User{}
	}

	return users, total, nil
}

func (r *mongoRepository) GetStats(ctx context.Context) (total int64, newToday int64, err error) {
	total, err = r.collection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return 0, 0, err
	}

	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	newToday, err = r.collection.CountDocuments(ctx, bson.M{
		"created_at": bson.M{
			"$gte": todayStart,
		},
	})
	if err != nil {
		return total, 0, err
	}

	return total, newToday, nil
}
