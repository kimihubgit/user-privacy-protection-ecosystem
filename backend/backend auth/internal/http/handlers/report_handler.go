package handlers

import (
	"net/http"
	"strconv"

	"protect-user-auth/internal/domain/entity"
	"protect-user-auth/internal/dto/request"
	"protect-user-auth/internal/http/response"
	"protect-user-auth/internal/services/report"

	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	service report.Service
}

func NewReportHandler(service report.Service) *ReportHandler {
	return &ReportHandler{service: service}
}

func (h *ReportHandler) SubmitReport(c *gin.Context) {
	var input request.SubmitReportInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", response.FormatValidationError(err))
		return
	}

	var contacts []entity.Contact
	for _, cInput := range input.Reporter.Contact {
		contacts = append(contacts, entity.Contact{
			Type:  cInput.Type,
			Value: cInput.Value,
		})
	}

	var losses []entity.Loss
	for _, lInput := range input.Raw.Losses {
		losses = append(losses, entity.Loss{
			Amount:   lInput.Amount,
			Currency: lInput.Currency,
		})
	}

	var other *entity.OtherEntities
	if input.Raw.Other != nil {
		other = &entity.OtherEntities{
			Web:     input.Raw.Other.Web,
			Phone:   input.Raw.Other.Phone,
			Name:    input.Raw.Other.Name,
			Address: input.Raw.Other.Address,
			Social:  input.Raw.Other.Social,
		}
	}

	req := entity.Report{
		Type: *input.Type,
		Reporter: entity.Reporter{
			Name:    input.Reporter.Name,
			Role:    input.Reporter.Role,
			IP:      c.ClientIP(),
			Contact: contacts,
		},
		Raw: entity.RawData{
			Title:  input.Raw.Title,
			URL:    input.Raw.URL,
			Domain: input.Raw.Domain,
			Detail: input.Raw.Detail,
			Images: input.Raw.Images,
			Other:  other,
			Losses: losses,
		},
	}

	// Auto-fill and secure with authenticated user email from JWT
	emailVal, exists := c.Get("email")
	if exists {
		if email, ok := emailVal.(string); ok && email != "" {
			hasEmail := false
			for _, ct := range contacts {
				if ct.Type == "email" && ct.Value == email {
					hasEmail = true
					break
				}
			}
			if !hasEmail {
				req.Reporter.Contact = append(req.Reporter.Contact, entity.Contact{
					Type:  "email",
					Value: email,
				})
			}
		}
	}

	err := h.service.SubmitReport(c.Request.Context(), &req)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Report successfully submitted and pending admin review",
		"data": gin.H{
			"id": req.ID.Hex(),
		},
	})
}

func (h *ReportHandler) GetReporterReports(c *gin.Context) {
	emailVal, exists := c.Get("email")
	if !exists {
		response.SendError(c, http.StatusUnauthorized, "UNAUTHORIZED", "Unauthorized")
		return
	}
	email := emailVal.(string)

	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "20")

	page, err := strconv.ParseInt(pageStr, 10, 64)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.ParseInt(limitStr, 10, 64)
	if err != nil || limit < 1 {
		limit = 20
	}

	// Restrict query parameters only to the logged-in user email
	reports, total, err := h.service.GetReportsByReporter(c.Request.Context(), email, "", page, limit)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	stats, err := h.service.GetReportStatsByReporter(c.Request.Context(), email, "")
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"page":  page,
		"limit": limit,
		"total": total,
		"data":  reports,
		"stats": stats,
	})
}

func (h *ReportHandler) ListReports(c *gin.Context) {
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "20")
	status := c.Query("status")
	typeStr := c.Query("type")

	page, err := strconv.ParseInt(pageStr, 10, 64)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.ParseInt(limitStr, 10, 64)
	if err != nil || limit < 1 {
		limit = 20
	}

	var reportType *int
	if typeStr != "" {
		if t, err := strconv.Atoi(typeStr); err == nil {
			reportType = &t
		}
	}

	reports, total, err := h.service.ListReports(c.Request.Context(), page, limit, status, reportType)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"page":  page,
		"limit": limit,
		"total": total,
		"data":  reports,
	})
}

func (h *ReportHandler) UpdateReportStatus(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", "ID parameter is required")
		return
	}

	var req struct {
		Status string `json:"status" binding:"required,oneof=approved rejected"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.SendError(c, http.StatusBadRequest, "VALIDATION_ERROR", response.FormatValidationError(err))
		return
	}

	err := h.service.UpdateReportStatus(c.Request.Context(), id, req.Status)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "INTERNAL_ERROR", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Report status updated successfully",
	})
}

func (h *ReportHandler) GetReportByID(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		response.SendError(c, http.StatusBadRequest, "INVALID_ID", "ID is required")
		return
	}

	report, err := h.service.GetReportByID(c.Request.Context(), id)
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "DATABASE_ERROR", err.Error())
		return
	}

	if report == nil {
		response.SendError(c, http.StatusNotFound, "NOT_FOUND", "report not found")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    report,
	})
}

func (h *ReportHandler) GetGlobalStats(c *gin.Context) {
	stats, err := h.service.GetGlobalStats(c.Request.Context())
	if err != nil {
		response.SendError(c, http.StatusInternalServerError, "DATABASE_ERROR", err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}
