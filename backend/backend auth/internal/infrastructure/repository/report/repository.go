package report

import (
	"context"
	"fmt"
	"log"
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

// Compile-time check to ensure implementation of the ReportRepository interface
var _ domainRepo.ReportRepository = (*mongoRepository)(nil)

func NewMongoRepository(db *mongo.Database) domainRepo.ReportRepository {
	repo := &mongoRepository{
		collection: db.Collection(database.CollectionReports),
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	if err := repo.InitIndexes(ctx); err != nil {
		log.Printf("Warning: Failed to initialize MongoDB reports indexes: %v", err)
	}
	return repo
}

func (r *mongoRepository) InitIndexes(ctx context.Context) error {
	statusIdx := mongo.IndexModel{
		Keys: bson.D{{Key: "status", Value: 1}},
	}
	typeIdx := mongo.IndexModel{
		Keys: bson.D{{Key: "type", Value: 1}},
	}
	createdAtIdx := mongo.IndexModel{
		Keys: bson.D{{Key: "created_at", Value: -1}},
	}

	_, err := r.collection.Indexes().CreateMany(ctx, []mongo.IndexModel{statusIdx, typeIdx, createdAtIdx})
	return err
}

func (r *mongoRepository) Insert(ctx context.Context, report *entity.Report) error {
	report.CreatedAt = time.Now()
	_, err := r.collection.InsertOne(ctx, report)
	return err
}

func (r *mongoRepository) FindByID(ctx context.Context, id string) (*entity.Report, error) {
	var report entity.Report
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid ObjectID format: %w", err)
	}
	err = r.collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&report)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &report, nil
}

func (r *mongoRepository) List(ctx context.Context, page, limit int64, status string, reportType *int) ([]entity.Report, int64, error) {
	filter := bson.M{}
	if status != "" {
		filter["status"] = status
	}
	if reportType != nil {
		filter["type"] = *reportType
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

	var reports []entity.Report
	if err := cursor.All(ctx, &reports); err != nil {
		return nil, 0, err
	}

	if reports == nil {
		reports = []entity.Report{}
	}

	return reports, total, nil
}

func (r *mongoRepository) UpdateStatus(ctx context.Context, id string, status string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid ObjectID format: %w", err)
	}
	filter := bson.M{"_id": objID}
	update := bson.M{
		"$set": bson.M{
			"status":       status,
			"processed_at": time.Now(),
		},
	}
	res, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

func (r *mongoRepository) GetByReporter(ctx context.Context, email string, ip string, page, limit int64) ([]entity.Report, int64, error) {
	filter := bson.M{}
	var orFilters []bson.M
	if email != "" {
		orFilters = append(orFilters, bson.M{"reporter.contact": bson.M{"$elemMatch": bson.M{"type": "email", "value": email}}})
	}
	if ip != "" {
		orFilters = append(orFilters, bson.M{"reporter.ip": ip})
	}
	
	if len(orFilters) > 0 {
		filter["$or"] = orFilters
	} else {
		return []entity.Report{}, 0, nil
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

	var reports []entity.Report
	if err := cursor.All(ctx, &reports); err != nil {
		return nil, 0, err
	}

	if reports == nil {
		reports = []entity.Report{}
	}

	return reports, total, nil
}

func (r *mongoRepository) GetStatsByReporter(ctx context.Context, email string, ip string) (map[string]int64, error) {
	filter := bson.M{}
	var orFilters []bson.M
	if email != "" {
		orFilters = append(orFilters, bson.M{"reporter.contact": bson.M{"$elemMatch": bson.M{"type": "email", "value": email}}})
	}
	if ip != "" {
		orFilters = append(orFilters, bson.M{"reporter.ip": ip})
	}
	
	if len(orFilters) > 0 {
		filter["$or"] = orFilters
	}

	pipeline := []bson.M{
		{"$match": filter},
		{"$group": bson.M{
			"_id": "$status",
			"count": bson.M{"$sum": 1},
		}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	stats := map[string]int64{
		"total":    0,
		"pending":  0,
		"approved": 0,
		"rejected": 0,
	}

	var results []struct {
		Status string `bson:"_id"`
		Count  int64  `bson:"count"`
	}

	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	for _, res := range results {
		status := res.Status
		if status == "" {
			status = "pending"
		}
		stats[status] = res.Count
		stats["total"] += res.Count
	}

	return stats, nil
}

func (r *mongoRepository) GetGlobalStats(ctx context.Context) (map[string]int64, error) {
	pipeline := []bson.M{
		{"$group": bson.M{
			"_id":   "$status",
			"count": bson.M{"$sum": 1},
		}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	stats := map[string]int64{
		"total":    0,
		"pending":  0,
		"approved": 0,
		"rejected": 0,
	}

	var results []struct {
		Status string `bson:"_id"`
		Count  int64  `bson:"count"`
	}

	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	for _, res := range results {
		status := res.Status
		if status == "" {
			status = "pending"
		}
		stats[status] = res.Count
		stats["total"] += res.Count
	}

	return stats, nil
}
