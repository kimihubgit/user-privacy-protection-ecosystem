package config

import (
	"log"
	"strings"

	"github.com/joho/godotenv"
	"github.com/knadh/koanf"
	"github.com/knadh/koanf/providers/confmap"
	"github.com/knadh/koanf/providers/env"
)

type Config struct {
	Port            string `koanf:"port"`
	MongoURI        string `koanf:"mongo_uri"`
	MongoDBName     string `koanf:"mongo_db"`
	AdminAPIKey     string `koanf:"admin_api_key"`
	AdminAllowedIPs string `koanf:"admin_allowed_ips"`
	JWTPublicKey    string `koanf:"jwt_public_key"`
}

func LoadConfig() *Config {
	k := koanf.New(".")

	// 1. Load default configs
	err := k.Load(confmap.Provider(defaultConfig, "."), nil)
	if err != nil {
		log.Printf("Warning: Failed to load default config map: %v", err)
	}

	// 2. Load .env file (if it exists) into system environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found or failed to load. Reading from system environment variables.")
	}

	// 3. Load from system environment variables (matching keys in defaultConfig)
	err = k.Load(env.Provider("", ".", func(s string) string {
		lower := strings.ToLower(s)
		// Filter: only load env vars that match config fields
		if _, ok := defaultConfig[lower]; ok {
			return lower
		}
		return ""
	}), nil)
	if err != nil {
		log.Printf("Warning: Failed to load config from env: %v", err)
	}

	var cfg Config
	err = k.Unmarshal("", &cfg)
	if err != nil {
		log.Printf("Warning: Failed to unmarshal configuration: %v", err)
	}

	return &cfg
}
