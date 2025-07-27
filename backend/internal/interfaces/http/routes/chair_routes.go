package routes

import (
	"github.com/gin-gonic/gin"
	"agendamento-backend/internal/interfaces/http/handlers"
	"agendamento-backend/internal/interfaces/http/middleware"
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

			// Operações de status (apenas admin)
			adminOnly.PUT("/:id/status", chairHandler.ChangeChairStatus)
			adminOnly.POST("/:id/activate", chairHandler.ActivateChair)
			adminOnly.POST("/:id/deactivate", chairHandler.DeactivateChair)
		}
	}
}
