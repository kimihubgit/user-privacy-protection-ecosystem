package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"protect-user-backend/internal/infrastructure/database"
	"protect-user-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/likexian/whois"
	whoisparser "github.com/likexian/whois-parser"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SuggestionItem struct {
	Text     string `json:"text"`
	Type     string `json:"type"`     // "url", "scammer"
	Category string `json:"category"` // "scam", "phishing", "malware", "safe", etc.
	Label    string `json:"label"`    // Description/Summary
}

type SearchHandler struct {
	db         *database.DB
	httpClient *http.Client
}

func NewSearchHandler(db *database.DB) *SearchHandler {
	return &SearchHandler{
		db: db,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// GetSuggestions returns quick autocomplete suggestions from URLs and Scammers.
func (h *SearchHandler) GetSuggestions(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if q == "" {
		c.JSON(http.StatusOK, gin.H{"query": q, "suggestions": []SuggestionItem{}})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	suggestions := []SuggestionItem{}

	// Clean input to check if it's numeric only (no alphabet letters, contains digits)
	reg := regexp.MustCompile(`[^\d]`)
	cleanedDigits := reg.ReplaceAllString(q, "")
	hasLetters := regexp.MustCompile(`[a-zA-Z]`).MatchString(q)
	isNumericOnly := !hasLetters && cleanedDigits != ""

	if isNumericOnly {
		// A. Search only scammers by numerical targets (phone / bank accounts) directly
		scamColl := h.db.Database.Collection("scammers")
		subRegex := primitive.Regex{Pattern: regexp.QuoteMeta(cleanedDigits), Options: "i"}
		scamFilter := bson.M{
			"$or": []bson.M{
				{"contact.phone.full_number": subRegex},
				{"payments.bank.account_number": subRegex},
			},
		}
		scamOpts := options.Find().SetLimit(5)
		scamCursor, err := scamColl.Find(ctx, scamFilter, scamOpts)
		if err == nil {
			defer scamCursor.Close(ctx)
			var scammers []models.Scammer
			if err := scamCursor.All(ctx, &scammers); err == nil {
				for _, s := range scammers {
					text := ""
					itemType := "scammer"

					if len(s.Payments.Bank) > 0 {
						bank := s.Payments.Bank[0]
						text = fmt.Sprintf("%s - %s (%s)", bank.AccountNumber, bank.AccountHolder, bank.BankName)
						itemType = "bank_account"
					} else if len(s.Contact.Phone) > 0 {
						text = fmt.Sprintf("%s (SĐT lừa đảo)", s.Contact.Phone[0].FullNumber)
						itemType = "phone"
					} else {
						text = "Đối tượng lừa đảo ẩn danh"
					}

					label := "Nằm trong danh sách đen lừa đảo"
					if len(s.Incidents) > 0 {
						label = s.Incidents[0].Description
					}

					suggestions = append(suggestions, SuggestionItem{
						Text:     text,
						Type:     itemType,
						Category: "scam",
						Label:    label,
					})
				}
			}
		}
	} else {
		// B. Search text-based inputs (URLs, names, social media links) directly

		// Optimization: Strip common URL protocol prefixes and www. to avoid matching all URLs
		cleanedQuery := strings.TrimSpace(q)
		cleanedQuery = strings.TrimPrefix(cleanedQuery, "https://")
		cleanedQuery = strings.TrimPrefix(cleanedQuery, "http://")
		cleanedQuery = strings.TrimPrefix(cleanedQuery, "www.")

		lowerQ := strings.ToLower(strings.TrimSpace(q))
		isProtocolOnly := lowerQ == "http" || lowerQ == "https" || lowerQ == "http:" || lowerQ == "https:" || lowerQ == "http:/" || lowerQ == "https:/" || lowerQ == "http://" || lowerQ == "https://" || lowerQ == "www" || lowerQ == "www."

		// 1. Search scam_urls (using indexed url/domain fields) - skip if user only typed protocol prefix
		// Note: We use prefix-matching (^) here because scam_urls contains a large number of documents.
		// Substring matching on a large collection forces a Full Scan, taking seconds.
		// Prefix matching utilizes the index, taking < 1ms.
		if !isProtocolOnly && cleanedQuery != "" {
			// Convert to lowercase and perform a case-sensitive prefix scan (leverages index range scan directly, taking < 1ms)
			prefixRegex := primitive.Regex{Pattern: "^" + regexp.QuoteMeta(strings.ToLower(cleanedQuery))}
			urlsColl := h.db.Database.Collection("blacklist")
			urlFilter := bson.M{
				"$or": []bson.M{
					{"url": prefixRegex},
					{"domain": prefixRegex},
				},
			}
			urlOpts := options.Find().SetLimit(5)
			urlCursor, err := urlsColl.Find(ctx, urlFilter, urlOpts)
			if err == nil {
				defer urlCursor.Close(ctx)
				var scamURLs []models.ScamURL
				if err := urlCursor.All(ctx, &scamURLs); err == nil {
					for _, item := range scamURLs {
						suggestions = append(suggestions, SuggestionItem{
							Text:     item.URL,
							Type:     "url",
							Category: item.Category,
							Label:    item.Description,
						})
					}
				}
			}
		}

		// 2. Search scammers directly by name or social handle
		// We can keep substring matching here because the scammers collection is small, ensuring flexible matching.
		subRegex := primitive.Regex{Pattern: regexp.QuoteMeta(q), Options: "i"}
		scamColl := h.db.Database.Collection("scammers")
		scamFilter := bson.M{
			"$or": []bson.M{
				{"payments.bank.account_holder": subRegex},
				{"contact.facebook.name": subRegex},
				{"contact.facebook.link": subRegex},
				{"contact.telegram.username": subRegex},
				{"contact.email.address": subRegex},
			},
		}
		scamOpts := options.Find().SetLimit(5)
		scamCursor, err := scamColl.Find(ctx, scamFilter, scamOpts)
		if err == nil {
			defer scamCursor.Close(ctx)
			var scammers []models.Scammer
			if err := scamCursor.All(ctx, &scammers); err == nil {
				for _, s := range scammers {
					text := ""
					itemType := "scammer"

					if len(s.Payments.Bank) > 0 {
						bank := s.Payments.Bank[0]
						text = fmt.Sprintf("%s - %s (%s)", bank.AccountNumber, bank.AccountHolder, bank.BankName)
						itemType = "bank_account"
					} else if len(s.Contact.Phone) > 0 {
						text = fmt.Sprintf("%s (SĐT lừa đảo)", s.Contact.Phone[0].FullNumber)
						itemType = "phone"
					} else if len(s.Contact.Telegram) > 0 {
						text = fmt.Sprintf("@%s (Telegram lừa đảo)", s.Contact.Telegram[0].Username)
						itemType = "telegram"
					} else if len(s.Contact.Facebook) > 0 {
						text = fmt.Sprintf("%s (Facebook lừa đảo)", s.Contact.Facebook[0].Name)
						itemType = "facebook"
					} else if len(s.Contact.Email) > 0 {
						text = fmt.Sprintf("%s (Email lừa đảo)", s.Contact.Email[0].Address)
						itemType = "email"
					} else {
						text = "Đối tượng lừa đảo ẩn danh"
					}

					label := "Nằm trong danh sách đen lừa đảo"
					if len(s.Incidents) > 0 {
						label = s.Incidents[0].Description
					}

					suggestions = append(suggestions, SuggestionItem{
						Text:     text,
						Type:     itemType,
						Category: "scam",
						Label:    label,
					})
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"query":       q,
		"suggestions": suggestions,
	})
}

// detectQueryType classifies the query input automatically into email, url, phone, bank_account, facebook, telegram, or unknown.
func detectQueryType(q string) string {
	q = strings.TrimSpace(q)
	if q == "" {
		return "unknown"
	}

	// 1. Email check
	if strings.Contains(q, "@") && strings.Contains(q, ".") {
		return "email"
	}

	// 2. URL/Domain check
	lower := strings.ToLower(q)
	if strings.HasPrefix(lower, "http://") || strings.HasPrefix(lower, "https://") {
		return "url"
	}
	// General check for domain name structure
	if strings.Contains(q, ".") && !strings.Contains(q, " ") && !strings.Contains(q, "@") {
		return "url"
	}

	// 3. Clean string to extract digits
	reg := regexp.MustCompile(`[^\d]`)
	cleaned := reg.ReplaceAllString(q, "")

	// 4. Phone number vs Bank account
	if len(cleaned) >= 9 && len(cleaned) <= 11 {
		// In Vietnam, phone numbers start with 0 or 84
		if strings.HasPrefix(cleaned, "0") || strings.HasPrefix(cleaned, "84") {
			return "phone"
		}
	}

	// Bank account numbers are typically 6-19 numeric characters
	if len(cleaned) >= 6 && len(cleaned) <= 19 {
		return "bank_account"
	}

	// 5. Check if it's a social media link/handle
	if strings.Contains(lower, "facebook.com") || strings.Contains(lower, "fb.com") || strings.Contains(lower, "fb.me") {
		return "facebook"
	}
	if strings.Contains(lower, "t.me") || strings.HasPrefix(q, "@") {
		return "telegram"
	}

	return "unknown"
}

// Check detects the type of the target query and performs the corresponding check.
func (h *SearchHandler) Check(c *gin.Context) {
	var target string

	// 1. Try reading from Query params
	if q := c.Query("q"); q != "" {
		target = q
	} else if t := c.Query("target"); t != "" {
		target = t
	} else if u := c.Query("url"); u != "" {
		target = u
	}

	// 2. Try reading from JSON body
	if target == "" && (c.Request.Method == http.MethodPost || c.Request.Method == http.MethodPut) {
		var body struct {
			Q      string `json:"q"`
			Target string `json:"target"`
			URL    string `json:"url"`
		}
		if err := c.ShouldBindJSON(&body); err == nil {
			if body.Target != "" {
				target = body.Target
			} else if body.Q != "" {
				target = body.Q
			} else if body.URL != "" {
				target = body.URL
			}
		}
	}

	target = strings.TrimSpace(target)
	if target == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Target query parameter or body field is required"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	detectedType := detectQueryType(target)

	response := gin.H{
		"query": target,
		"type":  detectedType,
	}

	// For logging check count
	checkResult := "safe"

	switch detectedType {
	case "url":
		urlsColl := h.db.Database.Collection("blacklist")
		var scamURL models.ScamURL
		cleanedURL := strings.ToLower(strings.TrimSpace(target))
		domainName := cleanedURL
		domainName = strings.TrimPrefix(domainName, "https://")
		domainName = strings.TrimPrefix(domainName, "http://")
		domainName = strings.TrimPrefix(domainName, "www.")
		if idx := strings.Index(domainName, "/"); idx != -1 {
			domainName = domainName[:idx]
		}

		// 1. Check blacklist first (scam_urls collection) directly in MongoDB (no cuckoo filter errors)
		err := urlsColl.FindOne(ctx, bson.M{
			"$or": []bson.M{
				{"url": cleanedURL},
				{"domain": domainName},
			},
		}).Decode(&scamURL)

		if err == nil {
			// Found in blacklist - return a brief message
			response["is_safe"] = false
			response["is_scam"] = true
			response["message"] = "Phát hiện liên kết nằm trong danh mục độc hại / lừa đảo."
			checkResult = "malicious"
		} else {
			// 2. Not in blacklist, check allowlist directly in MongoDB (no cuckoo filter errors)
			allowColl := h.db.Database.Collection("whitelist")
			var allowURL models.AllowURL
			errAllow := allowColl.FindOne(ctx, bson.M{
				"$or": []bson.M{
					{"url": cleanedURL},
					{"domain": domainName},
				},
			}).Decode(&allowURL)

			if errAllow == nil {
				// Found in allowlist - return a brief message
				response["is_safe"] = true
				response["is_scam"] = false
				response["message"] = "Tên miền an toàn!"
				checkResult = "safe"
			} else {
				// 3. Not in both - return not found / default safe response
				response["is_safe"] = true
				response["is_scam"] = false
				response["message"] = "Không phát hiện mối đe dọa trực tiếp cho URL này trong cơ sở dữ liệu."
				checkResult = "safe"
			}
		}

		// Insert check log
		logsColl := h.db.Database.Collection("logs")
		logEntry := models.CheckLog{
			ID:        primitive.NewObjectID(),
			URL:       cleanedURL,
			Domain:    domainName,
			IPAddress: c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
			Result:    checkResult,
			CheckedAt: time.Now(),
		}
		_, _ = logsColl.InsertOne(ctx, logEntry)

	case "email":
		emailNormalized := strings.ToLower(strings.TrimSpace(target))
		scamColl := h.db.Database.Collection("scammers")
		var scammer models.Scammer
		err := scamColl.FindOne(ctx, bson.M{"contact.email.address": emailNormalized}).Decode(&scammer)
		if err == nil {
			response["is_scam"] = true
			response["is_safe"] = false
			response["detail"] = scammer
		} else {
			response["is_scam"] = false
			response["is_safe"] = true
		}

		// Query breach details from ChongLuaDao
		lang := c.DefaultQuery("lang", "vi")
		targetURL := "https://feeds.chongluadao.vn/checkbreach/email?q=" + url.QueryEscape(emailNormalized) + "&lang=" + url.QueryEscape(lang)

		var breachData map[string]interface{}
		resp, breachErr := h.httpClient.Get(targetURL)
		if breachErr == nil && resp.StatusCode == http.StatusOK {
			defer resp.Body.Close()
			_ = json.NewDecoder(resp.Body).Decode(&breachData)
		}

		if breachData != nil {
			response["breach_detail"] = breachData
		}

	case "phone", "bank_account", "facebook", "telegram":
		cleanedTarget := target
		if detectedType == "phone" || detectedType == "bank_account" {
			reg := regexp.MustCompile(`[^\d]`)
			cleanedTarget = reg.ReplaceAllString(cleanedTarget, "")
		} else if detectedType == "telegram" && strings.HasPrefix(cleanedTarget, "@") {
			cleanedTarget = cleanedTarget[1:]
		}
		cleanedTarget = strings.ToLower(cleanedTarget)

		scamColl := h.db.Database.Collection("scammers")
		var scammer models.Scammer

		var targetFilter bson.M
		targetRegex := primitive.Regex{Pattern: regexp.QuoteMeta(cleanedTarget), Options: "i"}
		if detectedType == "phone" {
			targetFilter = bson.M{"contact.phone.full_number": targetRegex}
		} else if detectedType == "bank_account" {
			targetFilter = bson.M{"payments.bank.account_number": targetRegex}
		} else if detectedType == "telegram" {
			targetFilter = bson.M{"contact.telegram.username": targetRegex}
		} else { // facebook
			targetFilter = bson.M{"contact.facebook.link": targetRegex}
		}

		err := scamColl.FindOne(ctx, targetFilter).Decode(&scammer)
		if err == nil {
			response["is_scam"] = true
			response["is_safe"] = false
			response["detail"] = scammer
			response["message"] = "Phát hiện đối tượng nằm trong danh sách đen lừa đảo."
		} else {
			response["is_scam"] = false
			response["is_safe"] = true
			response["message"] = "Không phát hiện thông tin lừa đảo cho đối tượng này."
		}

	default:
		response["is_safe"] = true
		response["is_scam"] = false
		response["message"] = "Không thể nhận diện định dạng dữ liệu đầu vào."
	}

	c.JSON(http.StatusOK, response)
}

// GetWhois performs a WHOIS query on the target URL or domain and returns structured domain registration details.
func (h *SearchHandler) GetWhois(c *gin.Context) {
	target := strings.TrimSpace(c.Query("url"))
	if target == "" {
		target = strings.TrimSpace(c.Query("q"))
	}
	if target == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL/domain query parameter 'url' or 'q' is required"})
		return
	}

	domainName := strings.ToLower(target)
	domainName = strings.TrimPrefix(domainName, "https://")
	domainName = strings.TrimPrefix(domainName, "http://")
	domainName = strings.TrimPrefix(domainName, "www.")
	if idx := strings.Index(domainName, "/"); idx != -1 {
		domainName = domainName[:idx]
	}
	if idx := strings.Index(domainName, ":"); idx != -1 {
		domainName = domainName[:idx]
	}

	// 1. Query raw WHOIS info
	var raw string
	var err error
	if strings.HasSuffix(domainName, ".vn") {
		raw, err = whois.Whois(domainName, "whois.vnnic.vn")
	} else {
		raw, err = whois.Whois(domainName)
	}
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": fmt.Sprintf("failed to fetch WHOIS info: %v", err)})
		return
	}

	// 2. Parse raw WHOIS info
	result, err := whoisparser.Parse(raw)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to parse WHOIS data: %v", err)})
		return
	}

	// 3. Construct the response structure matching the requested format
	type DomainInfo struct {
		DomainChecked    string     `json:"domain_checked"`
		Registrar        string     `json:"registrar"`
		Owner            *string    `json:"owner"`
		RegistrationDate *time.Time `json:"registration_date"`
		ExpirationDate   *time.Time `json:"expiration_date"`
		UpdatedDate      *time.Time `json:"updated_date"`
		Status           []string   `json:"status"`
		NameServers      []string   `json:"nameservers"`
	}

	info := DomainInfo{
		DomainChecked: result.Domain.Domain,
		Registrar:     result.Registrar.Name,
		Status:        result.Domain.Status,
		NameServers:   result.Domain.NameServers,
	}

	if result.Registrant.Name != "" {
		info.Owner = &result.Registrant.Name
	}

	parseTime := func(timeStr string) *time.Time {
		if timeStr == "" {
			return nil
		}
		formats := []string{
			time.RFC3339,
			"2006-01-02T15:04:05Z",
			"2006-01-02 15:04:05",
			"2006-01-02T15:04:05.00Z",
			"2006-01-02T15:04:05",
		}
		for _, f := range formats {
			if t, err := time.Parse(f, timeStr); err == nil {
				return &t
			}
		}
		return nil
	}

	info.RegistrationDate = parseTime(result.Domain.CreatedDate)
	info.ExpirationDate = parseTime(result.Domain.ExpirationDate)
	info.UpdatedDate = parseTime(result.Domain.UpdatedDate)

	c.JSON(http.StatusOK, info)
}
