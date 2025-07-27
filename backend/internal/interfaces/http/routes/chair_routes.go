package routes

import (
	"agendamento-backend/internal/interfaces/http/handlers"
	"agendamento-backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

// SetupChairRoutes configura as rotas de cadeiras
func SetupChairRoutes(router *gin.RouterGroup, chairHandler *handlers.ChairHandler) {
	chairs := router.Group("/chairs")
	{
		// Rotas públicas (apenas leitura)
		chairs.GET("/:id", chairHandler.GetChair)
		chairs.GET("", chairHandler.ListChairs)
		chairs.GET("/active", chairHandler.GetActiveChairs)
		chairs.GET("/available", chairHandler.GetAvailableChairs)
		chairs.GET("/stats", chairHandler.GetChairStats)

		// Rotas restritas a admin
		adminOnly := chairs.Group("/")
		adminOnly.Use(middleware.AdminOnlyMiddleware())
		{
			// CRUD básico (apenas admin)
			adminOnly.POST("", chairHandler.CreateChair)
			adminOnly.PUT("/:id", chairHandler.UpdateChair)
			adminOnly.DELETE("/:id", chairHandler.DeleteChair)

			// Operação de status (apenas admin)
			adminOnly.PATCH("/:id/toggle-status", chairHandler.ToggleChairStatus)
		}
	}
}
