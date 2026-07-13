package response

// CheckURLResponse is the response payload returned after checking a URL.
type CheckURLResponse struct {
	URL    string `json:"url"`
	Status string `json:"status"` // "safe", "unsafe", "not_found"
}

// StatsResponse contains statistical aggregation data.
type StatsResponse struct {
	TotalChecks       int64            `json:"total_checks"`
	MaliciousChecks   int64            `json:"malicious_checks"`
	SuspiciousChecks  int64            `json:"suspicious_checks"`
	SafeChecks        int64            `json:"safe_checks"`
	TotalScamURLs     int64            `json:"total_scam_urls"`
	CategoryBreakdown map[string]int64 `json:"category_breakdown"`
}
