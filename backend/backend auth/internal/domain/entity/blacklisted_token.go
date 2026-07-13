package entity

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BlacklistedToken struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	TokenHash     string             `bson:"token_hash" json:"token_hash"`
	ExpiresAt     time.Time          `bson:"expires_at" json:"expires_at"` // MongoDB TTL index field
	BlacklistedAt time.Time          `bson:"blacklisted_at" json:"blacklisted_at"`
}
