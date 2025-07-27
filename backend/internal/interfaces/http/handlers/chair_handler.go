package handlers

import (
	"net/http"
	"strconv"

	"agendamento-backend/internal/application/dtos"
	"agendamento-backend/internal/application/mappers"
	"agendamento-backend/internal/application/usecases"
	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

type ChairHandler struct {
	chairUseCase *usecases.ChairUseCase
}

func NewChairHandler(chairUseCase *usecases.ChairUseCase) *ChairHandler {
	return &ChairHandler{
		chairUseCase: chairUseCase,
	}
}

// CreateChair cria uma nova cadeira
// @Summary Criar cadeira
// @Description Cria uma nova cadeira de massagem no sistema (apenas admins)
// @Tags chairs
// @Accept json
// @Produce json
// @Security Bearer
// @Param chair body dtos.CreateChairRequest true "Dados da cadeira"
// @Success 201 {object} dtos.CreateChairResponse "Cadeira criada com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Router /chairs [post]
func (h *ChairHandler) CreateChair(c *gin.Context) {
	var req dtos.CreateChairRequest
	if bindErr := c.ShouldBindJSON(&req); bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + bindErr.Error()})
		return
	}

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	// Converter DTO para entidade
	chair := mappers.ToChairEntity(&req)

	err := h.chairUseCase.CreateChair(chair, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar a cadeira criada para retornar
	createdChair, err := h.chairUseCase.GetChairByID(chair.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cadeira criada"})
		return
	}

	// Converter entidade para DTO de resposta
	response := mappers.ToCreateChairResponse(createdChair)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Cadeira criada com sucesso",
		"data":    response,
	})
}

// GetChair busca cadeira por ID
// @Summary Buscar cadeira por ID
// @Description Retorna os dados de uma cadeira específica pelo ID
// @Tags chairs
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID da cadeira"
// @Success 200 {object} dtos.ChairResponse "Cadeira encontrada"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 404 {object} map[string]string "Cadeira não encontrada"
// @Router /chairs/{id} [get]
func (h *ChairHandler) GetChair(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	chair, err := h.chairUseCase.GetChairByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cadeira não encontrada"})
		return
	}

	// Converter entidade para DTO de resposta
	response := mappers.ToChairResponse(chair)

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// UpdateChair atualiza uma cadeira
// @Summary Atualizar cadeira
// @Description Atualiza os dados de uma cadeira existente (apenas admins)
// @Tags chairs
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID da cadeira"
// @Param chair body entities.Chair true "Dados atualizados da cadeira"
// @Success 200 {object} entities.Chair "Cadeira atualizada com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Cadeira não encontrada"
// @Router /chairs/{id} [put]
func (h *ChairHandler) UpdateChair(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var chair entities.Chair
	if bindErr := c.ShouldBindJSON(&chair); bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + bindErr.Error()})
		return
	}

	chair.ID = uint(id)
	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}
	err = h.chairUseCase.UpdateChair(&chair, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar a cadeira atualizada para retornar
	updatedChair, err := h.chairUseCase.GetChairByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cadeira atualizada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Cadeira atualizada com sucesso",
		"data":    updatedChair,
	})
}

