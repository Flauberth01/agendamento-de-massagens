package middleware

import (
	"os"

	"github.com/gin-gonic/gin"
)

// SecurityHeaders adiciona headers de segurança às respostas
func SecurityHeaders() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Previne ataques XSS
		c.Header("X-XSS-Protection", "1; mode=block")

		// Previne MIME type sniffing
		c.Header("X-Content-Type-Options", "nosniff")

		// Previne clickjacking
		c.Header("X-Frame-Options", "DENY")

		// Força HTTPS (apenas em produção)
		if os.Getenv("GIN_MODE") == "release" {
			c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}

		// Content Security Policy baseado no ambiente
		if os.Getenv("GIN_MODE") == "release" {
			// Política restritiva para produção
			c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';")
		} else {
			// Política muito permissiva para desenvolvimento - sem restrições de connect-src
			c.Header("Content-Security-Policy", "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http: https: ws: wss:;")
		}

		// Referrer Policy
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// Permissions Policy
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		c.Next()
	})
}
