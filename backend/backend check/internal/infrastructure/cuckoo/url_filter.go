package cuckoo

import (
	"context"
	"log"

	"protect-user-backend/internal/infrastructure/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var URLFilter *Filter

// InitURLFilter initializes the Cuckoo Filter and populates it with existing malicious/suspicious URLs and domains.
func InitURLFilter(db *database.DB) {
	// Size the filter for 1,000,000 expected threat entries (stores up to 4,000,000 slots)
	URLFilter = NewFilter(2000000)

	ctx := context.Background()
	collection := db.Database.Collection("blacklist")

	// Retrieve url and domain fields to minimize network overhead
	filter := bson.M{
		"status": bson.M{"$in": []string{"malicious", "suspicious"}},
	}
	opts := options.Find().SetProjection(bson.M{"url": 1, "domain": 1})
	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		log.Printf("Warning: failed to load existing threat URLs to Cuckoo Filter: %v", err)
		return
	}
	defer cursor.Close(ctx)

	count := 0
	for cursor.Next(ctx) {
		var item struct {
			URL    string `bson:"url"`
			Domain string `bson:"domain"`
		}
		if err := cursor.Decode(&item); err == nil {
			if item.URL != "" {
				_ = URLFilter.Add([]byte("u:" + item.URL))
			}
			if item.Domain != "" {
				_ = URLFilter.Add([]byte("d:" + item.Domain))
			}
			count++
		}
	}

	log.Printf("Cuckoo Filter initialized successfully and cached %d URL threat signatures in-memory", count)
}

