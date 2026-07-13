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
	db            *database.DB
	httpClient    *http.Client
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
			urlsColl := h.db.Database.Collection("scam_urls")
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

// GetDetail retrieves the detailed information of the queried item, supporting URL, Email (including breach), Phone, Bank Account.
func (h *SearchHandler) GetDetail(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if q == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	// 1. Detect Type
	detectedType := detectQueryType(q)

	response := gin.H{
		"query":         q,
		"detected_type": detectedType,
	}

	// 2. Perform detail fetching based on type
	switch detectedType {
	case "url":
		urlsColl := h.db.Database.Collection("scam_urls")
		var scamURL models.ScamURL
		cleanedURL := strings.ToLower(strings.TrimSpace(q))
		err := urlsColl.FindOne(ctx, bson.M{
			"$or": []bson.M{
				{"url": cleanedURL},
				{"domain": cleanedURL},
			},
		}).Decode(&scamURL)

		if err == nil {
			response["is_safe"] = false
			response["detail"] = scamURL
		} else {
			response["is_safe"] = true
			response["message"] = "Không phát hiện mối đe dọa trực tiếp cho URL này trong cơ sở dữ liệu."
		}

	case "email":
		emailNormalized := strings.ToLower(strings.TrimSpace(q))
		scamColl := h.db.Database.Collection("scammers")
		var scammer models.Scammer
		// Search directly in email address field
		err := scamColl.FindOne(ctx, bson.M{"contact.email.address": emailNormalized}).Decode(&scammer)
		if err == nil {
			response["is_scam"] = true
			response["scammer_detail"] = scammer
		} else {
			response["is_scam"] = false
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
		cleanedTarget := q
		if detectedType == "phone" || detectedType == "bank_account" {
			reg := regexp.MustCompile(`[^\d]`)
			cleanedTarget = reg.ReplaceAllString(cleanedTarget, "")
		} else if detectedType == "telegram" && strings.HasPrefix(cleanedTarget, "@") {
			cleanedTarget = cleanedTarget[1:]
		}
		cleanedTarget = strings.ToLower(cleanedTarget)

		scamColl := h.db.Database.Collection("scammers")
		var scammer models.Scammer

		// Query the matching field directly using regex to allow flexible format matches
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
			response["detail"] = scammer
		} else {
			response["is_scam"] = false
			response["message"] = "Không phát hiện thông tin lừa đảo cho đối tượng này."
		}

	default:
		response["is_safe"] = true
		response["message"] = "Không thể nhận diện định dạng dữ liệu đầu vào."
	}

	c.JSON(http.StatusOK, response)
}
