package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"time"

	"protect-user-auth/config"
	"protect-user-auth/internal/domain/entity"
	"protect-user-auth/internal/http/response"
	"protect-user-auth/internal/services/auth"
	"protect-user-auth/internal/services/report"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AdminHandler struct {
	httpClient    *http.Client
	authService   auth.Service
	reportService report.Service
}

func NewAdminHandler(authService auth.Service, reportService report.Service) *AdminHandler {
	return &AdminHandler{
		httpClient:    &http.Client{Timeout: 10 * time.Second},
		authService:   authService,
		reportService: reportService,
	}
}

func (h *AdminHandler) forwardRequest(c *gin.Context, method string, path string) {
	baseUrl := config.AppConfig.BackendCheckURL
	apiKey := config.AppConfig.BackendCheckAPIKey

	targetURL := baseUrl + path
	if c.Request.URL.RawQuery != "" {
		targetURL = targetURL + "?" + c.Request.URL.RawQuery
	}

	req, err := http.NewRequestWithContext(c.Request.Context(), method, targetURL, c.Request.Body)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	// Set headers
	req.Header.Set("Content-Type", c.GetHeader("Content-Type"))
	req.Header.Set("X-API-Key", apiKey)

	resp, err := h.httpClient.Do(req)
	if err != nil {
		response.SendError(c, http.StatusBadGateway, "BAD_GATEWAY", "failed to contact backend check: "+err.Error())
		return
	}
	defer resp.Body.Close()

	// Write response headers and body
	for k, v := range resp.Header {
		c.Header(k, v[0])
	}
	c.Status(resp.StatusCode)
	_, _ = io.Copy(c.Writer, resp.Body)
}

func (h *AdminHandler) AddScamURL(c *gin.Context) {
	h.forwardRequest(c, "POST", "/api/admin/urls")
}

func (h *AdminHandler) ListScamURLs(c *gin.Context) {
	h.forwardRequest(c, "GET", "/api/admin/urls")
}

func (h *AdminHandler) DeleteScamURL(c *gin.Context) {
	h.forwardRequest(c, "DELETE", "/api/admin/urls/"+c.Param("id"))
}

func (h *AdminHandler) GetStats(c *gin.Context) {
	h.forwardRequest(c, "GET", "/api/admin/stats")
}

func (h *AdminHandler) AddScammer(c *gin.Context) {
	h.forwardRequest(c, "POST", "/api/admin/scammers")
}

func (h *AdminHandler) ListScammers(c *gin.Context) {
	h.forwardRequest(c, "GET", "/api/admin/scammers")
}

func (h *AdminHandler) DeleteScammer(c *gin.Context) {
	h.forwardRequest(c, "DELETE", "/api/admin/scammers/"+c.Param("id"))
}

func (h *AdminHandler) ListUsers(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "20")
	search := c.Query("search")

	page, err := strconv.ParseInt(pageStr, 10, 64)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.ParseInt(limitStr, 10, 64)
	if err != nil || limit < 1 {
		limit = 20
	}

	users, total, err := h.authService.ListUsers(c.Request.Context(), page, limit, search)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "DATABASE_ERROR", err.Error())
		return
	}

	type UserItem struct {
		ID        primitive.ObjectID `json:"id"`
		Username  string             `json:"username"`
		Email     string             `json:"email"`
		Name      string             `json:"name"`
		Role      string             `json:"role"`
		Status    string             `json:"status"`
		IPAddress string             `json:"ip_address"`
		CreatedAt time.Time          `json:"created_at"`
	}

	userItems := []UserItem{}
	for _, u := range users {
		status := u.Status
		if status == "" {
			status = "active"
		}
		ipAddr := u.IPAddress
		if ipAddr == "" {
			ipAddr = "127.0.0.1"
		}
		userItems = append(userItems, UserItem{
			ID:        u.ID,
			Username:  u.Username,
			Email:     u.Email,
			Name:      u.Name,
			Role:      u.Role,
			Status:    status,
			IPAddress: ipAddr,
			CreatedAt: u.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
			"users": userItems,
		},
	})
}

