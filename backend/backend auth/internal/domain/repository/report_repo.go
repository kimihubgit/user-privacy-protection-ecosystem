package repository

import (
	"context"
	"protect-user-auth/internal/domain/entity"
)

type ReportRepository interface {
	InitIndexes(ctx context.Context) error
	Insert(ctx context.Context, report *entity.Report) error
	FindByID(ctx context.Context, id string) (*entity.Report, error)
	List(ctx context.Context, page, limit int64, status string, reportType *int) ([]entity.Report, int64, error)
	UpdateStatus(ctx context.Context, id string, status string) error
	GetByReporter(ctx context.Context, email string, ip string, page, limit int64) ([]entity.Report, int64, error)
	GetStatsByReporter(ctx context.Context, email string, ip string) (map[string]int64, error)
	GetGlobalStats(ctx context.Context) (map[string]int64, error)
	GetWeeklyStats(ctx context.Context) (dailyCounts map[string]int64, total int64, err error)
}
