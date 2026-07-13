package response

import "protect-user-backend/internal/models"

// CheckScamUserResponse defines the response structure for checking scammers.
type CheckScamUserResponse struct {
	Target    string            `json:"target"`
	IsScam    bool              `json:"is_scam"`
	Scammer   *models.Scammer   `json:"scammer,omitempty"`
	Incidents []models.Incident `json:"incidents,omitempty"`
}
