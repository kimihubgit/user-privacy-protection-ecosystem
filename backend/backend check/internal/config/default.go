package config

// defaultConfig defines the fallback config values in case they are not set in Env.
var defaultConfig = map[string]interface{}{
	"port":          "8080",
	"mongo_uri":     "mongodb://localhost:27017",
	"mongo_db":      "scam_detector",
	"admin_api_key":    "admin-secret-key-123",
	"admin_allowed_ips": "127.0.0.1",
	"jwt_public_key":    "",
}
