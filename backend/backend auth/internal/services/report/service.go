package report

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"protect-user-auth/config"
	"protect-user-auth/internal/domain/entity"
	"protect-user-auth/internal/domain/repository"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Service interface {
	SubmitReport(ctx context.Context, report *entity.Report) error
	ListReports(ctx context.Context, page, limit int64, status string, reportType *int) ([]entity.Report, int64, error)
	UpdateReportStatus(ctx context.Context, id string, status string, reviewerEmail string, reviewerName string) error
	GetReportsByReporter(ctx context.Context, email string, ip string, page, limit int64) ([]entity.Report, int64, error)
	GetReportStatsByReporter(ctx context.Context, email string, ip string) (map[string]int64, error)
	GetReportByID(ctx context.Context, id string) (*entity.Report, error)
	GetGlobalStats(ctx context.Context) (map[string]int64, error)
	GetWeeklyStats(ctx context.Context) (dailyCounts map[string]int64, total int64, err error)
	GetModeratorStats(ctx context.Context) (stats []repository.ModeratorStat, globalTotal int64, err error)
}

type service struct {
	reportRepo repository.ReportRepository
	httpClient *http.Client
}

func NewService(reportRepo repository.ReportRepository) Service {
	return &service{
		reportRepo: reportRepo,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *service) SubmitReport(ctx context.Context, report *entity.Report) error {
	report.Status = entity.ReportStatusPending
	if report.ID.IsZero() {
		report.ID = primitive.NewObjectID()
	}
	return s.reportRepo.Insert(ctx, report)
}

func (s *service) ListReports(ctx context.Context, page, limit int64, status string, reportType *int) ([]entity.Report, int64, error) {
	return s.reportRepo.List(ctx, page, limit, status, reportType)
}

func (s *service) GetReportsByReporter(ctx context.Context, email string, ip string, page, limit int64) ([]entity.Report, int64, error) {
	return s.reportRepo.GetByReporter(ctx, email, ip, page, limit)
}

func (s *service) GetReportStatsByReporter(ctx context.Context, email string, ip string) (map[string]int64, error) {
	return s.reportRepo.GetStatsByReporter(ctx, email, ip)
}

func (s *service) UpdateReportStatus(ctx context.Context, id string, status string, reviewerEmail string, reviewerName string) error {
	if status != entity.ReportStatusApproved && status != entity.ReportStatusRejected {
		return errors.New("invalid status: must be approved or rejected")
	}

	reportDoc, err := s.reportRepo.FindByID(ctx, id)
	if err != nil {
		return err
	}
	if reportDoc == nil {
		return errors.New("report not found")
	}

	if reportDoc.Status != entity.ReportStatusPending {
		return fmt.Errorf("report is already processed: %s", reportDoc.Status)
	}

	// 1. Update status and reviewer details in database
	err = s.reportRepo.UpdateStatus(ctx, id, status, reviewerEmail, reviewerName)
	if err != nil {
		return err
	}

	// 2. If approved, push to backend check
	if status == entity.ReportStatusApproved {
		go func() {
			bgCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
			defer cancel()
			if err := s.pushToBackendCheck(bgCtx, reportDoc); err != nil {
				fmt.Printf("Error pushing report %s to backend check: %v\n", id, err)
			}
		}()
	}

	return nil
}

func (s *service) pushToBackendCheck(ctx context.Context, r *entity.Report) error {
	baseUrl := config.AppConfig.BackendCheckURL
	apiKey := config.AppConfig.BackendCheckAPIKey

	if r.Type == entity.ReportTypeURL {
		payload := map[string]string{
			"url":              r.Raw.URL,
			"category":         "scam",
			"description":      fmt.Sprintf("Report approved: %s", r.Raw.Title),
			"source_report_id": r.ID.Hex(),
		}
		return s.sendAdminRequest(ctx, baseUrl+"/api/admin/urls", apiKey, payload)
	}

	if r.Type == entity.ReportTypeScammer && r.Raw.Other != nil {
		// Push phone numbers
		for _, p := range r.Raw.Other.Phone {
			if p == "" {
				continue
			}
			payload := map[string]string{
				"target":           p,
				"type":             "phone",
				"name":             strings.Join(r.Raw.Other.Name, " / "),
				"description":      r.Raw.Detail,
				"source_report_id": r.ID.Hex(),
			}
			_ = s.sendAdminRequest(ctx, baseUrl+"/api/admin/scammers", apiKey, payload)
		}

		// Push bank accounts
		for _, bAccount := range r.Raw.Other.BankAccount {
			if bAccount == "" {
				continue
			}
			bankName := ""
			if len(r.Raw.Other.BankName) > 0 {
				bankName = r.Raw.Other.BankName[0]
			}
			payload := map[string]string{
				"target":           bAccount,
				"type":             "bank_account",
				"name":             strings.Join(r.Raw.Other.Name, " / "),
				"bank_name":        bankName,
				"description":      r.Raw.Detail,
				"source_report_id": r.ID.Hex(),
			}
			_ = s.sendAdminRequest(ctx, baseUrl+"/api/admin/scammers", apiKey, payload)
		}

		// Push social accounts
		for _, sProfile := range r.Raw.Other.Social {
			if sProfile == "" {
				continue
			}
			sProfileLower := strings.ToLower(sProfile)
			targetType := "other"
			if strings.Contains(sProfileLower, "facebook.com") || strings.Contains(sProfileLower, "fb.com") || strings.Contains(sProfileLower, "fb.me") {
				targetType = "facebook"
			} else if strings.Contains(sProfileLower, "t.me") || strings.Contains(sProfileLower, "telegram.me") || strings.HasPrefix(sProfile, "@") {
				targetType = "telegram"
			} else if strings.Contains(sProfileLower, "zalo") {
				targetType = "zalo"
			}

			payload := map[string]string{
				"target":           sProfile,
				"type":             targetType,
				"name":             strings.Join(r.Raw.Other.Name, " / "),
				"description":      r.Raw.Detail,
				"source_report_id": r.ID.Hex(),
			}
			_ = s.sendAdminRequest(ctx, baseUrl+"/api/admin/scammers", apiKey, payload)
		}

		// Push websites
		for _, w := range r.Raw.Other.Web {
			if w == "" {
				continue
			}
			payload := map[string]string{
				"url":              w,
				"category":         "scam",
				"description":      fmt.Sprintf("Report scammer details: %s", r.Raw.Detail),
				"source_report_id": r.ID.Hex(),
			}
			_ = s.sendAdminRequest(ctx, baseUrl+"/api/admin/urls", apiKey, payload)
		}
	}

	return nil
}

func (s *service) sendAdminRequest(ctx context.Context, url, apiKey string, payload interface{}) error {
	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", apiKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("backend check returned status %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

func (s *service) GetReportByID(ctx context.Context, id string) (*entity.Report, error) {
	return s.reportRepo.FindByID(ctx, id)
}

func (s *service) GetGlobalStats(ctx context.Context) (map[string]int64, error) {
	return s.reportRepo.GetGlobalStats(ctx)
}

func (s *service) GetWeeklyStats(ctx context.Context) (dailyCounts map[string]int64, total int64, err error) {
	return s.reportRepo.GetWeeklyStats(ctx)
}

func (s *service) GetModeratorStats(ctx context.Context) (stats []repository.ModeratorStat, globalTotal int64, err error) {
	return s.reportRepo.GetModeratorStats(ctx)
}