func (h *AdminHandler) GetUserDetails(c *gin.Context) {
	userIDStr := c.Param("id")
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		response.SendError(c, http.StatusBadRequest, "INVALID_ID", "invalid user ID format")
		return
	}

	user, err := h.authService.FindUserByID(c.Request.Context(), userID)
	if err != nil {
		response.SendError(c, http.StatusNotFound, "NOT_FOUND", "user not found")
		return
	}
	if user == nil {
		response.SendError(c, http.StatusNotFound, "NOT_FOUND", "user not found")
		return
	}

	// Get report stats by user's email
	stats, err := h.reportService.GetReportStatsByReporter(c.Request.Context(), user.Email, "")
	if err != nil {
		stats = map[string]int64{"total": 0, "pending": 0, "approved": 0, "rejected": 0}
	}

	// Get reports submitted by this user
	reports, _, err := h.reportService.GetReportsByReporter(c.Request.Context(), user.Email, "", 1, 100)
	if err != nil {
		reports = []entity.Report{}
	}

	type ReportItem struct {
		ID        primitive.ObjectID `json:"id"`
		Target    string             `json:"target"`
		Type      string             `json:"type"` // "Link" or "Scammer"
		Status    string             `json:"status"`
		CreatedAt time.Time          `json:"created_at"`
	}

	pendingReports := []ReportItem{}
	for _, r := range reports {
		if r.Status == entity.ReportStatusPending {
			target := r.Raw.URL
			if r.Type == entity.ReportTypeScammer {
				target = r.Raw.Title
			}
			repType := "Link"
			if r.Type == entity.ReportTypeScammer {
				repType = "Scammer"
			}

			pendingReports = append(pendingReports, ReportItem{
				ID:        r.ID,
				Target:    target,
				Type:      repType,
				Status:    r.Status,
				CreatedAt: r.CreatedAt,
			})
		}
	}

	status := user.Status
	if status == "" {
		status = "active"
	}
	ipAddr := user.IPAddress
	if ipAddr == "" {
		ipAddr = "127.0.0.1"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user": gin.H{
				"id":         user.ID,
				"name":       user.Name,
				"email":      user.Email,
				"role":       user.Role,
				"status":     status,
				"ip_address": ipAddr,
				"created_at": user.CreatedAt,
			},
			"stats": gin.H{
				"pending":  stats["pending"],
				"approved": stats["approved"],
				"rejected": stats["rejected"],
				"total":    stats["total"],
			},
			"pending_reports": pendingReports,
		},
	})
}

func (h *AdminHandler) GetDashboardStats(c *gin.Context) {
	ctx := c.Request.Context()

	// 1. Get user stats from authService
	totalUsers, newUsersToday, err := h.authService.GetStats(ctx)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "DATABASE_ERROR", "failed to fetch user stats: "+err.Error())
		return
	}

	// 2. Get weekly report stats from reportService
	weeklyReportCounts, weeklyReportTotal, err := h.reportService.GetWeeklyStats(ctx)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "DATABASE_ERROR", "failed to fetch weekly report stats: "+err.Error())
		return
	}

	// 3. Get url, allowlist, and scammer stats from backend check
	baseUrl := config.AppConfig.BackendCheckURL
	apiKey := config.AppConfig.BackendCheckAPIKey
	targetURL := baseUrl + "/api/admin/stats"

	req, err := http.NewRequestWithContext(ctx, "GET", targetURL, nil)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to create request to backend check: "+err.Error())
		return
	}
	req.Header.Set("X-API-Key", apiKey)

	resp, err := h.httpClient.Do(req)
	if err != nil {
		response.SendError(c, http.StatusBadGateway, "BAD_GATEWAY", "failed to contact backend check: "+err.Error())
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		var errData struct {
			Message string `json:"message"`
			Status  string `json:"status"`
			Error   string `json:"error"`
		}
		errMsg := "backend check stats returned error"
		if err := json.Unmarshal(respBody, &errData); err == nil {
			if errData.Message != "" {
				errMsg = errData.Message
			} else if errData.Error != "" {
				errMsg = errData.Error
			}
		} else if len(respBody) > 0 {
			errMsg = string(respBody)
		}
		response.SendError(c, resp.StatusCode, "BAD_GATEWAY", errMsg)
		return
	}

	var checkStats struct {
		TotalChecks       int64            `json:"total_checks"`
		MaliciousChecks   int64            `json:"malicious_checks"`
		SuspiciousChecks  int64            `json:"suspicious_checks"`
		SafeChecks        int64            `json:"safe_checks"`
		TotalScamURLs     int64            `json:"total_scam_urls"`
		TotalAllowlist    int64            `json:"total_allowlist"`
		TotalScammers     int64            `json:"total_scammers"`
		CategoryBreakdown map[string]int64 `json:"category_breakdown"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&checkStats); err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", "failed to decode backend check stats: "+err.Error())
		return
	}

	// 4. Return combined stats
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"users": gin.H{
				"total":     totalUsers,
				"new_today": newUsersToday,
			},
			"reports": gin.H{
				"weekly_total": weeklyReportTotal,
				"weekly_days":  weeklyReportCounts,
			},
			"scam_urls":  checkStats.TotalScamURLs,
			"allowlist":  checkStats.TotalAllowlist,
			"scam_users": checkStats.TotalScammers,
			"checks": gin.H{
				"total":      checkStats.TotalChecks,
				"malicious":  checkStats.MaliciousChecks,
				"suspicious": checkStats.SuspiciousChecks,
				"safe":       checkStats.SafeChecks,
			},
			"categories": checkStats.CategoryBreakdown,
		},
	})
}

func (h *AdminHandler) AddAllowURL(c *gin.Context) {
	h.forwardRequest(c, "POST", "/api/admin/allowlist")
}

func (h *AdminHandler) ListAllowURLs(c *gin.Context) {
	h.forwardRequest(c, "GET", "/api/admin/allowlist")
}

func (h *AdminHandler) DeleteAllowURL(c *gin.Context) {
	h.forwardRequest(c, "DELETE", "/api/admin/allowlist/"+c.Param("id"))
}
