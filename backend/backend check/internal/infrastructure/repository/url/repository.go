package url

import (
	"context"
	"log"
	"time"

	"protect-user-backend/internal/dto/response"
	"protect-user-backend/internal/infrastructure/database"
	"protect-user-backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Repository interface {
	InitIndexes(ctx context.Context) error
	InsertURL(ctx context.Context, scamURL *models.ScamURL) error
	GetURLByID(ctx context.Context, id primitive.ObjectID) (*models.ScamURL, error)
	GetURLByExactURL(ctx context.Context, url string) (*models.ScamURL, error)
	GetURLByDomain(ctx context.Context, domain string) (*models.ScamURL, error)
	GetURLByExactURLOrDomain(ctx context.Context, url string, domain string) (*models.ScamURL, error)
	ListURLs(ctx context.Context, page, limit int64, status string) ([]models.ScamURL, int64, error)
	DeleteURL(ctx context.Context, id primitive.ObjectID) error
	InsertCheckLog(ctx context.Context, log *models.CheckLog) error
	InsertCheckLogsBatch(ctx context.Context, logs []*models.CheckLog) error
	GetStats(ctx context.Context) (*response.StatsResponse, error)

	// Allowlist methods
	InsertAllowURL(ctx context.Context, allowURL *models.AllowURL) error
	DeleteAllowURL(ctx context.Context, id primitive.ObjectID) error
	GetAllowURLByID(ctx context.Context, id primitive.ObjectID) (*models.AllowURL, error)
	ListAllowURLs(ctx context.Context, page, limit int64) ([]models.AllowURL, int64, error)
}

type mongoRepository struct {
	db *database.DB
}

// New initializes the MongoDB URL repository.
func New(db *database.DB) Repository {
	repo := &mongoRepository{db: db}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := repo.InitIndexes(ctx); err != nil {
		log.Printf("Warning: Failed to initialize MongoDB indexes: %v", err)
	}
	return repo
}

func (r *mongoRepository) urlsCollection() *mongo.Collection {
	return r.db.Database.Collection(CollectionName)
}

func (r *mongoRepository) logsCollection() *mongo.Collection {
	return r.db.Database.Collection(LogsCollectionName)
}

func (r *mongoRepository) allowlistCollection() *mongo.Collection {
	return r.db.Database.Collection(AllowlistCollectionName)
}

func (r *mongoRepository) InitIndexes(ctx context.Context) error {
	urlsColl := r.urlsCollection()

	urlIdx := mongo.IndexModel{
		Keys:    bson.D{{Key: "url", Value: 1}},
		Options: options.Index().SetUnique(true),
	}
	domainIdx := mongo.IndexModel{
		Keys: bson.D{{Key: "domain", Value: 1}},
	}
	createdAtIdx := mongo.IndexModel{
		Keys: bson.D{{Key: "created_at", Value: -1}},
	}
	statusIdx := mongo.IndexModel{
		Keys: bson.D{{Key: "status", Value: 1}},
	}

	_, err := urlsColl.Indexes().CreateMany(ctx, []mongo.IndexModel{urlIdx, domainIdx, createdAtIdx, statusIdx})
	if err != nil {
		return err
	}

	logsColl := r.logsCollection()
	dateIdx := mongo.IndexModel{
		Keys: bson.D{{Key: "checked_at", Value: -1}},
	}
	logDomainIdx := mongo.IndexModel{
		Keys: bson.D{{Key: "domain", Value: 1}},
	}

	_, err = logsColl.Indexes().CreateMany(ctx, []mongo.IndexModel{dateIdx, logDomainIdx})
	if err != nil {
		return err
	}

	allowlistColl := r.allowlistCollection()
	allowURLIdx := mongo.IndexModel{
		Keys:    bson.D{{Key: "url", Value: 1}},
		Options: options.Index().SetUnique(true),
	}
	allowDomainIdx := mongo.IndexModel{
		Keys: bson.D{{Key: "domain", Value: 1}},
	}
	allowCreatedAtIdx := mongo.IndexModel{
		Keys: bson.D{{Key: "created_at", Value: -1}},
	}
	_, err = allowlistColl.Indexes().CreateMany(ctx, []mongo.IndexModel{allowURLIdx, allowDomainIdx, allowCreatedAtIdx})
	return err
}

