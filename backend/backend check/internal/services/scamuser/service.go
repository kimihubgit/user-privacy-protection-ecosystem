package scamuser

import (
	"context"
	"errors"
	"regexp"
	"strings"
	"time"

	"protect-user-backend/internal/dto/response"
	"protect-user-backend/internal/infrastructure/repository/scamuser"
	"protect-user-backend/internal/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Service interface {
	NormalizeTarget(target string, targetType string) string
	CheckScamUser(ctx context.Context, target string) (*response.CheckScamUserResponse, error)
	ListScammers(ctx context.Context, page, limit int64, targetType string) ([]models.Scammer, int64, error)
	DeleteScammer(ctx context.Context, id string) error
	AddScammerFromInput(ctx context.Context, target, targetType, name, bankName, description, sourceReportID string) (*models.Scammer, error)

	InsertScammer(ctx context.Context, scammer *models.Scammer) error
	UpdateScammer(ctx context.Context, scammer *models.Scammer) error
	FindScammerByTarget(ctx context.Context, target string) (*models.Scammer, error)
}

type service struct {
	repo scamuser.Repository
}

// New initializes the ScamUser service.
func New(repo scamuser.Repository) Service {
	return &service{repo: repo}
}

func (s *service) NormalizeTarget(target string, targetType string) string {
	cleaned := strings.TrimSpace(target)
	
	switch targetType {
	case "phone", "bank_account":
		reg := regexp.MustCompile(`[^\d]`)
		cleaned = reg.ReplaceAllString(cleaned, "")
	default:
		cleaned = strings.ToLower(cleaned)
	}
	
	return cleaned
}

func (s *service) CheckScamUser(ctx context.Context, target string) (*response.CheckScamUserResponse, error) {
	scammer, err := s.repo.FindScammerByTarget(ctx, target)
	if err != nil {
		return nil, err
	}

	if scammer != nil {
		return &response.CheckScamUserResponse{
			Target:    target,
			IsScam:    true,
			Scammer:   scammer,
			Incidents: scammer.Incidents,
		}, nil
	}

	return &response.CheckScamUserResponse{
		Target: target,
		IsScam: false,
	}, nil
}

func (s *service) AddScammerFromInput(ctx context.Context, target, targetType, name, bankName, description, sourceReportID string) (*models.Scammer, error) {
	normalized := s.NormalizeTarget(target, targetType)
	if normalized == "" {
		return nil, errors.New("target cannot be empty after normalization")
	}

	scammer, err := s.repo.FindScammerByTarget(ctx, normalized)
	if err != nil {
		return nil, err
	}

	isNew := false
	if scammer == nil {
		scammer = &models.Scammer{
			ID:            primitive.NewObjectID(),
			SearchTargets: []string{},
			Incidents:     []models.Incident{},
		}
		isNew = true
	}

	targetExists := false
	for _, t := range scammer.SearchTargets {
		if t == normalized {
			targetExists = true
			break
		}
	}
	if !targetExists {
		scammer.SearchTargets = append(scammer.SearchTargets, normalized)
	}

	nameUpper := strings.ToUpper(strings.TrimSpace(name))
	switch targetType {
	case "phone":
		exists := false
		for _, ph := range scammer.Contact.Phone {
			if ph.FullNumber == normalized {
				exists = true
				break
			}
		}
		if !exists {
			scammer.Contact.Phone = append(scammer.Contact.Phone, models.PhoneContact{
				FullNumber: normalized,
			})
		}
	case "telegram":
		username := normalized
		if strings.HasPrefix(username, "@") {
			username = username[1:]
		}
		exists := false
		for _, tg := range scammer.Contact.Telegram {
			if tg.Username == username {
				exists = true
				break
			}
		}
		if !exists {
			scammer.Contact.Telegram = append(scammer.Contact.Telegram, models.TelegramContact{
				Username: username,
			})
		}
	case "facebook":
		exists := false
		for _, fb := range scammer.Contact.Facebook {
			if fb.Link == normalized {
				exists = true
				break
			}
		}
		if !exists {
			scammer.Contact.Facebook = append(scammer.Contact.Facebook, models.FacebookContact{
				Link: normalized,
				Name: nameUpper,
			})
		}
	case "bank_account":
		exists := false
		for _, b := range scammer.Payments.Bank {
			if b.AccountNumber == normalized {
				exists = true
				break
			}
		}
		if !exists {
			scammer.Payments.Bank = append(scammer.Payments.Bank, models.BankPayment{
				AccountNumber: normalized,
				BankName:      bankName,
				AccountHolder: nameUpper,
			})
		}
	default:
		exists := false
		for _, oth := range scammer.Contact.Other {
			if str, ok := oth.(string); ok && str == normalized {
				exists = true
				break
			}
		}
		if !exists {
			scammer.Contact.Other = append(scammer.Contact.Other, normalized)
		}
	}

	incident := models.Incident{
		ID:             primitive.NewObjectID(),
		Date:           time.Now().Format("2006-01-02"),
		Status:         "approved",
		Type:           "scam",
		Description:    description,
		SourceReportID: sourceReportID,
		Raw: models.IncidentRaw{
			Detail: description,
		},
	}
	scammer.Incidents = append(scammer.Incidents, incident)

	if isNew {
		err = s.repo.InsertScammer(ctx, scammer)
	} else {
		err = s.repo.UpdateScammer(ctx, scammer)
	}
	if err != nil {
		return nil, err
	}

	return scammer, nil
}

func (s *service) ListScammers(ctx context.Context, page, limit int64, targetType string) ([]models.Scammer, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return s.repo.ListScammers(ctx, page, limit, targetType)
}

func (s *service) DeleteScammer(ctx context.Context, id string) error {
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("invalid ObjectID format")
	}
	return s.repo.DeleteScammer(ctx, objID)
}

func (s *service) InsertScammer(ctx context.Context, scammer *models.Scammer) error {
	return s.repo.InsertScammer(ctx, scammer)
}

func (s *service) UpdateScammer(ctx context.Context, scammer *models.Scammer) error {
	return s.repo.UpdateScammer(ctx, scammer)
}

func (s *service) FindScammerByTarget(ctx context.Context, target string) (*models.Scammer, error) {
	return s.repo.FindScammerByTarget(ctx, target)
}
