package routes

import (
	"github.com/gin-gonic/gin"
	"agendamento-backend/internal/interfaces/http/handlers"
)

// SetupAuditLogRoutes configura as rotas de auditoria
func SetupAuditLogRoutes(router *gin.RouterGroup, auditLogHandler *handlers.AuditLogHandler) {
	auditLogs := router.Group("/audit-logs")
	{
		// Consultas básicas
		auditLogs.GET("/:id", auditLogHandler.GetAuditLog)
		auditLogs.GET("", auditLogHandler.ListAuditLogs)

		// Consultas por filtros
		auditLogs.GET("/user/:user_id", auditLogHandler.GetUserAuditLogs)
		auditLogs.GET("/action/:action", auditLogHandler.GetAuditLogsByAction)
		auditLogs.GET("/resource/:resource", auditLogHandler.GetAuditLogsByResource)
		auditLogs.GET("/date-range", auditLogHandler.GetAuditLogsByDateRange)

		// Atividades
		auditLogs.GET("/activity/recent", auditLogHandler.GetRecentActivity)
		auditLogs.GET("/activity/user/:user_id", auditLogHandler.GetUserActivity)
		auditLogs.GET("/activity/system", auditLogHandler.GetSystemActivity)

		// Relatórios
		auditLogs.GET("/reports/active-users", auditLogHandler.GetMostActiveUsers)
		auditLogs.GET("/reports/common-actions", auditLogHandler.GetMostCommonActions)

		// Estatísticas e manutenção
		auditLogs.GET("/stats", auditLogHandler.GetAuditStats)
		auditLogs.DELETE("/cleanup", auditLogHandler.CleanupOldLogs)
	}
}
