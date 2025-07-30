package handlers

import (
	"net/http"
	"strconv"
	"time"

	"agendamento-backend/internal/application/dtos"
	"agendamento-backend/internal/application/usecases"
	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

type BookingHandler struct {
	bookingUseCase *usecases.BookingUseCase
}

func NewBookingHandler(bookingUseCase *usecases.BookingUseCase) *BookingHandler {
	return &BookingHandler{
		bookingUseCase: bookingUseCase,
	}
}

// CreateBooking cria um novo agendamento
// @Summary Criar agendamento
// @Description Cria um novo agendamento de massagem
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param booking body dtos.CreateBookingRequest true "Dados do agendamento"
// @Success 201 {object} dtos.CreateBookingResponse "Agendamento criado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /bookings [post]
func (h *BookingHandler) CreateBooking(c *gin.Context) {
	var req dtos.CreateBookingRequest
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

	// Criar entidade Booking a partir do DTO
	booking := &entities.Booking{
		UserID:    userID,
		ChairID:   req.ChairID,
		StartTime: req.StartTime,
		Notes:     req.Notes,
		Status:    "agendado", // Status padrão
	}

	err := h.bookingUseCase.CreateBooking(booking, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Converter para DTO de resposta
	response := dtos.CreateBookingResponse{
		ID:        booking.ID,
		UserID:    booking.UserID,
		ChairID:   booking.ChairID,
		StartTime: booking.StartTime,
		EndTime:   booking.EndTime,
		Status:    booking.Status,
		Notes:     booking.Notes,
		CreatedAt: booking.CreatedAt,
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Agendamento criado com sucesso",
		"data":    response,
	})
}

// GetBooking busca agendamento por ID
// @Summary Buscar agendamento por ID
// @Description Retorna os dados de um agendamento específico pelo ID
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID do agendamento"
// @Success 200 {object} entities.Booking "Agendamento encontrado"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 404 {object} map[string]string "Agendamento não encontrado"
// @Router /bookings/{id} [get]
func (h *BookingHandler) GetBooking(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	booking, err := h.bookingUseCase.GetBookingByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Agendamento não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": booking})
}

// UpdateBooking atualiza um agendamento
// @Summary Atualizar agendamento
// @Description Atualiza os dados de um agendamento existente
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID do agendamento"
// @Param booking body entities.Booking true "Dados atualizados do agendamento"
// @Success 200 {object} entities.Booking "Agendamento atualizado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 404 {object} map[string]string "Agendamento não encontrado"
// @Router /bookings/{id} [put]
func (h *BookingHandler) UpdateBooking(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var booking entities.Booking
	if bindErr := c.ShouldBindJSON(&booking); bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + bindErr.Error()})
		return
	}

	booking.ID = uint(id)

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	err = h.bookingUseCase.UpdateBooking(&booking, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar o booking atualizado para retornar
	updatedBooking, err := h.bookingUseCase.GetBookingByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar agendamento atualizado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Agendamento atualizado com sucesso",
		"data":    updatedBooking,
	})
}

// CancelBooking cancela um agendamento
// @Summary Cancelar agendamento
// @Description Cancela um agendamento existente com motivo opcional
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID do agendamento"
// @Param reason body object{reason=string} false "Motivo do cancelamento"
// @Success 200 {object} map[string]string "Agendamento cancelado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 404 {object} map[string]string "Agendamento não encontrado"
// @Router /bookings/{id}/cancel [patch]
func (h *BookingHandler) CancelBooking(c *gin.Context) {
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

	// Motivo do cancelamento
	var request struct {
		Reason string `json:"reason"`
	}
	if bindErr := c.ShouldBindJSON(&request); bindErr != nil {
		// Se não for fornecido, usar um motivo padrão
		request.Reason = "Cancelado pelo usuário"
	}

	err = h.bookingUseCase.CancelBooking(uint(id), userID, request.Reason)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Agendamento cancelado com sucesso"})
}