// DeleteChair exclui uma cadeira
// @Summary Excluir cadeira
// @Description Exclui uma cadeira do sistema (apenas admins)
// @Tags chairs
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID da cadeira"
// @Success 200 {object} map[string]string "Cadeira excluída com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Cadeira não encontrada"
// @Router /chairs/{id} [delete]
func (h *ChairHandler) DeleteChair(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	err = h.chairUseCase.DeleteChair(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cadeira excluída com sucesso"})
}

// ListChairs lista cadeiras com paginação
// @Summary Listar cadeiras
// @Description Retorna uma lista paginada de todas as cadeiras disponíveis
// @Tags chairs
// @Accept json
// @Produce json
// @Security Bearer
// @Param limit query int false "Limite de resultados por página" default(10)
// @Param offset query int false "Número de registros a pular" default(0)
// @Param status query string false "Filtrar por status da cadeira"
// @Success 200 {array} entities.Chair "Lista de cadeiras"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /chairs [get]
func (h *ChairHandler) ListChairs(c *gin.Context) {
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
	if name := c.Query("name"); name != "" {
		filters["name"] = name
	}
	if location := c.Query("location"); location != "" {
		filters["location"] = location
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}

	chairs, total, err := h.chairUseCase.ListChairs(limit, offset, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Converter entidades para DTOs de resposta
	response := mappers.ToListChairsResponse(chairs, total, limit, offset)

	c.JSON(http.StatusOK, gin.H{
		"data": response,
	})
}

// GetActiveChairs busca cadeiras ativas
// @Summary Buscar cadeiras ativas
// @Description Lista cadeiras ativas com paginação
// @Tags chairs
// @Accept json
// @Produce json
// @Security Bearer
// @Param limit query int false "Limite de registros por página" default(10)
// @Param offset query int false "Offset para paginação" default(0)
// @Success 200 {object} map[string]interface{} "Lista de cadeiras ativas"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /chairs/active [get]
func (h *ChairHandler) GetActiveChairs(c *gin.Context) {
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

	chairs, total, err := h.chairUseCase.GetActiveChairs(limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Converter entidades para DTOs de resposta
	response := mappers.ToListChairsResponse(chairs, total, limit, offset)

	c.JSON(http.StatusOK, gin.H{
		"data": response,
	})
}

// GetAvailableChairs busca cadeiras disponíveis
// @Summary Buscar cadeiras disponíveis
// @Description Lista cadeiras disponíveis para agendamento
// @Tags chairs
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{} "Lista de cadeiras disponíveis"
// @Failure 400 {object} map[string]string "Erro ao buscar cadeiras"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /chairs/available [get]
func (h *ChairHandler) GetAvailableChairs(c *gin.Context) {
	chairs, err := h.chairUseCase.GetAvailableChairs()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Converter entidades para DTOs de resposta
	response := mappers.ToChairResponseList(chairs)

	c.JSON(http.StatusOK, gin.H{"data": response})
}

// ChangeChairStatus altera o status de uma cadeira
// @Summary Alterar status da cadeira
// @Description Altera o status de uma cadeira específica (apenas admin)
// @Tags chairs
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID da cadeira"
// @Param status body object true "Novo status da cadeira"
// @Success 200 {object} map[string]string "Status alterado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Cadeira não encontrada"
// @Router /chairs/{id}/status [put]
func (h *ChairHandler) ChangeChairStatus(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var request struct {
		Status string `json:"status" binding:"required"`
	}

	if bindErr := c.ShouldBindJSON(&request); bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status é obrigatório"})
		return
	}

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}
	err = h.chairUseCase.ChangeChairStatus(uint(id), request.Status, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status da cadeira alterado com sucesso"})
}

// ActivateChair ativa uma cadeira
// @Summary Ativar cadeira
// @Description Ativa uma cadeira específica (apenas admin)
// @Tags chairs
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID da cadeira"
// @Success 200 {object} map[string]string "Cadeira ativada com sucesso"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Cadeira não encontrada"
// @Router /chairs/{id}/activate [post]
func (h *ChairHandler) ActivateChair(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}
	err = h.chairUseCase.ActivateChair(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cadeira ativada com sucesso"})
}

// DeactivateChair desativa uma cadeira
// @Summary Desativar cadeira
// @Description Desativa uma cadeira específica (apenas admin)
// @Tags chairs
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID da cadeira"
// @Success 200 {object} map[string]string "Cadeira desativada com sucesso"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Cadeira não encontrada"
// @Router /chairs/{id}/deactivate [post]
func (h *ChairHandler) DeactivateChair(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}
	err = h.chairUseCase.DeactivateChair(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cadeira desativada com sucesso"})
}

// GetChairStats retorna estatísticas das cadeiras
// @Summary Estatísticas das cadeiras
// @Description Retorna estatísticas gerais das cadeiras
// @Tags chairs
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{} "Estatísticas das cadeiras"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /chairs/stats [get]
func (h *ChairHandler) GetChairStats(c *gin.Context) {
	stats, err := h.chairUseCase.GetChairStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Converter para DTO de resposta
	response := mappers.ToChairStatsResponse(stats)

	c.JSON(http.StatusOK, gin.H{"data": response})
}
