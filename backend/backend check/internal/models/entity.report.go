package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Reporter định nghĩa thông tin người báo cáo
type Reporter struct {
	Name    string    `json:"name" bson:"name"`
	Role    string    `json:"role" bson:"role"`
	IP      string    `json:"ip" bson:"ip"`
	Contact []Contact `json:"contact" bson:"contact"`
}

type Contact struct {
	Type  string `json:"type" bson:"type"`
	Value string `json:"value" bson:"value"`
}

// Loss định nghĩa khoản thiệt hại (có thể rỗng nếu là report URL)
type Loss struct {
	Amount   float64 `json:"amount" bson:"amount"`
	Currency string  `json:"currency" bson:"currency"`
}

// OtherEntities chứa thông tin bóc tách thô từ webform
type OtherEntities struct {
	Web     []string `json:"web" bson:"web"`
	Phone   []string `json:"phone" bson:"phone"`
	Name    []string `json:"name" bson:"name"`
	Address []string `json:"address" bson:"address"`
	Social  []string `json:"social" bson:"social"`
}

// RawData là lõi linh hoạt nhất, gom cả dữ liệu Extension và Webform
type RawData struct {
	Title string `json:"title" bson:"title"`
	// Dành cho cả hai luồng
	URL    string `json:"url,omitempty" bson:"url,omitempty"`       // Chỉ dùng cho Type 1 (Extension)
	Domain string `json:"domain,omitempty" bson:"domain,omitempty"` // Chỉ dùng cho Type 1 (Extension)

	// Dành riêng cho Type 0 (Webform Scammer)
	Detail string         `json:"detail,omitempty" bson:"detail,omitempty"`
	Images []string       `json:"images,omitempty" bson:"images,omitempty"`
	Other  *OtherEntities `json:"other,omitempty" bson:"other,omitempty"`
	Losses []Loss         `json:"losses,omitempty" bson:"losses,omitempty"`
}

type ReportDocument struct {
	ID          primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Status      string             `json:"status" bson:"status"`
	Type        int                `json:"type" bson:"type"` // 0: Scammer, 1: URL độc hại
	Reporter    Reporter           `json:"reporter" bson:"reporter"`
	Raw         RawData            `json:"raw" bson:"raw"`
	CreatedAt   time.Time          `json:"created_at" bson:"created_at"`
	ProcessedAt *time.Time         `json:"processed_at,omitempty" bson:"processed_at,omitempty"`
}

// Report type constants
const (
	ReportTypeScammer = 0 // Báo cáo Scammer
	ReportTypeURL     = 1 // Báo cáo URL độc hại
)

// DomainReport status values
const (
	ReportStatusPending  = "pending"
	ReportStatusApproved = "approved"
	ReportStatusRejected = "rejected"
)
