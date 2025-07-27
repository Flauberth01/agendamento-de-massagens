package handlers

import (
	"net/http"
	"strconv"
	"time"

	"agendamento-backend/internal/application/usecases"
	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

type AvailabilityHandler struct {
	availabilityUseCase *usecases.AvailabilityUseCase
}

func NewAvailabilityHandler(availabilityUseCase *usecases.AvailabilityUseCase) *AvailabilityHandler {
	return &AvailabilityHandler{
		availabilityUseCase: availabilityUseCase,
	}
}

// CreateAvailability cria uma nova disponibilidade
// @Summary Criar disponibilidade
// @Description Cria uma nova disponibilidade para uma cadeira (apenas admins)
// @Tags availabilities
// @Accept json
// @Produce json
// @Security Bearer
// @Param availability body entities.Availability true "Dados da disponibilidade"
// @Success 201 {object} entities.Availability "Disponibilidade criada com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Router /availabilities [post]
func (h *AvailabilityHandler) CreateAvailability(c *gin.Context) {
	var availability entities.Availability
	if bindErr := c.ShouldBindJSON(&availability); bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + bindErr.Error()})
		return
	}

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	err := h.availabilityUseCase.CreateAvailability(&availability, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar a disponibilidade criada para retornar
	createdAvailability, err := h.availabilityUseCase.GetAvailabilityByID(availability.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar disponibilidade criada"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Disponibilidade criada com sucesso",
		"data":    createdAvailability,
	})
}

// GetAvailability busca disponibilidade por ID
// @Summary Buscar disponibilidade por ID
// @Description Retorna os dados de uma disponibilidade específica pelo ID
// @Tags availabilities
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID da disponibilidade"
// @Success 200 {object} entities.Availability "Disponibilidade encontrada"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 404 {object} map[string]string "Disponibilidade não encontrada"
// @Router /availabilities/{id} [get]
func (h *AvailabilityHandler) GetAvailability(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	availability, err := h.availabilityUseCase.GetAvailabilityByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Disponibilidade não encontrada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": availability})
}

// UpdateAvailability atualiza uma disponibilidade
// @Summary Atualizar disponibilidade
// @Description Atualiza os dados de uma disponibilidade existente (apenas admins)
// @Tags availabilities
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID da disponibilidade"
// @Param availability body entities.Availability true "Dados atualizados da disponibilidade"
// @Success 200 {object} entities.Availability "Disponibilidade atualizada com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Disponibilidade não encontrada"
// @Router /availabilities/{id} [put]
func (h *AvailabilityHandler) UpdateAvailability(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var availability entities.Availability
	if bindErr := c.ShouldBindJSON(&availability); bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + bindErr.Error()})
		return
	}

	availability.ID = uint(id)

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	err = h.availabilityUseCase.UpdateAvailability(&availability, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updatedAvailability, err := h.availabilityUseCase.GetAvailabilityByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar disponibilidade atualizada"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Disponibilidade atualizada com sucesso",
		"data":    updatedAvailability,
	})
}

