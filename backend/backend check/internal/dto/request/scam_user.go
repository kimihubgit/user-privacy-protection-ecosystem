package request

// AddScamUserInput is the payload validated when blocking a scammer.
type AddScamUserInput struct {
	Target         string `json:"target" binding:"required"`
	Type           string `json:"type" binding:"required,oneof=bank_account phone facebook telegram zalo other"`
	Name           string `json:"name"`
	BankName       string `json:"bank_name"`
	Description    string `json:"description"`
	SourceReportID string `json:"source_report_id"`
}

// CheckScamUserInput is the payload validated when searching a scammer.
type CheckScamUserInput struct {
	Target string `json:"target" binding:"required"`
}
