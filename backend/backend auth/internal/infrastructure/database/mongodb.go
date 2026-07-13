package database

import (
	"context"
	"log"
	"time"

	"protect-user-auth/config"
	"protect-user-auth/internal/infrastructure/cuckoo"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	CollectionUsers             = "users"
	CollectionBlacklistedTokens = "blacklisted_tokens"
	CollectionReports           = "reports"
)

var MongoClient *mongo.Client
var DB *mongo.Database

func ConnectDB() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Optimize connection pooling for high concurrency
	clientOptions := options.Client().
		ApplyURI(config.AppConfig.MongoURI).
		SetMaxPoolSize(150).
		SetMinPoolSize(10).
		SetMaxConnIdleTime(60 * time.Second)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Ping the database
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}

	log.Println("Successfully connected to MongoDB")
	MongoClient = client
	DB = client.Database(config.AppConfig.MongoDBName)

	// Ensure database indexes are set up
	EnsureIndexes()

	// Initialize Cuckoo Filter for emails
	cuckoo.InitEmailFilter(DB)
}

func EnsureIndexes() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userCollection := DB.Collection(CollectionUsers)

	// 1. Unique Sparse Index on Email (allows fast lookups and handles empty emails from Apple login)
	_, err := userCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true).SetSparse(true),
	})
	if err != nil {
		log.Printf("Warning: failed to create unique sparse index on email: %v", err)
	}

	// 2. Compound Index on Social Accounts for fast social login lookups
	_, err = userCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{
			{Key: "social_accounts.provider", Value: 1},
			{Key: "social_accounts.provider_id", Value: 1},
		},
		Options: options.Index().SetUnique(true).SetSparse(true),
	})
	if err != nil {
		log.Printf("Warning: failed to create compound index on social_accounts: %v", err)
	}

	// 3. Index on Passkey Credential ID
	_, err = userCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "passkeys.id", Value: 1}},
		Options: options.Index().SetSparse(true),
	})
	if err != nil {
		log.Printf("Warning: failed to create index on passkeys.id: %v", err)
	}

	// 4. Unique Sparse Index on Username
	_, err = userCollection.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "username", Value: 1}},
		Options: options.Index().SetUnique(true).SetSparse(true),
	})
	if err != nil {
		log.Printf("Warning: failed to create unique index on username: %v", err)
	}

	log.Println("Database indexes initialized successfully")
}

func DisconnectDB() {
	if MongoClient == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := MongoClient.Disconnect(ctx); err != nil {
		log.Printf("Error disconnecting from MongoDB: %v", err)
	} else {
		log.Println("Disconnected from MongoDB")
	}
}