// DeleteAvailability exclui uma disponibilidade
func (h *AvailabilityHandler) DeleteAvailability(c *gin.Context) {
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

	err = h.availabilityUseCase.DeleteAvailability(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Disponibilidade excluída com sucesso"})
}

// ListAvailabilities lista disponibilidades com paginação
// @Summary Listar disponibilidades
// @Description Retorna uma lista paginada de disponibilidades com filtros opcionais
// @Tags availabilities
// @Accept json
// @Produce json
// @Security Bearer
// @Param limit query int false "Limite de resultados por página" default(10)
// @Param offset query int false "Número de registros a pular" default(0)
// @Param chair_id query int false "Filtrar por ID da cadeira"
// @Param day_of_week query int false "Filtrar por dia da semana (0=Domingo, 6=Sábado)"
// @Param is_active query bool false "Filtrar por status ativo"
// @Success 200 {array} entities.Availability "Lista de disponibilidades"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /availabilities [get]
func (h *AvailabilityHandler) ListAvailabilities(c *gin.Context) {
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
	if chairIDParam := c.Query("chair_id"); chairIDParam != "" {
		if chairID, parseErr := strconv.ParseUint(chairIDParam, 10, 32); parseErr == nil {
			filters["chair_id"] = uint(chairID)
		}
	}
	if dayOfWeekParam := c.Query("day_of_week"); dayOfWeekParam != "" {
		if dayOfWeek, parseErr := strconv.Atoi(dayOfWeekParam); parseErr == nil {
			filters["day_of_week"] = dayOfWeek
		}
	}
	if isActiveParam := c.Query("is_active"); isActiveParam != "" {
		if isActive, parseErr := strconv.ParseBool(isActiveParam); parseErr == nil {
			filters["is_active"] = isActive
		}
	}

	availabilities, total, err := h.availabilityUseCase.ListAvailabilities(limit, offset, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": availabilities,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GetChairAvailabilities busca disponibilidades de uma cadeira
// @Summary Buscar disponibilidades de uma cadeira
// @Description Retorna todas as disponibilidades configuradas para uma cadeira específica
// @Tags availabilities
// @Accept json
// @Produce json
// @Security Bearer
// @Param chair_id path int true "ID da cadeira"
// @Success 200 {array} entities.Availability "Disponibilidades da cadeira"
// @Failure 400 {object} map[string]string "ID da cadeira inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 404 {object} map[string]string "Cadeira não encontrada"
// @Router /chairs/{chair_id}/availabilities [get]
func (h *AvailabilityHandler) GetChairAvailabilities(c *gin.Context) {
	chairIDParam := c.Param("chair_id")
	chairID, err := strconv.ParseUint(chairIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID da cadeira inválido"})
		return
	}

	availabilities, err := h.availabilityUseCase.GetChairAvailabilities(uint(chairID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": availabilities})
}

// GetAvailableTimeSlots busca horários disponíveis
// @Summary Buscar horários disponíveis
// @Description Retorna os horários disponíveis para agendamento em uma cadeira específica em uma data
// @Tags availabilities
// @Accept json
// @Produce json
// @Security Bearer
// @Param chair_id path int true "ID da cadeira"
// @Param date query string true "Data para buscar horários (formato: YYYY-MM-DD)"
// @Success 200 {array} string "Lista de horários disponíveis"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /chairs/{chair_id}/available-slots [get]
func (h *AvailabilityHandler) GetAvailableTimeSlots(c *gin.Context) {
	chairIDParam := c.Param("chair_id")
	chairID, err := strconv.ParseUint(chairIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID da cadeira inválido"})
		return
	}

	dateParam := c.Query("date")
	if dateParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data é obrigatória"})
		return
	}

	date, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido (YYYY-MM-DD)"})
		return
	}

	timeSlots, err := h.availabilityUseCase.GetAvailableTimeSlots(uint(chairID), date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": timeSlots})
}

// ActivateAvailability ativa uma disponibilidade
func (h *AvailabilityHandler) ActivateAvailability(c *gin.Context) {
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

	err = h.availabilityUseCase.ActivateAvailability(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Disponibilidade ativada com sucesso"})
}

// DeactivateAvailability desativa uma disponibilidade
func (h *AvailabilityHandler) DeactivateAvailability(c *gin.Context) {
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

	err = h.availabilityUseCase.DeactivateAvailability(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Disponibilidade desativada com sucesso"})
}

// SetValidityPeriod define período de validade
func (h *AvailabilityHandler) SetValidityPeriod(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var request struct {
		ValidFrom string `json:"valid_from" binding:"required"`
		ValidTo   string `json:"valid_to" binding:"required"`
	}

	if bindErr := c.ShouldBindJSON(&request); bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + bindErr.Error()})
		return
	}

	validFrom, parseErr := time.Parse("2006-01-02", request.ValidFrom)
	if parseErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido para valid_from (YYYY-MM-DD)"})
		return
	}

	validTo, parseErr := time.Parse("2006-01-02", request.ValidTo)
	if parseErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido para valid_to (YYYY-MM-DD)"})
		return
	}

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	err = h.availabilityUseCase.SetValidityPeriod(uint(id), &validFrom, &validTo, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Período de validade definido com sucesso"})
}

// GetAvailabilityStats retorna estatísticas das disponibilidades
func (h *AvailabilityHandler) GetAvailabilityStats(c *gin.Context) {
	stats, err := h.availabilityUseCase.GetAvailabilityStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}
