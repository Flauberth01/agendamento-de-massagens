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
// @Description Cria um novo agendamento para uma cadeira de massagem
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param booking body entities.Booking true "Dados do agendamento"
// @Success 201 {object} entities.Booking "Agendamento criado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /bookings [post]
func (h *BookingHandler) CreateBooking(c *gin.Context) {
	var booking entities.Booking
	if bindErr := c.ShouldBindJSON(&booking); bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + bindErr.Error()})
		return
	}

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	err := h.bookingUseCase.CreateBooking(&booking, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar o booking criado para retornar
	createdBooking, err := h.bookingUseCase.GetBookingByID(booking.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar agendamento criado"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Agendamento criado com sucesso",
		"data":    createdBooking,
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

// ConfirmBooking confirma um agendamento
// @Summary Confirmar agendamento
// @Description Confirma um agendamento pendente (apenas para atendentes/admins)
// @Tags bookings
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID do agendamento"
// @Success 200 {object} map[string]string "Agendamento confirmado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Agendamento não encontrado"
// @Router /bookings/{id}/confirm [patch]
func (h *BookingHandler) ConfirmBooking(c *gin.Context) {
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

	err = h.bookingUseCase.ConfirmBooking(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Agendamento confirmado com sucesso"})
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
func (h *BookingHandler) GetTodayBookings(c *gin.Context) {
	bookings, err := h.bookingUseCase.GetTodayBookings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bookings})
}

// GetUpcomingBookings busca próximos agendamentos
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

	c.JSON(http.StatusOK, gin.H{
		"data": bookings,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GetBookingsByDate busca agendamentos de uma data específica
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

// GetChairBookingsByDate busca agendamentos de uma cadeira em uma data específica
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
		err2 = h.bookingUseCase.CompleteBooking(uint(id), req.MarkedBy)
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
