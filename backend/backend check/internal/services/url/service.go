package url

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	neturl "net/url"
	"strings"
	"time"

	"protect-user-backend/internal/dto/response"
	"protect-user-backend/internal/infrastructure/cache"
	"protect-user-backend/internal/infrastructure/cuckoo"
	urlRepo "protect-user-backend/internal/infrastructure/repository/url"
	"protect-user-backend/internal/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/sync/singleflight"
)

type Service interface {
	NormalizeURL(rawURL string) (string, string, error)
	CheckURL(ctx context.Context, rawURL string, ipAddress, userAgent string) (*response.CheckURLResponse, error)
	AddScamURL(ctx context.Context, scamURL *models.ScamURL) error
	UpdateScamURL(ctx context.Context, id string, scamURL *models.ScamURL) error
	ListURLs(ctx context.Context, page, limit int64, status string) ([]models.ScamURL, int64, error)
	DeleteURL(ctx context.Context, id string) error
	GetStats(ctx context.Context) (*response.StatsResponse, error)

	// Allowlist methods
	AddAllowURL(ctx context.Context, allowURL *models.AllowURL) error
	UpdateAllowURL(ctx context.Context, id string, allowURL *models.AllowURL) error
	DeleteAllowURL(ctx context.Context, id string) error
	ListAllowURLs(ctx context.Context, page, limit int64) ([]models.AllowURL, int64, error)
}

type service struct {
	repo    urlRepo.Repository
	cache   cache.URLCache
	logChan chan *models.CheckLog
	sfGroup singleflight.Group
}

// New initializes the URL Checker service.
func New(repo urlRepo.Repository, urlCache cache.URLCache) Service {
	s := &service{
		repo:    repo,
		cache:   urlCache,
		logChan: make(chan *models.CheckLog, 10000),
	}
	go s.startLogBatchWorker()
	return s
}

func (s *service) NormalizeURL(rawURL string) (string, string, error) {
	cleaned := strings.TrimSpace(rawURL)
	if cleaned == "" {
		return "", "", errors.New("empty URL")
	}

	if !strings.HasPrefix(cleaned, "http://") && !strings.HasPrefix(cleaned, "https://") {
		cleaned = "http://" + cleaned
	}

	u, err := neturl.Parse(cleaned)
	if err != nil {
		return "", "", err
	}

	host := strings.ToLower(u.Host)
	if ipPortIndex := strings.Index(host, ":"); ipPortIndex != -1 {
		port := host[ipPortIndex+1:]
		if port == "80" || port == "443" {
			host = host[:ipPortIndex]
		}
	}

	domain := host
	if strings.HasPrefix(domain, "www.") {
		domain = domain[4:]
	}

	scheme := strings.ToLower(u.Scheme)
	path := u.Path
	if path == "" {
		path = "/"
	}

	normalized := fmt.Sprintf("%s://%s%s", scheme, host, path)
	if u.RawQuery != "" {
		normalized = normalized + "?" + u.RawQuery
	}

	return normalized, domain, nil
}

func addJitter(base time.Duration) time.Duration {
	pct := (rand.Float64() * 0.2) - 0.1
	jitter := time.Duration(float64(base) * pct)
	return base + jitter
}

