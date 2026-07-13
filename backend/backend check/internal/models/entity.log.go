package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CheckLog represents a logged URL check query from a client.
type CheckLog struct {
	ID        primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	URL       string             `json:"url" bson:"url"`
	Domain    string             `json:"domain" bson:"domain"`
	IPAddress string             `json:"ip_address" bson:"ip_address"`
	UserAgent string             `json:"user_agent" bson:"user_agent"`
	Result    string             `json:"result" bson:"result"`
	CheckedAt time.Time          `json:"checked_at" bson:"checked_at"`
}
