package jwt

import (
	"errors"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

// GenerateToken creates an RS256 JWT using a PEM-encoded RSA Private Key
func GenerateToken(claims jwt.MapClaims, privateKeyPEM string) (string, error) {
	if privateKeyPEM == "" {
		return "", errors.New("private key is empty")
	}
	privateKey, err := jwt.ParseRSAPrivateKeyFromPEM([]byte(privateKeyPEM))
	if err != nil {
		return "", fmt.Errorf("failed to parse RSA private key: %w", err)
	}
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	return token.SignedString(privateKey)
}

// ValidateToken parses and validates an RS256 JWT using a PEM-encoded RSA Public Key
func ValidateToken(tokenStr string, publicKeyPEM string) (jwt.MapClaims, error) {
	if publicKeyPEM == "" {
		return nil, errors.New("public key is empty")
	}
	publicKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(publicKeyPEM))
	if err != nil {
		return nil, fmt.Errorf("failed to parse RSA public key: %w", err)
	}
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return publicKey, nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, errors.New("invalid token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}
	return claims, nil
}
