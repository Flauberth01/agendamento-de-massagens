package middleware

import (
	"os"

	"github.com/gin-gonic/gin"
)

// CORS middleware para permitir requisições cross-origin
func CORS() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Lista de origens permitidas
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:5173",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:5173",
		}

		// Em produção, adicionar domínios reais
		if os.Getenv("GIN_MODE") == "release" {
			// Adicionar domínios de produção aqui
			productionOrigins := []string{
				"https://seudominio.com",
				"https://www.seudominio.com",
			}
			allowedOrigins = append(allowedOrigins, productionOrigins...)
		}

		// Verificar se a origem está na lista permitida
		allowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}

		// Sempre definir headers CORS básicos
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		c.Header("Access-Control-Max-Age", "86400") // 24 horas

		// Definir Access-Control-Allow-Origin
		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
		} else if os.Getenv("GIN_MODE") != "release" {
			// Em desenvolvimento, permitir qualquer origem
			c.Header("Access-Control-Allow-Origin", "*")
		}

		// Responder a requisições OPTIONS (preflight)
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})
}
