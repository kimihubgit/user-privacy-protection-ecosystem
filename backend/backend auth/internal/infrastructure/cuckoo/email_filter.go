package cuckoo

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var EmailFilter *Filter

// InitEmailFilter initializes the Cuckoo Filter and populates it with existing emails and usernames from the database.
func InitEmailFilter(db *mongo.Database) {
	// Size the filter for 1,000,000 expected users (stores up to 4,000,000 slots)
	EmailFilter = NewFilter(2000000)

	ctx := context.Background()
	collection := db.Collection("users")

	// Retrieve email and username fields to minimize network overhead
	opts := options.Find().SetProjection(bson.M{"email": 1, "username": 1})
	cursor, err := collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		log.Printf("Warning: failed to load existing users to Cuckoo Filter: %v", err)
		return
	}
	defer cursor.Close(ctx)

	count := 0
	for cursor.Next(ctx) {
		var u struct {
			Email    string `bson:"email"`
			Username string `bson:"username"`
		}
		if err := cursor.Decode(&u); err == nil {
			if u.Email != "" {
				_ = EmailFilter.Add([]byte("e:" + u.Email))
			}
			if u.Username != "" {
				_ = EmailFilter.Add([]byte("u:" + u.Username))
			}
			count++
		}
	}

	log.Printf("Cuckoo Filter initialized successfully and cached %d user identifiers in-memory", count)
}
