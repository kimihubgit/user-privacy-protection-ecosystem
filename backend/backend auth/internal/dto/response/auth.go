package response

import "time"

type UserResponse struct {
	ID        string     `json:"-"`
	Username  string     `json:"username"`
	Email     string     `json:"email"`
	Name      string     `json:"name,omitempty"`
	Avatar    string     `json:"avatar,omitempty"`
	CreatedAt *time.Time `json:"-"`
}

type GetMeResponse struct {
	ID        string     `json:"id,omitempty"`
	Username  string     `json:"username"`
	Email     string     `json:"email"`
	Name      string     `json:"name,omitempty"`
	Avatar    string     `json:"avatar,omitempty"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}
