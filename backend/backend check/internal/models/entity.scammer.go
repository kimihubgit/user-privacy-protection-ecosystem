package models

import "go.mongodb.org/mongo-driver/bson/primitive"

// TelegramContact represents Telegram details of a scammer
type TelegramContact struct {
	Username string `json:"username" bson:"username"`
	ID       any    `json:"id" bson:"id"` // can be string, int64 or bson numberLong
}

// FacebookContact represents Facebook details of a scammer
type FacebookContact struct {
	ID   any    `json:"id" bson:"id"`
	Link string `json:"link" bson:"link"`
	Name string `json:"name" bson:"name"`
}

// PhoneContact represents Phone details of a scammer
type PhoneContact struct {
	FullNumber     string   `json:"full_number" bson:"full_number"`
	CountryCode    string   `json:"country_code" bson:"country_code"`
	NationalNumber string   `json:"national_number" bson:"national_number"`
	ISOCountry     string   `json:"iso_country" bson:"iso_country"`
	Carrier        string   `json:"carrier" bson:"carrier"`
	Tag            []string `json:"tag" bson:"tag"`
}

// EmailContact represents Email details of a scammer
type EmailContact struct {
	Address string   `json:"address" bson:"address"`
	Tag     []string `json:"tag" bson:"tag"`
}

// ScammerContact represents all contact channels used by a scammer
type ScammerContact struct {
	Telegram []TelegramContact `json:"telegram" bson:"telegram"`
	Facebook []FacebookContact `json:"facebook" bson:"facebook"`
	Phone    []PhoneContact    `json:"phone" bson:"phone"`
	Email    []EmailContact    `json:"email" bson:"email"`
	Other    []any             `json:"other" bson:"other"`
}

// BankPayment represents a bank account used by a scammer
type BankPayment struct {
	BankName      string `json:"bank_name" bson:"bank_name"`
	ShortName     string `json:"short_name" bson:"short_name"`
	AccountNumber string `json:"account_number" bson:"account_number"`
	AccountHolder string `json:"account_holder" bson:"account_holder"`
	BinCode       string `json:"bin_code" bson:"bin_code"`
}

// WalletPayment represents a mobile wallet used by a scammer
type WalletPayment struct {
	Platform    string `json:"platform" bson:"platform"`
	PhoneNumber string `json:"phone_number" bson:"phone_number"`
	OwnerName   string `json:"owner_name" bson:"owner_name"`
}

// CryptoPayment represents a crypto wallet used by a scammer
type CryptoPayment struct {
	Network string `json:"network" bson:"network"`
	Address string `json:"address" bson:"address"`
	Coin    string `json:"coin" bson:"coin"`
}

// BinancePayment represents a Binance account used by a scammer
type BinancePayment struct {
	BinanceID string   `json:"binance_id" bson:"binance_id"`
	Tag       []string `json:"tag" bson:"tag"`
}

// ScammerPayments represents all payment methods used by a scammer
type ScammerPayments struct {
	Bank    []BankPayment    `json:"bank" bson:"bank"`
	Wallet  []WalletPayment  `json:"wallet" bson:"wallet"`
	Crypto  []CryptoPayment  `json:"crypto" bson:"crypto"`
	Binance []BinancePayment `json:"binance" bson:"binance"`
	Paypal  []any            `json:"paypal" bson:"paypal"`
	Other   []any            `json:"other" bson:"other"`
}

// IncidentRaw holds original scam text and secondary posts
type IncidentRaw struct {
	Detail string   `json:"detail" bson:"detail"`
	Images []string `json:"images" bson:"images"`
	Posts  []string `json:"posts" bson:"posts"`
	Other  []any    `json:"other" bson:"other"`
}

// Incident links scammers and victims together for public tracking
type Incident struct {
	ID             primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Date           string             `json:"date" bson:"date"`
	Status         string             `json:"status" bson:"status"`
	Type           string             `json:"type" bson:"type"`
	Losses         []Loss             `json:"losses" bson:"losses"`
	Reporter       Reporter           `json:"reporter" bson:"reporter"`
	Description    string             `json:"description" bson:"description"`
	SourceReportID string             `json:"source_report_id,omitempty" bson:"source_report_id,omitempty"`
	Raw            IncidentRaw        `json:"raw" bson:"raw"`
}

// Scammer represents the full scammer record in the database
type Scammer struct {
	ID            primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	SearchTargets []string           `json:"search_targets" bson:"search_targets"`
	Contact       ScammerContact     `json:"contact" bson:"contact"`
	Payments      ScammerPayments    `json:"payments" bson:"payments"`
	Incidents     []Incident         `json:"incidents" bson:"incidents"`
}
