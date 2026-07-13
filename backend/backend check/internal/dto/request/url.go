package request

// AddScamURLInput is the payload validated when an admin blocks a URL.
type AddScamURLInput struct {
	URL            string `json:"url" binding:"required"`
	Category       string `json:"category" binding:"required,oneof=phishing scam malware gambling fake_news none"`
	Description    string `json:"description"`
	SourceReportID string `json:"source_report_id"`
}

// CheckURLInput is the payload validated when client checks a URL.
type CheckURLInput struct {
	URL string `json:"url" binding:"required"`
}
