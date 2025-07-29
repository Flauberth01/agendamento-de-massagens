package routes

import (
	"agendamento-backend/internal/interfaces/http/handlers"
	"agendamento-backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

// SetupUserRoutes configura as rotas de usuários
func SetupUserRoutes(router *gin.RouterGroup, userHandler *handlers.UserHandler) {
	users := router.Group("/users")
	{
		// Rotas de consulta (todos os usuários autenticados)
		users.GET("/:id", userHandler.GetUser)
		users.GET("", userHandler.ListUsers)
		users.GET("/check-cpf", userHandler.CheckCPFExists) // Verificar CPF existente

		// Rotas para atendentes e admins (aprovações)
		approvalRoutes := users.Group("/")
		approvalRoutes.Use(middleware.UserApprovalMiddleware())
		{
			approvalRoutes.GET("/pending", userHandler.GetPendingApprovals)
			approvalRoutes.POST("/:id/approve", userHandler.ApproveUser)
			approvalRoutes.POST("/:id/reject", userHandler.RejectUser)
		}

		// Rotas restritas a admin (CRUD completo)
		adminOnly := users.Group("/")
		adminOnly.Use(middleware.AdminOnlyMiddleware())
		{
			adminOnly.POST("", userHandler.CreateUser)
			adminOnly.PUT("/:id", userHandler.UpdateUser)
			adminOnly.DELETE("/:id", userHandler.DeleteUser)
		}
	}
}
