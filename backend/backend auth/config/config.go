package config

import (
	_ "embed"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port               string
	MongoURI           string
	MongoDBName        string
	PrivateKey         string
	PublicKey          string
	RPDisplayName      string
	RPID               string
	RPOrigins          []string
	BackendCheckURL    string
	BackendCheckAPIKey string
	AdminAllowedIPs    string
}

var AppConfig *Config

//go:embed blocklists/disposable_email.conf
var DisposableEmailBlocklist string

func LoadConfig() {
	// Load .env file if it exists, otherwise rely on system env vars
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	port := getEnv("PORT", "8081")
	mongoURI := getEnv("MONGO_URI", "mongodb://localhost:27017")
	dbName := getEnv("MONGO_DB", "protect_user_auth")

	privateKeyPem := getEnv("JWT_PRIVATE_KEY", "")
	if privateKeyPem == "" {
		log.Fatal("Fatal: JWT_PRIVATE_KEY environment variable is not set")
	}
	publicKeyPem := getEnv("JWT_PUBLIC_KEY", "")
	if publicKeyPem == "" {
		log.Fatal("Fatal: JWT_PUBLIC_KEY environment variable is not set")
	}

	rpDisplayName := getEnv("RP_DISPLAY_NAME", "Protect User Auth")
	rpID := getEnv("RP_ID", "localhost")
	rpOriginsStr := getEnv("RP_ORIGINS", "http://localhost:5173,http://localhost:3000,http://localhost:8081")
	rpOrigins := strings.Split(rpOriginsStr, ",")

	backendCheckURL := getEnv("BACKEND_CHECK_URL", "http://localhost:8082")
	backendCheckAPIKey := getEnv("BACKEND_CHECK_API_KEY", "admin-secret-key-123")
	adminAllowedIPs := getEnv("ADMIN_ALLOWED_IPS", "127.0.0.1,::1")

	AppConfig = &Config{
		Port:               port,
		MongoURI:           mongoURI,
		MongoDBName:        dbName,
		PrivateKey:         strings.ReplaceAll(privateKeyPem, "\\n", "\n"),
		PublicKey:          strings.ReplaceAll(publicKeyPem, "\\n", "\n"),
		RPDisplayName:      rpDisplayName,
		RPID:               rpID,
		RPOrigins:          rpOrigins,
		BackendCheckURL:    backendCheckURL,
		BackendCheckAPIKey: backendCheckAPIKey,
		AdminAllowedIPs:    adminAllowedIPs,
	}

	LoadOAuthConfig()
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(name string, defaultVal int) int {
	valueStr := getEnv(name, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultVal
}