// CompleteBooking completa um agendamento
func (h *BookingHandler) CompleteBooking(c *gin.Context) {
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

	err = h.bookingUseCase.CompleteBooking(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Agendamento completado com sucesso"})
}

// MarkAsNoShow marca agendamento como falta
func (h *BookingHandler) MarkAsNoShow(c *gin.Context) {
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

	err = h.bookingUseCase.MarkAsNoShow(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Agendamento marcado como falta"})
}

// ListBookings lista agendamentos com paginação
// @Summary Listar agendamentos
// @Description Lista agendamentos com paginação e filtros opcionais
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param limit query int false "Limite de registros por página" default(10)
// @Param offset query int false "Offset para paginação" default(0)
// @Param user_id query int false "Filtrar por ID do usuário"
// @Param chair_id query int false "Filtrar por ID da cadeira"
// @Param status query string false "Filtrar por status"
// @Param start_date query string false "Data de início (YYYY-MM-DD)"
// @Param end_date query string false "Data de fim (YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{} "Lista de agendamentos"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /bookings [get]
func (h *BookingHandler) ListBookings(c *gin.Context) {
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
		if userID, parseErr := strconv.ParseUint(userIDParam, 10, 32); parseErr == nil {
			filters["user_id"] = uint(userID)
		}
	}
	if chairIDParam := c.Query("chair_id"); chairIDParam != "" {
		if chairID, parseErr := strconv.ParseUint(chairIDParam, 10, 32); parseErr == nil {
			filters["chair_id"] = uint(chairID)
		}
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
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

	// Verificar se é admin ou atendente para incluir agendamentos passados
	userClaims, exists := middleware.GetUserFromContext(c)
	if exists && (userClaims.Role == "admin" || userClaims.Role == "atendente") {
		// Para atendentes e admins, incluir agendamentos passados por padrão
		// a menos que explicitamente solicitado para excluir
		if includePast := c.Query("include_past"); includePast == "false" {
			filters["exclude_past"] = true
		} else {
			filters["include_past"] = true
		}
	}

	bookings, total, err := h.bookingUseCase.ListBookings(limit, offset, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": bookings,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GetMyBookings busca agendamentos do usuário logado
// @Summary Meus agendamentos
// @Description Lista agendamentos do usuário autenticado
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param limit query int false "Limite de registros por página" default(10)
// @Param offset query int false "Offset para paginação" default(0)
// @Success 200 {object} map[string]interface{} "Lista de agendamentos do usuário"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /bookings/user [get]
func (h *BookingHandler) GetMyBookings(c *gin.Context) {
	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
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

	bookings, total, err := h.bookingUseCase.GetUserBookings(userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": bookings,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GetUserBookings busca agendamentos de um usuário
// @Summary Agendamentos de usuário
// @Description Lista agendamentos de um usuário específico
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param user_id path int true "ID do usuário"
// @Param limit query int false "Limite de registros por página" default(10)
// @Param offset query int false "Offset para paginação" default(0)
// @Success 200 {object} map[string]interface{} "Lista de agendamentos do usuário"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 404 {object} map[string]string "Usuário não encontrado"
// @Router /bookings/user/{user_id} [get]
func (h *BookingHandler) GetUserBookings(c *gin.Context) {
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

	bookings, total, err := h.bookingUseCase.GetUserBookings(uint(userID), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": bookings,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GetTodayBookings busca agendamentos de hoje
// @Summary Agendamentos de hoje
// @Description Lista agendamentos do dia atual
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{} "Lista de agendamentos de hoje"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /bookings/today [get]
func (h *BookingHandler) GetTodayBookings(c *gin.Context) {
	bookings, err := h.bookingUseCase.GetTodayBookings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bookings})
}

// GetUpcomingBookings busca próximos agendamentos
// @Summary Próximos agendamentos
// @Description Lista próximos agendamentos do usuário autenticado
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param limit query int false "Limite de registros" default(10)
// @Success 200 {object} map[string]interface{} "Lista de próximos agendamentos"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /bookings/upcoming [get]
func (h *BookingHandler) GetUpcomingBookings(c *gin.Context) {
	limitParam := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	bookings, err := h.bookingUseCase.GetUpcomingBookings(userID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bookings})
}

// GetBookingStats retorna estatísticas dos agendamentos
// @Summary Estatísticas de agendamentos
// @Description Retorna estatísticas gerais dos agendamentos (apenas atendentes e admins)
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{} "Estatísticas dos agendamentos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Router /bookings/stats [get]
func (h *BookingHandler) GetBookingStats(c *gin.Context) {
	stats, err := h.bookingUseCase.GetBookingStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetChairBookings busca agendamentos de uma cadeira específica
func (h *BookingHandler) GetChairBookings(c *gin.Context) {
	chairIDParam := c.Param("chair_id")
	chairID, err := strconv.ParseUint(chairIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID da cadeira inválido"})
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

	bookings, total, err := h.bookingUseCase.GetBookingsByChair(uint(chairID), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Converter para DTOs com relacionamentos
	bookingResponses := make([]map[string]interface{}, len(bookings))
	for i, booking := range bookings {
		bookingResponses[i] = map[string]interface{}{
			"id":         booking.ID,
			"user_name":  booking.User.Name,
			"date":       booking.StartTime.Format("2006-01-02"),
			"time_slot":  booking.StartTime.Format("15:04") + " - " + booking.EndTime.Format("15:04"),
			"status":     booking.Status,
			"start_time": booking.StartTime,
			"end_time":   booking.EndTime,
			"user_id":    booking.UserID,
			"chair_id":   booking.ChairID,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"bookings": bookingResponses,
		"total":    total,
		"limit":    limit,
		"offset":   offset,
	})
}

// GetBookingsByDate busca agendamentos de uma data específica
// @Summary Agendamentos por data
// @Description Lista agendamentos de uma data específica (apenas atendentes e admins)
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param date path string true "Data para buscar agendamentos (formato: YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{} "Lista de agendamentos da data"
// @Failure 400 {object} map[string]string "Formato de data inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Router /bookings/date/{date} [get]
func (h *BookingHandler) GetBookingsByDate(c *gin.Context) {
	dateParam := c.Param("date")
	date, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use YYYY-MM-DD"})
		return
	}

	bookings, err := h.bookingUseCase.GetBookingsByDate(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bookings})
}

// GetBookingsByDateIncludingPast busca agendamentos de uma data específica incluindo passados
// @Summary Agendamentos por data (incluindo passados)
// @Description Lista agendamentos de uma data específica incluindo passados (apenas admins)
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param date path string true "Data para buscar agendamentos (formato: YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{} "Lista de agendamentos da data incluindo passados"
// @Failure 400 {object} map[string]string "Formato de data inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Router /bookings/date/{date}/including-past [get]
func (h *BookingHandler) GetBookingsByDateIncludingPast(c *gin.Context) {
	// Verificar se é admin
	userClaims, exists := middleware.GetUserFromContext(c)
	if !exists || userClaims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado. Apenas administradores podem acessar agendamentos passados"})
		return
	}

	dateParam := c.Param("date")
	date, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use YYYY-MM-DD"})
		return
	}

	bookings, err := h.bookingUseCase.GetBookingsByDateIncludingPast(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bookings})
}

// GetChairBookingsByDate busca agendamentos de uma cadeira em uma data específica
// @Summary Agendamentos de cadeira por data
// @Description Lista agendamentos de uma cadeira específica em uma data (apenas atendentes e admins)
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param chair_id path int true "ID da cadeira"
// @Param date path string true "Data para buscar agendamentos (formato: YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{} "Lista de agendamentos da cadeira na data"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Router /bookings/chair/{chair_id}/date/{date} [get]
func (h *BookingHandler) GetChairBookingsByDate(c *gin.Context) {
	chairIDParam := c.Param("chair_id")
	chairID, err := strconv.ParseUint(chairIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID da cadeira inválido"})
		return
	}

	dateParam := c.Param("date")
	date, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use YYYY-MM-DD"})
		return
	}

	bookings, err := h.bookingUseCase.GetChairBookingsByDate(uint(chairID), date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bookings})
}

// RescheduleBooking reagenda um agendamento
// @Summary Reagendar agendamento
// @Description Reagenda um agendamento existente (apenas admin)
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID do agendamento"
// @Param reschedule body object true "Dados para reagendamento"
// @Success 200 {object} map[string]string "Agendamento reagendado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Agendamento não encontrado"
// @Router /bookings/{id}/reschedule [put]
func (h *BookingHandler) RescheduleBooking(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		StartTime time.Time `json:"start_time" binding:"required"`
		ChairID   uint      `json:"chair_id"`
		UpdatedBy uint      `json:"updated_by" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.bookingUseCase.RescheduleBooking(uint(id), req.StartTime, req.ChairID, req.UpdatedBy)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Agendamento reagendado com sucesso"})
}

// MarkAttendance marca presença do usuário
// @Summary Marcar presença
// @Description Marca presença ou falta de um usuário em um agendamento (apenas atendentes e admins)
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID do agendamento"
// @Param attendance body object true "Dados de presença"
// @Success 200 {object} map[string]string "Presença marcada com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Agendamento não encontrado"
// @Router /bookings/{id}/attendance [post]
func (h *BookingHandler) MarkAttendance(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var req struct {
		Attended bool `json:"attended" binding:"required"`
		MarkedBy uint `json:"marked_by" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var err2 error
	if req.Attended {
		err2 = h.bookingUseCase.ConfirmPresence(uint(id), req.MarkedBy)
	} else {
		err2 = h.bookingUseCase.MarkAsNoShow(uint(id), req.MarkedBy)
	}

	if err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err2.Error()})
		return
	}

	message := "Presença marcada com sucesso"
	if !req.Attended {
		message = "Falta marcada com sucesso"
	}

	c.JSON(http.StatusOK, gin.H{"message": message})
}

