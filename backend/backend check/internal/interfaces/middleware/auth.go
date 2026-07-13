package middleware

import (
	"crypto/rsa"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// APIKeyAuth is a middleware that enforces an API Key verification via X-API-Key header.
func APIKeyAuth(configuredKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Missing X-API-Key header",
			})
			c.Abort()
			return
		}

		if apiKey != configuredKey {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid API Key",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// JWTAuth verifies a JWT Token using an RSA Public Key (PEM).
// It checks if the user has an allowed role (e.g., moderator or super_admin).
func JWTAuth(publicKeyPEM string, allowedRoles []string) gin.HandlerFunc {
	var rsaPublicKey *rsa.PublicKey
	if publicKeyPEM != "" {
		pubKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(publicKeyPEM))
		if err != nil {
			println("Error parsing JWT public key PEM:", err.Error())
		} else {
			rsaPublicKey = pubKey
		}
	}

	return func(c *gin.Context) {
		if rsaPublicKey == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT authentication public key is not configured"})
			c.Abort()
			return
		}

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header must be Bearer <token>"})
			c.Abort()
			return
		}

		tokenString := parts[1]

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return rsaPublicKey, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		roleVal, hasRole := claims["role"]
		if !hasRole {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: No role assigned in token"})
			c.Abort()
			return
		}

		role, ok := roleVal.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: Invalid role in token"})
			c.Abort()
			return
		}

		roleAllowed := false
		for _, allowedRole := range allowedRoles {
			if strings.ToLower(role) == strings.ToLower(allowedRole) {
				roleAllowed = true
				break
			}
		}

		if !roleAllowed {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: Insufficient permissions"})
			c.Abort()
			return
		}

		if sub, ok := claims["sub"].(string); ok {
			c.Set("userId", sub)
		}
		c.Set("userRole", role)

		c.Next()
	}
}

// UserJWTAuth verifies a JWT Token using an RSA Public Key (PEM) without requiring specific roles.
func UserJWTAuth(publicKeyPEM string) gin.HandlerFunc {
	var rsaPublicKey *rsa.PublicKey
	if publicKeyPEM != "" {
		// Clean up potential escaped newlines from env strings
		cleanPEM := strings.ReplaceAll(publicKeyPEM, `\n`, "\n")
		pubKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(cleanPEM))
		if err != nil {
			println("Error parsing JWT public key PEM:", err.Error())
		} else {
			rsaPublicKey = pubKey
		}
	}

	return func(c *gin.Context) {
		if rsaPublicKey == nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "JWT authentication public key is not configured"})
			c.Abort()
			return
		}

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing Authorization header"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header must be Bearer <token>"})
			c.Abort()
			return
		}

		tokenString := parts[1]

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return rsaPublicKey, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		// Extract user details and set them securely in context
		if sub, ok := claims["sub"].(string); ok {
			c.Set("userId", sub)
		}
		if email, ok := claims["email"].(string); ok {
			c.Set("userEmail", email)
		}

		c.Next()
	}
}
