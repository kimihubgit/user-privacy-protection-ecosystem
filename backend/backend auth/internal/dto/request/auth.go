package request

type RegisterRequest struct {
	Username   string `json:"username" binding:"required,min=3"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=6"`
	RePassword string `json:"repassword" binding:"required,min=6"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type ForwordPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

type SocialLoginRequest struct {
	Provider   string `json:"provider" binding:"required,oneof=google facebook apple microsoft github"`
	ProviderID string `json:"provider_id" binding:"omitempty"`
	Email      string `json:"email" binding:"omitempty,email"`
	Name       string `json:"name"`
	Avatar     string `json:"avatar"`
	Code       string `json:"code"`
}
