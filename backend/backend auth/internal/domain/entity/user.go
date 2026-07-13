package entity

import (
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type SocialAccount struct {
	Provider   string    `bson:"provider" json:"provider"` // google, facebook, apple
	ProviderID string    `bson:"provider_id" json:"provider_id"`
	LinkedAt   time.Time `bson:"linked_at" json:"linked_at"`
}

type User struct {
	ID             primitive.ObjectID    `bson:"_id,omitempty" json:"id,omitempty"`
	Username       string                `bson:"username,omitempty" json:"username"`
	Email          string                `bson:"email" json:"email"`
	Password       string                `bson:"password,omitempty" json:"-"`
	Name           string                `bson:"name" json:"name"`
	Role           string                `bson:"role" json:"role"`
	Status         string                `bson:"status" json:"status"`
	IPAddress      string                `bson:"ip_address" json:"ip_address"`
	Avatar         string                `bson:"avatar" json:"avatar"`
	CreatedAt      time.Time             `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time             `bson:"updated_at" json:"updated_at"`
	SocialAccounts []SocialAccount       `bson:"social_accounts" json:"social_accounts"`
	Passkeys       []webauthn.Credential `bson:"passkeys" json:"-"`
}

// Implement webauthn.User interface
func (u *User) WebAuthnID() []byte {
	return u.ID[:]
}

func (u *User) WebAuthnName() string {
	return u.Email
}

func (u *User) WebAuthnDisplayName() string {
	if u.Name != "" {
		return u.Name
	}
	return u.Email
}

func (u *User) WebAuthnIcon() string {
	return u.Avatar
}

func (u *User) WebAuthnCredentials() []webauthn.Credential {
	return u.Passkeys
}
