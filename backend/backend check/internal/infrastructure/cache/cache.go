package cache

import (
	"context"
	"time"

	"protect-user-backend/internal/dto/response"
)

// URLCache defines the contract for caching URL check results.
type URLCache interface {
	Get(ctx context.Context, key string) (*response.CheckURLResponse, bool, error)
	Set(ctx context.Context, key string, res *response.CheckURLResponse, ttl time.Duration) error
	Delete(ctx context.Context, key string) error
	Clear(ctx context.Context) error
	Stats() (hits int64, misses int64)
	Close() error
}
