package entity

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Contact struct {
	Type  string `json:"type" bson:"type"`
	Value string `json:"value" bson:"value"`
}

type Reporter struct {
	Name    string    `json:"name" bson:"name"`
	Role    string    `json:"role" bson:"role"`
	IP      string    `json:"ip" bson:"ip"`
	Contact []Contact `json:"contact" bson:"contact"`
}

type Loss struct {
	Amount   float64 `json:"amount" bson:"amount"`
	Currency string  `json:"currency" bson:"currency"`
}

type OtherEntities struct {
	Web         []string `json:"web" bson:"web"`
	Phone       []string `json:"phone" bson:"phone"`
	Name        []string `json:"name" bson:"name"`
	Address     []string `json:"address" bson:"address"`
	Social      []string `json:"social" bson:"social"`
	BankAccount []string `json:"bank_account,omitempty" bson:"bank_account,omitempty"`
	BankName    []string `json:"bank_name,omitempty" bson:"bank_name,omitempty"`
}

type RawData struct {
	Title  string         `json:"title" bson:"title"`
	URL    string         `json:"url,omitempty" bson:"url,omitempty"`
	Domain string         `json:"domain,omitempty" bson:"domain,omitempty"`
	Detail string         `json:"detail,omitempty" bson:"detail,omitempty"`
	Images []string       `json:"images,omitempty" bson:"images,omitempty"`
	Other  *OtherEntities `json:"other,omitempty" bson:"other,omitempty"`
	Losses []Loss         `json:"losses,omitempty" bson:"losses,omitempty"`
}

type Report struct {
	ID              primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Status          string             `json:"status" bson:"status"`
	Type            int                `json:"type" bson:"type"` // 0: Scammer, 1: URL độc hại
	Reporter        Reporter           `json:"reporter" bson:"reporter"`
	Raw             RawData            `json:"raw" bson:"raw"`
	CreatedAt       time.Time          `json:"created_at" bson:"created_at"`
	ProcessedAt     *time.Time         `json:"processed_at,omitempty" bson:"processed_at,omitempty"`
	ReviewedByEmail string             `json:"reviewed_by_email,omitempty" bson:"reviewed_by_email,omitempty"`
	ReviewedByName  string             `json:"reviewed_by_name,omitempty" bson:"reviewed_by_name,omitempty"`
}

// Report type constants
const (
	ReportTypeScammer = 0
	ReportTypeURL     = 1
)

// Report status values
const (
	ReportStatusPending  = "pending"
	ReportStatusApproved = "approved"
	ReportStatusRejected = "rejected"
)
