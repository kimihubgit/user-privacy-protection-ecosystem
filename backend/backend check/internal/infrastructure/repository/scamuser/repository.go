package scamuser

import (
	"context"
	"log"
	"strings"
	"time"

	"protect-user-backend/internal/infrastructure/database"
	"protect-user-backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository interface {
	InitIndexes(ctx context.Context) error
	InsertScammer(ctx context.Context, scammer *models.Scammer) error
	UpdateScammer(ctx context.Context, scammer *models.Scammer) error
	FindScammerByTarget(ctx context.Context, target string) (*models.Scammer, error)
	ListScammers(ctx context.Context, page, limit int64, targetType string) ([]models.Scammer, int64, error)
	DeleteScammer(ctx context.Context, id primitive.ObjectID) error
}

type mongoRepository struct {
	db *database.DB
}

// New initializes the MongoDB ScamUser repository.
func New(db *database.DB) Repository {
	repo := &mongoRepository{db: db}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := repo.InitIndexes(ctx); err != nil {
		log.Printf("Warning: Failed to initialize MongoDB scam user indexes: %v", err)
	}
	return repo
}

func (r *mongoRepository) collection() *mongo.Collection {
	return r.db.Database.Collection(CollectionName)
}

func (r *mongoRepository) InitIndexes(ctx context.Context) error {
	idx := mongo.IndexModel{
		Keys: bson.D{{Key: "search_targets", Value: 1}},
	}
	_, err := r.collection().Indexes().CreateOne(ctx, idx)
	return err
}

func (r *mongoRepository) InsertScammer(ctx context.Context, scammer *models.Scammer) error {
	if scammer.ID.IsZero() {
		scammer.ID = primitive.NewObjectID()
	}
	if scammer.SearchTargets == nil {
		scammer.SearchTargets = []string{}
	}
	if scammer.Incidents == nil {
		scammer.Incidents = []models.Incident{}
	}
	_, err := r.collection().InsertOne(ctx, scammer)
	return err
}

func (r *mongoRepository) UpdateScammer(ctx context.Context, scammer *models.Scammer) error {
	filter := bson.M{"_id": scammer.ID}
	update := bson.M{
		"$set": bson.M{
			"search_targets": scammer.SearchTargets,
			"contact":        scammer.Contact,
			"payments":       scammer.Payments,
			"incidents":      scammer.Incidents,
		},
	}
	_, err := r.collection().UpdateOne(ctx, filter, update)
	return err
}

func (r *mongoRepository) FindScammerByTarget(ctx context.Context, target string) (*models.Scammer, error) {
	cleaned := strings.TrimSpace(target)
	if cleaned == "" {
		return nil, nil
	}

	filter := bson.M{"search_targets": cleaned}

	var scammer models.Scammer
	err := r.collection().FindOne(ctx, filter).Decode(&scammer)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &scammer, nil
}

func (r *mongoRepository) ListScammers(ctx context.Context, page, limit int64, targetType string) ([]models.Scammer, int64, error) {
	coll := r.collection()
	filter := bson.M{}

	if targetType != "" {
		switch targetType {
		case "phone":
			filter["contact.phone"] = bson.M{"$exists": true, "$not": bson.M{"$size": 0}}
		case "telegram":
			filter["contact.telegram"] = bson.M{"$exists": true, "$not": bson.M{"$size": 0}}
		case "facebook":
			filter["contact.facebook"] = bson.M{"$exists": true, "$not": bson.M{"$size": 0}}
		case "email":
			filter["contact.email"] = bson.M{"$exists": true, "$not": bson.M{"$size": 0}}
		}
	}

	var total int64
	var err error
	if len(filter) == 0 {
		total, err = coll.EstimatedDocumentCount(ctx)
	} else {
		total, err = coll.CountDocuments(ctx, filter)
	}
	if err != nil {
		return nil, 0, err
	}

	skip := (page - 1) * limit
	opts := options.Find().
		SetSkip(skip).
		SetLimit(limit)

	cursor, err := coll.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var scammers []models.Scammer
	if err := cursor.All(ctx, &scammers); err != nil {
		return nil, 0, err
	}

	if scammers == nil {
		scammers = []models.Scammer{}
	}

	return scammers, total, nil
}

func (r *mongoRepository) DeleteScammer(ctx context.Context, id primitive.ObjectID) error {
	res, err := r.collection().DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}
