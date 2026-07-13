package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Requester contains user/victim details requesting data removal
type Requester struct {
	Role      string    `json:"role" bson:"role"`
	Contact   []Contact `json:"contact" bson:"contact"`
	IPAddress string    `json:"ip_address" bson:"ip_address"`
}

// TakedownRaw contains reason classification, description, and proof screenshots
type TakedownRaw struct {
	ReasonType      string   `json:"reason_type" bson:"reason_type"`
	TextDescription string   `json:"text_description" bson:"text_description"`
	Images          []string `json:"images" bson:"images"`
}

// TakedownRequest represents a user request to remove/modify a public report
type TakedownRequest struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	ReportID    primitive.ObjectID `json:"report_id" bson:"report_id"`
	Status      string             `json:"status" bson:"status"`
	Requester   Requester          `json:"requester" bson:"requester"`
	Raw         TakedownRaw        `json:"raw" bson:"raw"`
	ProcessedBy *string            `json:"processed_by" bson:"processed_by"`
	AdminNotes  *string            `json:"admin_notes" bson:"admin_notes"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at" bson:"updated_at"`
}
