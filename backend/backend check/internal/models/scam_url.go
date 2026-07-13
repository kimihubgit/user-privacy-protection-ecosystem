package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ScamURL status values
const (
	StatusMalicious  = "malicious"
	StatusSuspicious = "suspicious"
	StatusSafe       = "safe"
)

// ScamURL categories
const (
	CategoryPhishing = "phishing"
	CategoryScam     = "scam"
	CategoryMalware  = "malware"
	CategoryGambling = "gambling"
	CategoryFakeNews = "fake_news"
	CategoryNone     = "none"
)

// ScamURL represents a reported or analyzed URL record in MongoDB.
type ScamURL struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	URL         string             `json:"url" bson:"url" binding:"required"`
	Domain      string             `json:"domain" bson:"domain"`
	Status      string             `json:"status" bson:"status" binding:"required,oneof=malicious suspicious safe"`
	Category    string             `json:"category" bson:"category" binding:"required,oneof=phishing scam malware gambling fake_news none"`
	Description    string             `json:"description" bson:"description"`
	ReportedBy     string             `json:"reported_by" bson:"reported_by"`
	SourceReportID string             `json:"source_report_id,omitempty" bson:"source_report_id,omitempty"`
	CreatedAt      time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt      time.Time          `json:"updated_at" bson:"updated_at"`
}
