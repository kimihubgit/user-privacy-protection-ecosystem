package cuckoo

import (
	"context"
	"log"
	"sync"

	"protect-user-backend/internal/infrastructure/database"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Allowlist struct {
	mu      sync.RWMutex
	targets map[string]bool
}

func NewAllowlist() *Allowlist {
	return &Allowlist{
		targets: make(map[string]bool),
	}
}

func (al *Allowlist) Add(target string) {
	al.mu.Lock()
	defer al.mu.Unlock()
	al.targets[target] = true
}

func (al *Allowlist) Delete(target string) {
	al.mu.Lock()
	defer al.mu.Unlock()
	delete(al.targets, target)
}

func (al *Allowlist) Test(target string) bool {
	al.mu.RLock()
	defer al.mu.RUnlock()
	return al.targets[target]
}

var URLAllowlist *Allowlist

// InitURLAllowlist populates the in-memory allowlist map with entries from MongoDB.
func InitURLAllowlist(db *database.DB) {
	URLAllowlist = NewAllowlist()

	ctx := context.Background()
	collection := db.Database.Collection("allow_urls")

	opts := options.Find().SetProjection(bson.M{"url": 1, "domain": 1})
	cursor, err := collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		log.Printf("Warning: failed to load existing allowlist URLs to memory: %v", err)
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
				URLAllowlist.Add("u:" + item.URL)
			}
			if item.Domain != "" {
				URLAllowlist.Add("d:" + item.Domain)
			}
			count++
		}
	}

	log.Printf("URL Allowlist initialized successfully and cached %d allowed URL signatures in-memory", count)
}