func (r *mongoRepository) InsertURL(ctx context.Context, scamURL *models.ScamURL) error {
	scamURL.ID = primitive.NewObjectID()
	scamURL.CreatedAt = time.Now()
	scamURL.UpdatedAt = time.Now()

	_, err := r.urlsCollection().InsertOne(ctx, scamURL)
	return err
}

func (r *mongoRepository) GetURLByID(ctx context.Context, id primitive.ObjectID) (*models.ScamURL, error) {
	var scamURL models.ScamURL
	err := r.urlsCollection().FindOne(ctx, bson.M{"_id": id}).Decode(&scamURL)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &scamURL, nil
}

func (r *mongoRepository) GetURLByExactURL(ctx context.Context, url string) (*models.ScamURL, error) {
	var scamURL models.ScamURL
	err := r.urlsCollection().FindOne(ctx, bson.M{"url": url}).Decode(&scamURL)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &scamURL, nil
}

func (r *mongoRepository) GetURLByDomain(ctx context.Context, domain string) (*models.ScamURL, error) {
	var scamURL models.ScamURL
	opts := options.FindOne().SetSort(bson.D{{Key: "status", Value: 1}})
	err := r.urlsCollection().FindOne(ctx, bson.M{"domain": domain}, opts).Decode(&scamURL)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &scamURL, nil
}

func (r *mongoRepository) GetURLByExactURLOrDomain(ctx context.Context, url string, domain string) (*models.ScamURL, error) {
	filter := bson.M{
		"$or": []bson.M{
			{"url": url},
			{"domain": domain},
		},
	}
	cursor, err := r.urlsCollection().Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var matches []models.ScamURL
	if err := cursor.All(ctx, &matches); err != nil {
		return nil, err
	}

	if len(matches) == 0 {
		return nil, nil
	}

	for _, match := range matches {
		if match.URL == url {
			return &match, nil
		}
	}

	var bestMatch *models.ScamURL
	for i := range matches {
		match := &matches[i]
		if match.Domain == domain {
			if bestMatch == nil {
				bestMatch = match
			} else {
				if getSeverity(match.Status) > getSeverity(bestMatch.Status) {
					bestMatch = match
				}
			}
		}
	}

	return bestMatch, nil
}

func getSeverity(status string) int {
	switch status {
	case "malicious":
		return 3
	case "suspicious":
		return 2
	case "safe":
		return 1
	default:
		return 0
	}
}