// GetSystemStats retorna estatísticas gerais do sistema (apenas admin)
// @Summary Estatísticas do sistema
// @Description Retorna estatísticas gerais do sistema para administradores
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{} "Estatísticas do sistema"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Acesso negado - apenas administradores"
// @Router /bookings/system-stats [get]
func (h *BookingHandler) GetSystemStats(c *gin.Context) {
	// Verificar se é admin
	userClaims, exists := middleware.GetUserFromContext(c)
	if !exists || userClaims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado. Apenas administradores podem acessar estatísticas do sistema"})
		return
	}

	stats, err := h.bookingUseCase.GetSystemStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar estatísticas do sistema"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetAttendantStats retorna estatísticas para atendentes
// @Summary Estatísticas do atendente
// @Description Retorna estatísticas específicas para atendentes
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{} "Estatísticas do atendente"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Acesso negado - apenas atendentes e admins"
// @Router /bookings/attendant-stats [get]
func (h *BookingHandler) GetAttendantStats(c *gin.Context) {
	// Verificar se é atendente ou admin
	userClaims, exists := middleware.GetUserFromContext(c)
	if !exists || (userClaims.Role != "atendente" && userClaims.Role != "admin") {
		c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado. Apenas atendentes e administradores podem acessar estas estatísticas"})
		return
	}

	stats, err := h.bookingUseCase.GetAttendantStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar estatísticas do atendente"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetUserStats retorna estatísticas de um usuário específico
// @Summary Estatísticas do usuário
// @Description Retorna estatísticas de agendamentos de um usuário específico
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param user_id query int false "ID do usuário (opcional, usa usuário logado se não informado)"
// @Success 200 {object} map[string]interface{} "Estatísticas do usuário"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Acesso negado"
// @Router /bookings/user-stats [get]
func (h *BookingHandler) GetUserStats(c *gin.Context) {
	userClaims, exists := middleware.GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	// Verificar se está buscando estatísticas de outro usuário
	userIDParam := c.Query("user_id")
	var targetUserID uint

	if userIDParam != "" {
		// Se informou user_id, verificar permissões
		if userClaims.Role != "admin" && userClaims.Role != "atendente" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado. Apenas administradores e atendentes podem ver estatísticas de outros usuários"})
			return
		}

		userID, err := strconv.ParseUint(userIDParam, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "ID do usuário inválido"})
			return
		}
		targetUserID = uint(userID)
	} else {
		// Usar o usuário logado
		targetUserID = userClaims.ID
	}

	stats, err := h.bookingUseCase.GetUserStats(targetUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar estatísticas do usuário"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetRescheduleOptions busca opções disponíveis para reagendamento
// @Summary Buscar opções de reagendamento
// @Description Busca horários disponíveis para reagendar um agendamento específico
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param booking_id path int true "ID do agendamento"
// @Param date query string true "Data para buscar disponibilidades (YYYY-MM-DD)"
// @Success 200 {object} dtos.RescheduleOptionsResponse "Opções de reagendamento"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 404 {object} map[string]string "Agendamento não encontrado"
// @Router /bookings/reschedule-options/{booking_id} [get]
func (h *BookingHandler) GetRescheduleOptions(c *gin.Context) {
	bookingIDParam := c.Param("booking_id")
	bookingID, err := strconv.ParseUint(bookingIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do agendamento inválido"})
		return
	}

	dateParam := c.Query("date")
	if dateParam == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data é obrigatória"})
		return
	}

	date, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use YYYY-MM-DD"})
		return
	}

	options, err := h.bookingUseCase.GetRescheduleOptions(uint(bookingID), date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": options})
}

