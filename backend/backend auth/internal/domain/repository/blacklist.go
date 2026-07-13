package repository

import (
	"context"
	"time"
)

type BlacklistRepository interface {
	BlacklistToken(ctx context.Context, tokenHash string, expiresAt time.Time) error
	IsTokenBlacklisted(ctx context.Context, tokenHash string) (bool, error)
}
