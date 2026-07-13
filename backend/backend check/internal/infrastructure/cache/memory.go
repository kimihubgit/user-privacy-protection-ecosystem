package cache

import (
	"context"
	"sync"
	"sync/atomic"
	"time"

	"protect-user-backend/internal/dto/response"
)

type memoryCacheItem struct {
	response  *response.CheckURLResponse
	expiresAt time.Time
}

type memoryURLCache struct {
	mu     sync.RWMutex
	items  map[string]memoryCacheItem
	stopCh chan struct{}
	hits   int64
	misses int64
}

// NewMemoryURLCache initializes an in-memory implementation of URLCache.
// It starts a background janitor that runs every cleanupInterval to evict expired items.
func NewMemoryURLCache(cleanupInterval time.Duration) URLCache {
	c := &memoryURLCache{
		items:  make(map[string]memoryCacheItem),
		stopCh: make(chan struct{}),
	}
	go c.startJanitor(cleanupInterval)
	return c
}

func (c *memoryURLCache) Get(ctx context.Context, key string) (*response.CheckURLResponse, bool, error) {
	c.mu.RLock()
	item, found := c.items[key]
	c.mu.RUnlock()

	if !found {
		atomic.AddInt64(&c.misses, 1)
		return nil, false, nil
	}

	if time.Now().After(item.expiresAt) {
		atomic.AddInt64(&c.misses, 1)
		return nil, false, nil
	}

	atomic.AddInt64(&c.hits, 1)
	return item.response, true, nil
}

func (c *memoryURLCache) Set(ctx context.Context, key string, res *response.CheckURLResponse, ttl time.Duration) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = memoryCacheItem{
		response:  res,
		expiresAt: time.Now().Add(ttl),
	}
	return nil
}

func (c *memoryURLCache) Delete(ctx context.Context, key string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	delete(c.items, key)
	return nil
}

func (c *memoryURLCache) Clear(ctx context.Context) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items = make(map[string]memoryCacheItem)
	return nil
}

func (c *memoryURLCache) Stats() (hits int64, misses int64) {
	return atomic.LoadInt64(&c.hits), atomic.LoadInt64(&c.misses)
}

func (c *memoryURLCache) Close() error {
	select {
	case <-c.stopCh:
		// already closed
	default:
		close(c.stopCh)
	}
	return nil
}

func (c *memoryURLCache) startJanitor(interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			c.evictExpired()
		case <-c.stopCh:
			return
		}
	}
}

func (c *memoryURLCache) evictExpired() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now()
	for key, item := range c.items {
		if now.After(item.expiresAt) {
			delete(c.items, key)
		}
	}
}