func (s *service) CheckURL(ctx context.Context, rawURL string, ipAddress, userAgent string) (*response.CheckURLResponse, error) {
	normalizedURL, domain, err := s.NormalizeURL(rawURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse URL: %w", err)
	}

	// 0. Check Cache first to optimize performance
	if cachedRes, found, err := s.cache.Get(ctx, normalizedURL); err == nil && found {
		s.logCheckRequest(cachedRes.URL, domain, ipAddress, userAgent, cachedRes.Status)
		return cachedRes, nil
	}

	// 1. Check Cuckoo Blocklist Filter
	inCuckooBlocklist := false
	if cuckoo.URLFilter != nil {
		if cuckoo.URLFilter.Test([]byte("u:"+normalizedURL)) || cuckoo.URLFilter.Test([]byte("d:"+domain)) {
			inCuckooBlocklist = true
		}
	}

	// --- TRƯỜNG HỢP A: Báo trùng Cuckoo (có khả năng nằm trong blocklist) ---
	if inCuckooBlocklist {
		// Bắt buộc phải tra database xem có thực sự độc hại không
		dbMatch, err := s.repo.GetURLByExactURLOrDomain(ctx, normalizedURL, domain)
		if err != nil {
			return nil, err
		}

		if dbMatch != nil {
			// Có trong database -> KHÔNG AN TOÀN (unsafe)
			res := &response.CheckURLResponse{
				URL:    normalizedURL,
				Status: "unsafe",
			}
			_ = s.cache.Set(ctx, normalizedURL, res, addJitter(10*time.Minute))
			s.logCheckRequest(res.URL, domain, ipAddress, userAgent, res.Status)
			return res, nil
		}

		// Không có trong database (Cuckoo báo nhầm) -> Tra tiếp allowlist
		inAllowlist := false
		if cuckoo.URLAllowlist != nil {
			if cuckoo.URLAllowlist.Test("u:"+normalizedURL) || cuckoo.URLAllowlist.Test("d:"+domain) {
				inAllowlist = true
			}
		}

		if inAllowlist {
			// Có trong allowlist -> safe
			res := &response.CheckURLResponse{
				URL:    normalizedURL,
				Status: "safe",
			}
			_ = s.cache.Set(ctx, normalizedURL, res, addJitter(10*time.Minute))
			s.logCheckRequest(res.URL, domain, ipAddress, userAgent, res.Status)
			return res, nil
		}

		// Cả hai đều không có -> not_found
		res := &response.CheckURLResponse{
			URL:    normalizedURL,
			Status: "not_found",
			}
		_ = s.cache.Set(ctx, normalizedURL, res, addJitter(3*time.Minute))
		s.logCheckRequest(res.URL, domain, ipAddress, userAgent, res.Status)
		return res, nil
	}

	// --- TRƯỜNG HỢP B: Cuckoo báo không có trong blocklist ---
	// Kiểm tra tiếp xem allowlist có không
	inAllowlist := false
	if cuckoo.URLAllowlist != nil {
		if cuckoo.URLAllowlist.Test("u:"+normalizedURL) || cuckoo.URLAllowlist.Test("d:"+domain) {
			inAllowlist = true
		}
	}

	if inAllowlist {
		// Kiểm tra database để đề phòng Cuckoo bị lọt (False Negative)
		dbMatch, err := s.repo.GetURLByExactURLOrDomain(ctx, normalizedURL, domain)
		if err != nil {
			return nil, err
		}

		if dbMatch != nil {
			// Dù Cuckoo lọt nhưng DB xác nhận độc hại -> unsafe
			res := &response.CheckURLResponse{
				URL:    normalizedURL,
				Status: "unsafe",
			}
			_ = s.cache.Set(ctx, normalizedURL, res, addJitter(10*time.Minute))
			s.logCheckRequest(res.URL, domain, ipAddress, userAgent, res.Status)
			return res, nil
		}

		// Xác thực an toàn (safe)
		res := &response.CheckURLResponse{
			URL:    normalizedURL,
			Status: "safe",
		}
		_ = s.cache.Set(ctx, normalizedURL, res, addJitter(10*time.Minute))
		s.logCheckRequest(res.URL, domain, ipAddress, userAgent, res.Status)
		return res, nil
	}

	// Cả hai đều không có -> not_found
	res := &response.CheckURLResponse{
		URL:    normalizedURL,
		Status: "not_found",
	}
	_ = s.cache.Set(ctx, normalizedURL, res, addJitter(3*time.Minute))
	s.logCheckRequest(res.URL, domain, ipAddress, userAgent, res.Status)
	return res, nil
}

