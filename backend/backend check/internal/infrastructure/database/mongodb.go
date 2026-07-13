package database

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type DB struct {
	Client   *mongo.Client
	Database *mongo.Database
}

// ConnectDB establishes connection to MongoDB and pings the database.
func ConnectDB(uri, dbName string) (*DB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Printf("mongo.Connect err: %v", err)
		return nil, err
	}

	// Verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Printf("ping err: %v", err)
		return nil, err
	}

	log.Printf("Successfully connected to MongoDB database: %s", dbName)

	return &DB{
		Client:   client,
		Database: client.Database(dbName),
	}, nil
}

// Close disconnects from the database
func (db *DB) Close() {
	if db.Client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := db.Client.Disconnect(ctx); err != nil {
			log.Printf("Error disconnecting from MongoDB: %v", err)
		} else {
			log.Println("MongoDB connection closed cleanly.")
		}
	}
}