// RescheduleBookingDateTime reagenda apenas data e horário de um agendamento
// @Summary Reagendar data e horário
// @Description Reagenda apenas a data e horário de um agendamento existente
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param booking_id path int true "ID do agendamento"
// @Param reschedule body dtos.RescheduleBookingRequest true "Dados para reagendamento"
// @Success 200 {object} dtos.RescheduleBookingResponse "Agendamento reagendado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 404 {object} map[string]string "Agendamento não encontrado"
// @Router /bookings/reschedule-datetime/{booking_id} [put]
func (h *BookingHandler) RescheduleBookingDateTime(c *gin.Context) {
	bookingIDParam := c.Param("booking_id")
	bookingID, err := strconv.ParseUint(bookingIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID do agendamento inválido"})
		return
	}

	var req dtos.RescheduleBookingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + err.Error()})
		return
	}

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	err = h.bookingUseCase.RescheduleBookingDateTime(uint(bookingID), req.StartTime, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar o booking atualizado para retornar
	updatedBooking, err := h.bookingUseCase.GetBookingByID(uint(bookingID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar agendamento atualizado"})
		return
	}

	// Converter para DTO de resposta
	response := dtos.RescheduleBookingResponse{
		ID:        updatedBooking.ID,
		UserID:    updatedBooking.UserID,
		ChairID:   updatedBooking.ChairID,
		StartTime: updatedBooking.StartTime,
		EndTime:   updatedBooking.EndTime,
		Status:    updatedBooking.Status,
		Notes:     updatedBooking.Notes,
		UpdatedAt: updatedBooking.UpdatedAt,
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Agendamento reagendado com sucesso",
		"data":    response,
	})
}