// Helper method to log asynchronously
func (s *service) logCheckRequest(url, domain, ip, ua, result string) {
	logRecord := &models.CheckLog{
		URL:       url,
		Domain:    domain,
		IPAddress: ip,
		UserAgent: ua,
		Result:    result,
		CheckedAt: time.Now(),
	}
	select {
	case s.logChan <- logRecord:
	default:
		fmt.Println("Warning: Check log queue is full, dropping log")
	}
}

func (s *service) AddScamURL(ctx context.Context, scamURL *models.ScamURL) error {
	normalized, domain, err := s.NormalizeURL(scamURL.URL)
	if err != nil {
		return fmt.Errorf("invalid URL structure: %w", err)
	}

	scamURL.URL = normalized
	scamURL.Domain = domain

	existing, err := s.repo.GetURLByExactURL(ctx, normalized)
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New("URL already reported and exists in database")
	}

	_ = s.cache.Clear(ctx)

	err = s.repo.InsertURL(ctx, scamURL)
	if err != nil {
		return err
	}

	// Add to Cuckoo Filter
	if cuckoo.URLFilter != nil && (scamURL.Status == models.StatusMalicious || scamURL.Status == models.StatusSuspicious) {
		if scamURL.URL != "" {
			_ = cuckoo.URLFilter.Add([]byte("u:" + scamURL.URL))
		}
		if scamURL.Domain != "" {
			_ = cuckoo.URLFilter.Add([]byte("d:" + scamURL.Domain))
		}
	}

	return nil
}

func (s *service) ListURLs(ctx context.Context, page, limit int64, status string) ([]models.ScamURL, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return s.repo.ListURLs(ctx, page, limit, status)
}

func (s *service) DeleteURL(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid ObjectID format")
	}

	// Retrieve entry first so we can remove from Cuckoo Filter
	entry, err := s.repo.GetURLByID(ctx, objID)
	if err != nil {
		return err
	}

	_ = s.cache.Clear(ctx)

	err = s.repo.DeleteURL(ctx, objID)
	if err != nil {
		return err
	}

	// Delete from Cuckoo Filter
	if entry != nil && cuckoo.URLFilter != nil {
		if entry.URL != "" {
			_ = cuckoo.URLFilter.Delete([]byte("u:" + entry.URL))
		}
		if entry.Domain != "" {
			_ = cuckoo.URLFilter.Delete([]byte("d:" + entry.Domain))
		}
	}

	return nil
}

func (s *service) GetStats(ctx context.Context) (*response.StatsResponse, error) {
	return s.repo.GetStats(ctx)
}

func (s *service) startLogBatchWorker() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	var batch []*models.CheckLog
	maxBatchSize := 100

	flush := func() {
		if len(batch) == 0 {
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := s.repo.InsertCheckLogsBatch(ctx, batch); err != nil {
			fmt.Printf("Error inserting check logs batch: %v\n", err)
		}
		batch = nil
	}

	for {
		select {
		case item, ok := <-s.logChan:
			if !ok {
				flush()
				return
			}
			batch = append(batch, item)
			if len(batch) >= maxBatchSize {
				flush()
			}
		case <-ticker.C:
			flush()
		}
	}
}

func (s *service) AddAllowURL(ctx context.Context, allowURL *models.AllowURL) error {
	normalized, domain, err := s.NormalizeURL(allowURL.URL)
	if err != nil {
		return fmt.Errorf("invalid URL structure: %w", err)
	}
	allowURL.URL = normalized
	allowURL.Domain = domain

	err = s.repo.InsertAllowURL(ctx, allowURL)
	if err != nil {
		return err
	}

	// Update Allowlist in-memory in real-time
	if cuckoo.URLAllowlist != nil {
		if allowURL.URL != "" {
			cuckoo.URLAllowlist.Add("u:" + allowURL.URL)
		}
		if allowURL.Domain != "" {
			cuckoo.URLAllowlist.Add("d:" + allowURL.Domain)
		}
	}

	return nil
}

