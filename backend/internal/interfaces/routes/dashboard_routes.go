package routes

import (
	"agendamento-backend/internal/application/usecases"
	"agendamento-backend/internal/interfaces/http/handlers"
	"agendamento-backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

// SetupDashboardRoutes configura as rotas do dashboard
func SetupDashboardRoutes(router *gin.RouterGroup, dashboardHandler *handlers.DashboardHandler, userUseCase *usecases.UserUseCase) {
	dashboard := router.Group("/dashboard")
	dashboard.Use(middleware.AuthMiddleware(userUseCase)) // Requer autenticação
	{
		// Dashboard para atendentes e admins
		dashboard.GET("/attendant", middleware.AdminOrAttendantMiddleware(), dashboardHandler.GetAttendantDashboard)

		// Dashboard para administradores
		dashboard.GET("/admin", middleware.AdminOnlyMiddleware(), dashboardHandler.GetAdminDashboard)

		// Sessões por data (atendentes e admins)
		dashboard.GET("/sessions/date/:date", middleware.AdminOrAttendantMiddleware(), dashboardHandler.GetSessionsByDate)

		// Ocupação das cadeiras (atendentes e admins)
		dashboard.GET("/chairs/occupancy", middleware.AdminOrAttendantMiddleware(), dashboardHandler.GetChairOccupancy)

		// Estatísticas de comparecimento e cancelamento (atendentes e admins)
		dashboard.GET("/stats/attendance", middleware.AdminOrAttendantMiddleware(), dashboardHandler.GetAttendanceStats)

		// Aprovações pendentes (apenas admins)
		dashboard.GET("/pending-approvals", middleware.AdminOnlyMiddleware(), dashboardHandler.GetPendingApprovals)

		// Enviar lembretes de teste (apenas admins)
		dashboard.POST("/test-reminders", middleware.AdminOnlyMiddleware(), dashboardHandler.SendTestReminders)
	}
}
