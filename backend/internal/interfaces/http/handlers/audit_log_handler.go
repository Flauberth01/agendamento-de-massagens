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
// @Summary Logs de auditoria por ação
// @Description Lista logs de auditoria filtrados por uma ação específica
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Param action path string true "Ação para filtrar (ex: CREATE, UPDATE, DELETE, LOGIN)"
// @Param limit query int false "Limite de registros por página" default(10)
// @Param offset query int false "Offset para paginação" default(0)
// @Success 200 {object} map[string]interface{} "Lista de logs de auditoria por ação"
// @Failure 400 {object} map[string]string "Ação obrigatória"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /audit-logs/action/{action} [get]
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
// @Summary Logs de auditoria por recurso
// @Description Lista logs de auditoria filtrados por um recurso específico
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Param resource path string true "Recurso para filtrar (ex: USER, BOOKING, CHAIR, AVAILABILITY)"
// @Param limit query int false "Limite de registros por página" default(10)
// @Param offset query int false "Offset para paginação" default(0)
// @Success 200 {object} map[string]interface{} "Lista de logs de auditoria por recurso"
// @Failure 400 {object} map[string]string "Recurso obrigatório"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /audit-logs/resource/{resource} [get]
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
// @Summary Logs de auditoria por período
// @Description Lista logs de auditoria filtrados por um período específico
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Param start_date query string true "Data de início (formato: YYYY-MM-DD)"
// @Param end_date query string true "Data de fim (formato: YYYY-MM-DD)"
// @Param limit query int false "Limite de registros por página" default(10)
// @Param offset query int false "Offset para paginação" default(0)
// @Success 200 {object} map[string]interface{} "Lista de logs de auditoria por período"
// @Failure 400 {object} map[string]string "Datas obrigatórias ou formato inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /audit-logs/date-range [get]
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
// @Summary Atividade recente
// @Description Lista as atividades mais recentes do sistema
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Param limit query int false "Limite de registros" default(10)
// @Success 200 {object} map[string]interface{} "Lista de atividades recentes"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /audit-logs/activity/recent [get]
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
// @Summary Atividade de usuário
// @Description Lista as atividades de um usuário específico
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Param user_id path int true "ID do usuário"
// @Param limit query int false "Limite de registros" default(10)
// @Success 200 {object} map[string]interface{} "Lista de atividades do usuário"
// @Failure 400 {object} map[string]string "ID do usuário inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /audit-logs/activity/user/{user_id} [get]
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
// @Summary Atividade do sistema
// @Description Lista as atividades do sistema (ações automáticas)
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Param limit query int false "Limite de registros" default(10)
// @Success 200 {object} map[string]interface{} "Lista de atividades do sistema"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /audit-logs/activity/system [get]
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
// @Summary Usuários mais ativos
// @Description Lista os usuários mais ativos em um período específico
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Param start_date query string true "Data de início (formato: YYYY-MM-DD)"
// @Param end_date query string true "Data de fim (formato: YYYY-MM-DD)"
// @Param limit query int false "Limite de registros" default(10)
// @Success 200 {object} map[string]interface{} "Lista de usuários mais ativos"
// @Failure 400 {object} map[string]string "Datas obrigatórias ou formato inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /audit-logs/reports/active-users [get]
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
// @Summary Ações mais comuns
// @Description Lista as ações mais comuns em um período específico
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Param start_date query string true "Data de início (formato: YYYY-MM-DD)"
// @Param end_date query string true "Data de fim (formato: YYYY-MM-DD)"
// @Param limit query int false "Limite de registros" default(10)
// @Success 200 {object} map[string]interface{} "Lista de ações mais comuns"
// @Failure 400 {object} map[string]string "Datas obrigatórias ou formato inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /audit-logs/reports/common-actions [get]
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
// @Summary Estatísticas de auditoria
// @Description Retorna estatísticas gerais dos logs de auditoria
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{} "Estatísticas de auditoria"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /audit-logs/stats [get]
func (h *AuditLogHandler) GetAuditStats(c *gin.Context) {
	stats, err := h.auditLogUseCase.GetAuditStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// CleanupOldLogs limpa logs antigos
// @Summary Limpar logs antigos
// @Description Remove logs de auditoria mais antigos que o período especificado
// @Tags audit-logs
// @Accept json
// @Produce json
// @Security Bearer
// @Param retention_days query int false "Dias de retenção" default(90)
// @Success 200 {object} map[string]string "Logs antigos removidos com sucesso"
// @Failure 400 {object} map[string]string "Dias de retenção inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /audit-logs/cleanup [delete]
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