func (s *service) DeleteAllowURL(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid ID format")
	}

	entry, err := s.repo.GetAllowURLByID(ctx, objID)
	if err != nil {
		return err
	}

	err = s.repo.DeleteAllowURL(ctx, objID)
	if err != nil {
		return err
	}

	// Remove from in-memory Allowlist in real-time
	if entry != nil && cuckoo.URLAllowlist != nil {
		if entry.URL != "" {
			cuckoo.URLAllowlist.Delete("u:" + entry.URL)
		}
		if entry.Domain != "" {
			cuckoo.URLAllowlist.Delete("d:" + entry.Domain)
		}
	}

	return nil
}

func (s *service) ListAllowURLs(ctx context.Context, page, limit int64) ([]models.AllowURL, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return s.repo.ListAllowURLs(ctx, page, limit)
}

func (s *service) UpdateScamURL(ctx context.Context, id string, scamURL *models.ScamURL) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid ObjectID format")
	}

	oldEntry, err := s.repo.GetURLByID(ctx, objID)
	if err != nil {
		return err
	}
	if oldEntry == nil {
		return errors.New("Scam URL not found")
	}

	normalized, domain, err := s.NormalizeURL(scamURL.URL)
	if err != nil {
		return fmt.Errorf("invalid URL structure: %w", err)
	}

	scamURL.URL = normalized
	scamURL.Domain = domain

	// Remove old entry from Cuckoo filter
	if cuckoo.URLFilter != nil {
		if oldEntry.URL != "" {
			_ = cuckoo.URLFilter.Delete([]byte("u:" + oldEntry.URL))
		}
		if oldEntry.Domain != "" {
			_ = cuckoo.URLFilter.Delete([]byte("d:" + oldEntry.Domain))
		}
	}

	_ = s.cache.Clear(ctx)

	err = s.repo.UpdateURL(ctx, objID, scamURL)
	if err != nil {
		return err
	}

	// Add updated entry to Cuckoo filter if malicious/suspicious
	if cuckoo.URLFilter != nil && (scamURL.Status == models.StatusMalicious || scamURL.Status == models.StatusSuspicious) {
		if scamURL.URL != "" {
			_ = cuckoo.URLFilter.Add([]byte("u:" + scamURL.URL))
		}
		if scamURL.Domain != "" {
			_ = cuckoo.URLFilter.Add([]byte("d:" + scamURL.Domain))
		}
	}

	return nil
}

func (s *service) UpdateAllowURL(ctx context.Context, id string, allowURL *models.AllowURL) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid ObjectID format")
	}

	oldEntry, err := s.repo.GetAllowURLByID(ctx, objID)
	if err != nil {
		return err
	}
	if oldEntry == nil {
		return errors.New("Allowlist URL not found")
	}

	normalized, domain, err := s.NormalizeURL(allowURL.URL)
	if err != nil {
		return fmt.Errorf("invalid URL structure: %w", err)
	}
	allowURL.URL = normalized
	allowURL.Domain = domain

	// Remove old entry from Cuckoo Allowlist
	if cuckoo.URLAllowlist != nil {
		if oldEntry.URL != "" {
			cuckoo.URLAllowlist.Delete("u:" + oldEntry.URL)
		}
		if oldEntry.Domain != "" {
			cuckoo.URLAllowlist.Delete("d:" + oldEntry.Domain)
		}
	}

	err = s.repo.UpdateAllowURL(ctx, objID, allowURL)
	if err != nil {
		return err
	}

	// Add updated entry to Cuckoo Allowlist
	if cuckoo.URLAllowlist != nil {
		if allowURL.URL != "" {
			cuckoo.URLAllowlist.Add("u:" + allowURL.URL)
		}
		if allowURL.Domain != "" {
			cuckoo.URLAllowlist.Add("d:" + allowURL.Domain)
		}
	}

	return nil
}
