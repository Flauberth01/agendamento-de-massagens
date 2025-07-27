package handlers

import (
	"net/http"
	"strconv"
	"time"

	"agendamento-backend/internal/application/usecases"

	"github.com/gin-gonic/gin"
)

type AuditLogHandler struct {
	auditLogUseCase *usecases.AuditLogUseCase
}

func NewAuditLogHandler(auditLogUseCase *usecases.AuditLogUseCase) *AuditLogHandler {
	return &AuditLogHandler{
		auditLogUseCase: auditLogUseCase,
	}
}

// GetAuditLog busca log de auditoria por ID
// @Summary Buscar log de auditoria
// @Description Retorna um log de auditoria específico pelo ID
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID do log de auditoria"
// @Success 200 {object} map[string]interface{} "Log de auditoria encontrado"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 404 {object} map[string]string "Log não encontrado"
// @Router /audit-logs/{id} [get]
func (h *AuditLogHandler) GetAuditLog(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	auditLog, err := h.auditLogUseCase.GetAuditLogByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Log de auditoria não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": auditLog})
}

// ListAuditLogs lista logs de auditoria com paginação
// @Summary Listar logs de auditoria
// @Description Lista logs de auditoria com paginação e filtros opcionais
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Param limit query int false "Limite de registros por página" default(10)
// @Param offset query int false "Offset para paginação" default(0)
// @Param user_id query int false "Filtrar por ID do usuário"
// @Param action query string false "Filtrar por ação"
// @Param resource query string false "Filtrar por recurso"
// @Param resource_id query int false "Filtrar por ID do recurso"
// @Param ip_address query string false "Filtrar por endereço IP"
// @Param start_date query string false "Data de início (YYYY-MM-DD)"
// @Param end_date query string false "Data de fim (YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{} "Lista de logs de auditoria"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /audit-logs [get]
func (h *AuditLogHandler) ListAuditLogs(c *gin.Context) {
	// Parâmetros de paginação
	limitParam := c.DefaultQuery("limit", "10")
	offsetParam := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetParam)
	if err != nil {
		offset = 0
	}

	// Filtros
	filters := make(map[string]interface{})
	if userIDParam := c.Query("user_id"); userIDParam != "" {
		userID, parseErr := strconv.ParseUint(userIDParam, 10, 32)
		if parseErr == nil {
			filters["user_id"] = uint(userID)
		}
	}
	if action := c.Query("action"); action != "" {
		filters["action"] = action
	}
	if resource := c.Query("resource"); resource != "" {
		filters["resource"] = resource
	}
	if resourceIDParam := c.Query("resource_id"); resourceIDParam != "" {
		resourceID, parseErr := strconv.ParseUint(resourceIDParam, 10, 32)
		if parseErr == nil {
			filters["resource_id"] = uint(resourceID)
		}
	}
	if ipAddress := c.Query("ip_address"); ipAddress != "" {
		filters["ip_address"] = ipAddress
	}
	if startDate := c.Query("start_date"); startDate != "" {
		if date, parseErr := time.Parse("2006-01-02", startDate); parseErr == nil {
			filters["start_date"] = date
		}
	}
	if endDate := c.Query("end_date"); endDate != "" {
		if date, parseErr := time.Parse("2006-01-02", endDate); parseErr == nil {
			filters["end_date"] = date
		}
	}

	auditLogs, total, err := h.auditLogUseCase.ListAuditLogs(limit, offset, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": auditLogs,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GetUserAuditLogs busca logs de auditoria de um usuário
// @Summary Logs de auditoria de usuário
// @Description Lista logs de auditoria de um usuário específico
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Param user_id path int true "ID do usuário"
// @Param limit query int false "Limite de registros por página" default(10)
// @Param offset query int false "Offset para paginação" default(0)
// @Success 200 {object} map[string]interface{} "Lista de logs do usuário"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 404 {object} map[string]string "Usuário não encontrado"
// @Router /audit-logs/user/{user_id} [get]
func (h *AuditLogHandler) GetUserAuditLogs(c *gin.Context) {
	userIDParam := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do usuário inválido"})
		return
	}

	// Parâmetros de paginação
	limitParam := c.DefaultQuery("limit", "10")
	offsetParam := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetParam)
	if err != nil {
		offset = 0
	}

	auditLogs, total, err := h.auditLogUseCase.GetUserAuditLogs(uint(userID), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": auditLogs,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GetAuditLogsByAction busca logs de auditoria por ação
func (h *AuditLogHandler) GetAuditLogsByAction(c *gin.Context) {
	action := c.Param("action")
	if action == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ação é obrigatória"})
		return
	}

	// Parâmetros de paginação
	limitParam := c.DefaultQuery("limit", "10")
	offsetParam := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetParam)
	if err != nil {
		offset = 0
	}

	auditLogs, total, err := h.auditLogUseCase.GetAuditLogsByAction(action, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": auditLogs,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GetAuditLogsByResource busca logs de auditoria por recurso
func (h *AuditLogHandler) GetAuditLogsByResource(c *gin.Context) {
	resource := c.Param("resource")
	if resource == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Recurso é obrigatório"})
		return
	}

	// Parâmetros de paginação
	limitParam := c.DefaultQuery("limit", "10")
	offsetParam := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetParam)
	if err != nil {
		offset = 0
	}

	auditLogs, total, err := h.auditLogUseCase.GetAuditLogsByResource(resource, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": auditLogs,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GetAuditLogsByDateRange busca logs de auditoria por período
func (h *AuditLogHandler) GetAuditLogsByDateRange(c *gin.Context) {
	startDateParam := c.Query("start_date")
	endDateParam := c.Query("end_date")

	if startDateParam == "" || endDateParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datas de início e fim são obrigatórias"})
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido para start_date (YYYY-MM-DD)"})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido para end_date (YYYY-MM-DD)"})
		return
	}

	// Parâmetros de paginação
	limitParam := c.DefaultQuery("limit", "10")
	offsetParam := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetParam)
	if err != nil {
		offset = 0
	}

	auditLogs, total, err := h.auditLogUseCase.GetAuditLogsByDateRange(startDate, endDate, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": auditLogs,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GetRecentActivity busca atividade recente
func (h *AuditLogHandler) GetRecentActivity(c *gin.Context) {
	limitParam := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	auditLogs, err := h.auditLogUseCase.GetRecentActivity(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": auditLogs})
}

// GetUserActivity busca atividade de um usuário
func (h *AuditLogHandler) GetUserActivity(c *gin.Context) {
	userIDParam := c.Param("user_id")
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do usuário inválido"})
		return
	}

	limitParam := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	auditLogs, err := h.auditLogUseCase.GetUserActivity(uint(userID), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": auditLogs})
}

// GetSystemActivity busca atividade do sistema
func (h *AuditLogHandler) GetSystemActivity(c *gin.Context) {
	limitParam := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	auditLogs, err := h.auditLogUseCase.GetSystemActivity(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": auditLogs})
}

// GetMostActiveUsers busca usuários mais ativos
func (h *AuditLogHandler) GetMostActiveUsers(c *gin.Context) {
	startDateParam := c.Query("start_date")
	endDateParam := c.Query("end_date")

	if startDateParam == "" || endDateParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datas de início e fim são obrigatórias"})
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido para start_date (YYYY-MM-DD)"})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido para end_date (YYYY-MM-DD)"})
		return
	}

	limitParam := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	users, err := h.auditLogUseCase.GetMostActiveUsers(limit, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": users})
}

// GetMostCommonActions busca ações mais comuns
func (h *AuditLogHandler) GetMostCommonActions(c *gin.Context) {
	startDateParam := c.Query("start_date")
	endDateParam := c.Query("end_date")

	if startDateParam == "" || endDateParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datas de início e fim são obrigatórias"})
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido para start_date (YYYY-MM-DD)"})
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido para end_date (YYYY-MM-DD)"})
		return
	}

	limitParam := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	actions, err := h.auditLogUseCase.GetMostCommonActions(limit, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": actions})
}

// GetAuditStats retorna estatísticas de auditoria
func (h *AuditLogHandler) GetAuditStats(c *gin.Context) {
	stats, err := h.auditLogUseCase.GetAuditStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// CleanupOldLogs limpa logs antigos
func (h *AuditLogHandler) CleanupOldLogs(c *gin.Context) {
	retentionDaysParam := c.DefaultQuery("retention_days", "90")
	retentionDays, err := strconv.Atoi(retentionDaysParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dias de retenção inválido"})
		return
	}

	err = h.auditLogUseCase.CleanupOldLogs(retentionDays)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logs antigos removidos com sucesso"})
}
