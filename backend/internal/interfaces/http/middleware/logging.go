package middleware

import (
	"agendamento-backend/pkg/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// LoggingMiddleware middleware para logging de requisições HTTP
func LoggingMiddleware() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		// Extrair informações do contexto
		userID, _ := extractUserIDFromKeys(param.Keys)
		userRole, _ := extractUserRoleFromKeys(param.Keys)

		// Criar logger com contexto da requisição
		reqLogger := logger.WithRequest(
			param.Method,
			param.Path,
			param.Request.UserAgent(),
			userID,
		)

		// Determinar nível de log baseado no status code
		switch {
		case param.StatusCode >= 500:
			reqLogger.Error("Request failed",
				zap.Int("status", param.StatusCode),
				zap.String("method", param.Method),
				zap.String("path", param.Path),
				zap.String("client_ip", param.ClientIP),
				zap.Duration("latency", param.Latency),
				zap.String("error", param.ErrorMessage),
				zap.Uint("user_id", userID),
				zap.String("user_role", userRole),
			)
		case param.StatusCode >= 400:
			reqLogger.Warn("Request warning",
				zap.Int("status", param.StatusCode),
				zap.String("method", param.Method),
				zap.String("path", param.Path),
				zap.String("client_ip", param.ClientIP),
				zap.Duration("latency", param.Latency),
				zap.String("error", param.ErrorMessage),
				zap.Uint("user_id", userID),
				zap.String("user_role", userRole),
			)
		default:
			reqLogger.Info("Request completed",
				zap.Int("status", param.StatusCode),
				zap.String("method", param.Method),
				zap.String("path", param.Path),
				zap.String("client_ip", param.ClientIP),
				zap.Duration("latency", param.Latency),
				zap.Uint("user_id", userID),
				zap.String("user_role", userRole),
			)
		}

		// Retornar string vazia pois estamos usando nosso próprio logger
		return ""
	})
}

// extractUserIDFromKeys extrai user_id das chaves do gin
func extractUserIDFromKeys(keys map[string]interface{}) (uint, bool) {
	if userID, exists := keys["user_id"]; exists {
		if id, ok := userID.(uint); ok {
			return id, true
		}
	}
	return 0, false
}

// extractUserRoleFromKeys extrai user_role das chaves do gin
func extractUserRoleFromKeys(keys map[string]interface{}) (string, bool) {
	if userRole, exists := keys["user_role"]; exists {
		if role, ok := userRole.(string); ok {
			return role, true
		}
	}
	return "", false
}
