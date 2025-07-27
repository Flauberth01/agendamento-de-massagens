package routes

import (
	"agendamento-backend/internal/interfaces/http/handlers"
	"agendamento-backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

// SetupAvailabilityRoutes configura as rotas de disponibilidade
func SetupAvailabilityRoutes(router *gin.RouterGroup, availabilityHandler *handlers.AvailabilityHandler) {
	availabilities := router.Group("/availabilities")
	{
		// Rotas de consulta (todos os usuários autenticados)
		availabilities.GET("/:id", availabilityHandler.GetAvailability)
		availabilities.GET("", availabilityHandler.ListAvailabilities)
		availabilities.GET("/chair/:chair_id", availabilityHandler.GetChairAvailabilities)
		availabilities.GET("/chair/:chair_id/slots", availabilityHandler.GetAvailableTimeSlots)
		availabilities.GET("/stats", availabilityHandler.GetAvailabilityStats)

		// Rotas restritas a admin (gerenciamento de disponibilidade)
		adminOnly := availabilities.Group("/")
		adminOnly.Use(middleware.AdminOnlyMiddleware())
		{
			// CRUD básico (apenas admin)
			adminOnly.POST("", availabilityHandler.CreateAvailability)
			adminOnly.POST("/bulk", availabilityHandler.CreateMultipleAvailabilities) // Nova rota para criação em lote
			adminOnly.PUT("/:id", availabilityHandler.UpdateAvailability)
			adminOnly.DELETE("/:id", availabilityHandler.DeleteAvailability)

			// Operações de status (apenas admin)
			adminOnly.POST("/:id/activate", availabilityHandler.ActivateAvailability)
			adminOnly.POST("/:id/deactivate", availabilityHandler.DeactivateAvailability)
			adminOnly.PUT("/:id/validity", availabilityHandler.SetValidityPeriod)
		}
	}
}
