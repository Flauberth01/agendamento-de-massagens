package middleware

import (
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
		// c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		
		// Content Security Policy básico
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:")
		
		// Referrer Policy
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		
		// Permissions Policy
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")

		c.Next()
	})
}
