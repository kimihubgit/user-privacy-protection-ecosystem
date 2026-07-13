package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// AllowURL represents a trusted or whitelisted URL/domain that is always safe.
type AllowURL struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	URL         string             `json:"url" bson:"url" binding:"required"`
	Domain      string             `json:"domain" bson:"domain"`
	Description string             `json:"description" bson:"description"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updated_at"`
}
