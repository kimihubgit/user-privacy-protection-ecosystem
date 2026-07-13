package middleware

import (
	"context"
	"net/http"
	"strings"

	"protect-user-auth/config"
	jwtutil "protect-user-auth/internal/pkg/jwt"
	"protect-user-auth/internal/services/auth"

	"github.com/gin-gonic/gin"
)

func JWTAuth(authService auth.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": "Authorization header is required",
				},
			})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": "Authorization header format must be Bearer {token}",
				},
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Check if token has been blacklisted (logged out)
		isBlacklisted, err := authService.IsTokenBlacklisted(c.Request.Context(), tokenString)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "INTERNAL_ERROR",
					"message": "Failed to verify token blacklist status",
				},
			})
			c.Abort()
			return
		}
		if isBlacklisted {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": "Token has been invalidated (logged out)",
				},
			})
			c.Abort()
			return
		}

		claims, err := jwtutil.ValidateToken(tokenString, config.AppConfig.PublicKey)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "UNAUTHORIZED",
					"message": "Invalid token",
				},
			})
			c.Abort()
			return
		}

		// Set in Gin context (for handlers)
		c.Set("userID", claims["sub"])
		c.Set("email", claims["email"])
		c.Set("role", claims["role"])

		// Inject into request's standard Go context (for services/use cases)
		ctx := c.Request.Context()
		ctx = context.WithValue(ctx, "userID", claims["sub"])
		ctx = context.WithValue(ctx, "email", claims["email"])
		ctx = context.WithValue(ctx, "role", claims["role"])
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}

func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "FORBIDDEN",
					"message": "Forbidden: No role assigned in token",
				},
			})
			c.Abort()
			return
		}

		role, ok := roleVal.(string)
		if !ok {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "FORBIDDEN",
					"message": "Forbidden: Invalid role in token",
				},
			})
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
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"error": gin.H{
					"code":    "FORBIDDEN",
					"message": "Forbidden: Insufficient permissions",
				},
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