func (r *mongoRepository) ListURLs(ctx context.Context, page, limit int64, status string) ([]models.ScamURL, int64, error) {
	coll := r.urlsCollection()
	filter := bson.M{}
	if status != "" {
		filter["status"] = status
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
		SetLimit(limit).
		SetSort(bson.D{{Key: "created_at", Value: -1}})

	cursor, err := coll.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var urls []models.ScamURL
	if err := cursor.All(ctx, &urls); err != nil {
		return nil, 0, err
	}

	if urls == nil {
		urls = []models.ScamURL{}
	}

	return urls, total, nil
}

func (r *mongoRepository) DeleteURL(ctx context.Context, id primitive.ObjectID) error {
	res, err := r.urlsCollection().DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

func (r *mongoRepository) InsertCheckLog(ctx context.Context, log *models.CheckLog) error {
	log.ID = primitive.NewObjectID()
	log.CheckedAt = time.Now()

	_, err := r.logsCollection().InsertOne(ctx, log)
	return err
}

func (r *mongoRepository) InsertCheckLogsBatch(ctx context.Context, logs []*models.CheckLog) error {
	if len(logs) == 0 {
		return nil
	}
	var documents []interface{}
	now := time.Now()
	for _, l := range logs {
		l.ID = primitive.NewObjectID()
		if l.CheckedAt.IsZero() {
			l.CheckedAt = now
		}
		documents = append(documents, l)
	}

	_, err := r.logsCollection().InsertMany(ctx, documents)
	return err
}

func (r *mongoRepository) GetStats(ctx context.Context) (*response.StatsResponse, error) {
	totalChecks, err := r.logsCollection().CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}

	totalScamURLs, err := r.urlsCollection().CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}

	totalAllowlist, err := r.allowlistCollection().CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}

	totalScammers, err := r.db.Database.Collection("scammers").CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}

	resultPipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$result"},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
	}

	cursor, err := r.logsCollection().Aggregate(ctx, resultPipeline)
	var maliciousChecks, suspiciousChecks, safeChecks int64
	if err == nil {
		defer cursor.Close(ctx)
		var results []bson.M
		if err := cursor.All(ctx, &results); err == nil {
			for _, res := range results {
				resID, _ := res["_id"].(string)
				var val int64
				switch v := res["count"].(type) {
				case int32:
					val = int64(v)
				case int64:
					val = v
				}

				switch resID {
				case models.StatusMalicious:
					maliciousChecks = val
				case models.StatusSuspicious:
					suspiciousChecks = val
				case models.StatusSafe:
					safeChecks = val
				}
			}
		}
	}

	catPipeline := mongo.Pipeline{
		{{Key: "$group", Value: bson.D{
			{Key: "_id", Value: "$category"},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
		}}},
	}

	catCursor, err := r.urlsCollection().Aggregate(ctx, catPipeline)
	categoryBreakdown := make(map[string]int64)
	if err == nil {
		defer catCursor.Close(ctx)
		var results []bson.M
		if err := catCursor.All(ctx, &results); err == nil {
			for _, res := range results {
				resID, _ := res["_id"].(string)
				if resID == "" {
					resID = "none"
				}
				var val int64
				switch v := res["count"].(type) {
				case int32:
					val = int64(v)
				case int64:
					val = v
				}
				categoryBreakdown[resID] = val
			}
		}
	}

	return &response.StatsResponse{
		TotalChecks:       totalChecks,
		MaliciousChecks:   maliciousChecks,
		SuspiciousChecks:  suspiciousChecks,
		SafeChecks:        safeChecks,
		TotalScamURLs:     totalScamURLs,
		TotalAllowlist:    totalAllowlist,
		TotalScammers:     totalScammers,
		CategoryBreakdown: categoryBreakdown,
	}, nil
}

func (r *mongoRepository) InsertAllowURL(ctx context.Context, allowURL *models.AllowURL) error {
	allowURL.ID = primitive.NewObjectID()
	allowURL.CreatedAt = time.Now()
	allowURL.UpdatedAt = time.Now()

	_, err := r.allowlistCollection().InsertOne(ctx, allowURL)
	return err
}

func (r *mongoRepository) DeleteAllowURL(ctx context.Context, id primitive.ObjectID) error {
	res, err := r.allowlistCollection().DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

func (r *mongoRepository) GetAllowURLByID(ctx context.Context, id primitive.ObjectID) (*models.AllowURL, error) {
	var allowURL models.AllowURL
	err := r.allowlistCollection().FindOne(ctx, bson.M{"_id": id}).Decode(&allowURL)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &allowURL, nil
}

func (r *mongoRepository) ListAllowURLs(ctx context.Context, page, limit int64) ([]models.AllowURL, int64, error) {
	coll := r.allowlistCollection()
	total, err := coll.EstimatedDocumentCount(ctx)
	if err != nil {
		return nil, 0, err
	}

	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip((page - 1) * limit).
		SetLimit(limit)

	cursor, err := coll.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var urls []models.AllowURL
	if err := cursor.All(ctx, &urls); err != nil {
		return nil, 0, err
	}

	return urls, total, nil
}
