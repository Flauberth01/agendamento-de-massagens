package middleware

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"agendamento-backend/internal/application/usecases"
	"agendamento-backend/internal/domain/entities"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// AuthMiddleware middleware de autenticação JWT
func AuthMiddleware(userUseCase *usecases.UserUseCase) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		token := extractToken(c)
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token de acesso requerido"})
			c.Abort()
			return
		}

		claims, err := validateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			c.Abort()
			return
		}

		// Verificar se o usuário ainda existe e está ativo
		user, err := userUseCase.GetUserByID(claims.UserID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não encontrado"})
			c.Abort()
			return
		}

		if user.Status != "aprovado" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Usuário não está aprovado"})
			c.Abort()
			return
		}

		// Adicionar informações do usuário ao contexto
		c.Set("user_id", claims.UserID)
		c.Set("user_role", claims.Role)
		c.Set("user", user)

		c.Next()
	})
}

// AdminOnlyMiddleware middleware que permite apenas admins
func AdminOnlyMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
			c.Abort()
			return
		}

		if userRole != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado. Apenas administradores podem realizar esta operação"})
			c.Abort()
			return
		}

		c.Next()
	})
}

// AdminOrAttendantMiddleware middleware que permite admins e atendentes
func AdminOrAttendantMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
			c.Abort()
			return
		}

		if userRole != "admin" && userRole != "atendente" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado. Apenas administradores e atendentes podem realizar esta operação"})
			c.Abort()
			return
		}

		c.Next()
	})
}

// UserApprovalMiddleware middleware para permissões de aprovação de usuários
func UserApprovalMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
			c.Abort()
			return
		}

		// Apenas admin e atendente podem aprovar usuários
		if userRole != "admin" && userRole != "atendente" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado. Apenas administradores e atendentes podem aprovar usuários"})
			c.Abort()
			return
		}

		c.Next()
	})
}

// GenerateToken gera um token JWT para o usuário
func GenerateToken(user *entities.User) (string, time.Time, error) {
	expirationTime := time.Now().Add(24 * time.Hour) // 24 horas

	claims := &Claims{
		UserID: user.ID,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "agendamento-backend",
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(getJWTSecret()))
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expirationTime, nil
}

// GenerateRefreshToken gera um refresh token
func GenerateRefreshToken(user *entities.User) (string, time.Time, error) {
	expirationTime := time.Now().Add(7 * 24 * time.Hour) // 7 dias

	claims := &Claims{
		UserID: user.ID,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "agendamento-backend",
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(getJWTSecret()))
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expirationTime, nil
}

// ValidateRefreshToken valida um refresh token
func ValidateRefreshToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(getJWTSecret()), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("token inválido")
	}

	return claims, nil
}

// extractToken extrai o token do header Authorization
func extractToken(c *gin.Context) string {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return ""
	}

	// Formato esperado: "Bearer <token>"
	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}

	return parts[1]
}

// validateToken valida e decodifica o token JWT
func validateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(getJWTSecret()), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, jwt.ErrSignatureInvalid
	}

	return claims, nil
}

// getJWTSecret obtém a chave secreta do JWT
func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-super-secret-jwt-key-change-in-production"
	}
	return secret
}

// GetUserFromContext obtém o usuário do contexto
func GetUserFromContext(c *gin.Context) (*entities.User, bool) {
	user, exists := c.Get("user")
	if !exists {
		return nil, false
	}

	if userObj, ok := user.(*entities.User); ok {
		return userObj, true
	}

	return nil, false
}

// GetUserIDFromContext obtém o ID do usuário do contexto
func GetUserIDFromContext(c *gin.Context) (uint, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}

	if id, ok := userID.(uint); ok {
		return id, true
	}

	return 0, false
}

// GetUserRoleFromContext obtém o role do usuário do contexto
func GetUserRoleFromContext(c *gin.Context) (string, bool) {
	userRole, exists := c.Get("user_role")
	if !exists {
		return "", false
	}

	role, ok := userRole.(string)
	return role, ok
}
