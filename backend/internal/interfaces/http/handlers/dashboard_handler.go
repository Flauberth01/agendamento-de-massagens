package handlers

import (
	"fmt"
	"net/http"
	"time"

	"agendamento-backend/internal/application/usecases"
	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

type DashboardHandler struct {
	bookingUseCase      *usecases.BookingUseCase
	userUseCase         *usecases.UserUseCase
	chairUseCase        *usecases.ChairUseCase
	notificationUseCase *usecases.NotificationUseCase
}

func NewDashboardHandler(
	bookingUseCase *usecases.BookingUseCase,
	userUseCase *usecases.UserUseCase,
	chairUseCase *usecases.ChairUseCase,
	notificationUseCase *usecases.NotificationUseCase,
) *DashboardHandler {
	return &DashboardHandler{
		bookingUseCase:      bookingUseCase,
		userUseCase:         userUseCase,
		chairUseCase:        chairUseCase,
		notificationUseCase: notificationUseCase,
	}
}

// GetAttendantDashboard retorna dados do dashboard para atendentes
// @Summary Dashboard do atendente
// @Description Retorna dados do dashboard com agendamentos e estatísticas para atendentes
// @Tags dashboard
// @Accept json
// @Produce json
// @Security Bearer
// @Param date query string false "Data para filtrar agendamentos (formato: YYYY-MM-DD)" default(hoje)
// @Success 200 {object} map[string]interface{} "Dados do dashboard"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Acesso negado - apenas atendentes e admins"
// @Router /dashboard/attendant [get]
func (h *DashboardHandler) GetAttendantDashboard(c *gin.Context) {
	// Verificar se é atendente ou admin
	userClaims, _ := middleware.GetUserFromContext(c)
	if userClaims.Role != "atendente" && userClaims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado"})
		return
	}

	// Parâmetro de data (opcional, padrão hoje)
	dateParam := c.DefaultQuery("date", time.Now().Format("2006-01-02"))
	date, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use YYYY-MM-DD"})
		return
	}

	// Buscar agendamentos do dia
	bookings, err := h.bookingUseCase.GetBookingsByDate(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar agendamentos"})
		return
	}

	// Buscar estatísticas básicas
	stats, err := h.bookingUseCase.GetBookingStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar estatísticas"})
		return
	}

	// Buscar cadeiras ativas
	chairs, _, err := h.chairUseCase.GetActiveChairs(100, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cadeiras"})
		return
	}

	// Calcular ocupação por cadeira
	chairOccupancy := h.calculateChairOccupancy(bookings, chairs)

	// Calcular indicadores do dia
	dayIndicators := h.calculateDayIndicators(bookings)

	dashboard := gin.H{
		"date":            date.Format("2006-01-02"),
		"bookings":        bookings,
		"stats":           stats,
		"chair_occupancy": chairOccupancy,
		"day_indicators":  dayIndicators,
		"total_chairs":    len(chairs),
	}

	c.JSON(http.StatusOK, gin.H{"data": dashboard})
}

// GetAdminDashboard retorna dados do dashboard para administradores
// @Summary Dashboard do administrador
// @Description Retorna dados completos do dashboard com estatísticas, usuários pendentes e ocupação das cadeiras para administradores
// @Tags dashboard
// @Accept json
// @Produce json
// @Security Bearer
// @Param date query string false "Data para filtrar agendamentos (formato: YYYY-MM-DD)" default(hoje)
// @Success 200 {object} map[string]interface{} "Dados completos do dashboard"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Acesso negado - apenas administradores"
// @Router /dashboard/admin [get]
func (h *DashboardHandler) GetAdminDashboard(c *gin.Context) {
	// Verificar se é admin
	userClaims, _ := middleware.GetUserFromContext(c)
	if userClaims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado"})
		return
	}

	// Parâmetro de data (opcional, padrão hoje)
	dateParam := c.DefaultQuery("date", time.Now().Format("2006-01-02"))
	date, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use YYYY-MM-DD"})
		return
	}

	// Buscar agendamentos do dia
	bookings, err := h.bookingUseCase.GetBookingsByDate(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar agendamentos"})
		return
	}

	// Buscar estatísticas completas
	stats, err := h.bookingUseCase.GetBookingStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar estatísticas"})
		return
	}

	// Buscar usuários pendentes de aprovação
	pendingUsers, err := h.userUseCase.GetPendingUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuários pendentes"})
		return
	}

	// Buscar todas as cadeiras
	allChairs, _, err := h.chairUseCase.ListChairs(1000, 0, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cadeiras"})
		return
	}

	// Calcular ocupação por cadeira
	chairOccupancy := h.calculateChairOccupancy(bookings, allChairs)

	// Calcular indicadores do dia
	dayIndicators := h.calculateDayIndicators(bookings)

	// Calcular indicadores gerais
	generalIndicators := h.calculateGeneralIndicators()

	// Calcular estatísticas de cadeiras
	chairStats := h.calculateChairStats(allChairs)

	dashboard := gin.H{
		"date":               date.Format("2006-01-02"),
		"bookings":           bookings,
		"stats":              stats,
		"pending_users":      pendingUsers,
		"chair_occupancy":    chairOccupancy,
		"day_indicators":     dayIndicators,
		"general_indicators": generalIndicators,
		"chair_stats":        chairStats,
	}

	c.JSON(http.StatusOK, gin.H{"data": dashboard})
}

// GetSessionsByDate busca sessões agendadas por data
// @Summary Sessões por data
// @Description Retorna agendamentos de uma data específica (apenas atendentes e admins)
// @Tags dashboard
// @Accept json
// @Produce json
// @Security Bearer
// @Param date path string true "Data para buscar sessões (formato: YYYY-MM-DD)"
// @Success 200 {object} map[string]interface{} "Lista de agendamentos da data"
// @Failure 400 {object} map[string]string "Formato de data inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Acesso negado"
// @Router /dashboard/sessions/date/{date} [get]
func (h *DashboardHandler) GetSessionsByDate(c *gin.Context) {
	dateParam := c.Param("date")
	date, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use YYYY-MM-DD"})
		return
	}

	bookings, err := h.bookingUseCase.GetBookingsByDate(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar agendamentos"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bookings})
}

// GetPendingApprovals busca usuários pendentes de aprovação
// @Summary Buscar usuários pendentes
// @Description Retorna lista de usuários aguardando aprovação do administrador
// @Tags dashboard
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {array} entities.User "Lista de usuários pendentes"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Acesso negado - apenas administradores"
// @Router /dashboard/pending-approvals [get]
func (h *DashboardHandler) GetPendingApprovals(c *gin.Context) {
	// Verificar se é admin
	userClaims, _ := middleware.GetUserFromContext(c)
	if userClaims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado"})
		return
	}

	pendingUsers, err := h.userUseCase.GetPendingUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuários pendentes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": pendingUsers})
}

// GetChairOccupancy busca ocupação das cadeiras
// @Summary Ocupação das cadeiras
// @Description Retorna dados de ocupação das cadeiras para uma data específica
// @Tags dashboard
// @Accept json
// @Produce json
// @Security Bearer
// @Param date query string false "Data para calcular ocupação (formato: YYYY-MM-DD)" default(hoje)
// @Success 200 {object} map[string]interface{} "Dados de ocupação das cadeiras"
// @Failure 400 {object} map[string]string "Formato de data inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /dashboard/chair-occupancy [get]
func (h *DashboardHandler) GetChairOccupancy(c *gin.Context) {
	// Parâmetro de data (opcional, padrão hoje)
	dateParam := c.DefaultQuery("date", time.Now().Format("2006-01-02"))
	date, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use YYYY-MM-DD"})
		return
	}

	// Buscar agendamentos do dia
	bookings, err := h.bookingUseCase.GetBookingsByDate(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar agendamentos"})
		return
	}

	// Buscar cadeiras ativas
	chairs, _, err := h.chairUseCase.GetActiveChairs(100, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cadeiras"})
		return
	}

	// Calcular ocupação por cadeira
	chairOccupancy := h.calculateChairOccupancy(bookings, chairs)

	c.JSON(http.StatusOK, gin.H{"data": chairOccupancy})
}

// GetAttendanceStats busca estatísticas de comparecimento
// @Summary Estatísticas de comparecimento
// @Description Retorna estatísticas de comparecimento e cancelamento (apenas atendentes e admins)
// @Tags dashboard
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{} "Estatísticas de comparecimento"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Acesso negado"
// @Router /dashboard/stats/attendance [get]
func (h *DashboardHandler) GetAttendanceStats(c *gin.Context) {
	stats, err := h.bookingUseCase.GetBookingStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar estatísticas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": stats})
}

// GetOperationalDashboard retorna dados do dashboard operacional unificado
// @Summary Dashboard operacional unificado
// @Description Retorna dados do dashboard operacional para administradores e atendentes
// @Tags dashboard
// @Accept json
// @Produce json
// @Security Bearer
// @Param date query string false "Data para filtrar agendamentos (formato: YYYY-MM-DD)" default(hoje)
// @Success 200 {object} map[string]interface{} "Dados do dashboard operacional"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Acesso negado - apenas atendentes e admins"
// @Router /dashboard/operational [get]
func (h *DashboardHandler) GetOperationalDashboard(c *gin.Context) {
	// Verificar se é atendente ou admin
	userClaims, _ := middleware.GetUserFromContext(c)
	if userClaims.Role != "atendente" && userClaims.Role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado"})
		return
	}

	// Parâmetro de data (opcional, padrão hoje)
	dateParam := c.DefaultQuery("date", time.Now().Format("2006-01-02"))
	date, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de data inválido. Use YYYY-MM-DD"})
		return
	}

	// Buscar agendamentos do dia
	bookings, err := h.bookingUseCase.GetBookingsByDate(date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar agendamentos"})
		return
	}

	// Buscar usuários pendentes de aprovação baseado no role
	var pendingUsers []*entities.User
	if userClaims.Role == "admin" {
		// Admin pode ver todas as pendências
		pendingUsers, err = h.userUseCase.GetPendingUsers()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuários pendentes"})
			return
		}
	} else if userClaims.Role == "atendente" {
		// Atendente só pode ver pendências de usuários/clientes
		pendingUsers, err = h.userUseCase.GetPendingUsersByRole("usuario")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuários pendentes"})
			return
		}
	}

	// Buscar cadeiras ativas
	chairs, _, err := h.chairUseCase.GetActiveChairs(100, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cadeiras"})
		return
	}

	// Calcular ocupação por cadeira
	chairOccupancy := h.calculateChairOccupancy(bookings, chairs)

	// Calcular indicadores do dia (usado para estatísticas)
	_ = h.calculateDayIndicators(bookings)

	// Buscar estatísticas gerais (usado para cálculos)
	_, err = h.bookingUseCase.GetBookingStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar estatísticas"})
		return
	}

	// Calcular estatísticas de comparecimento e cancelamento
	completedSessions := 0
	cancelledSessions := 0
	confirmedSessions := 0
	totalSessions := len(bookings)

	for _, booking := range bookings {
		switch booking.Status {
		case "concluido":
			completedSessions++
		case "cancelado":
			cancelledSessions++
		case "confirmado":
			confirmedSessions++
		}
	}

	// Preparar dados das sessões de hoje
	todaySessions := make([]gin.H, 0)
	// Usar timezone fixo para Brasília (GMT-3)
	loc := time.FixedZone("BRT", -3*60*60)
	for _, booking := range bookings {
		startTimeLocal := booking.StartTime.In(loc)
		endTimeLocal := booking.EndTime.In(loc)

		session := gin.H{
			"id": booking.ID,
			"user": gin.H{
				"name": booking.User.Name,
				"cpf":  booking.User.CPF,
			},
			"chair": gin.H{
				"name":     booking.Chair.Name,
				"location": booking.Chair.Location,
			},
			"start_time": startTimeLocal.Format("15:04"),
			"end_time":   endTimeLocal.Format("15:04"),
			"status":     booking.Status,
		}
		todaySessions = append(todaySessions, session)
	}

	// Preparar dados dos usuários pendentes
	pendingUsersData := make([]gin.H, 0)
	for _, user := range pendingUsers {
		userData := gin.H{
			"id":             user.ID,
			"name":           user.Name,
			"email":          user.Email,
			"requested_role": user.Role,
			"created_at":     user.CreatedAt.Format("2006-01-02T15:04:05Z"),
		}
		pendingUsersData = append(pendingUsersData, userData)
	}

	// Preparar dados de ocupação das cadeiras
	chairOccupancyData := make([]gin.H, 0)
	for _, chair := range chairOccupancy {
		// Calcular estatísticas da cadeira
		completedSessions := 0
		cancelledSessions := 0
		noShowSessions := 0

		for _, booking := range bookings {
			if booking.ChairID == chair["chair_id"] {
				switch booking.Status {
				case "concluido":
					completedSessions++
				case "cancelado":
					cancelledSessions++
				case "falta":
					noShowSessions++
				}
			}
		}

		occupancyData := gin.H{
			"chair_id":           chair["chair_id"],
			"chair_name":         chair["chair_name"],
			"total_sessions":     len(bookings),
			"completed_sessions": completedSessions,
			"cancelled_sessions": cancelledSessions,
			"no_show_sessions":   noShowSessions,
			"occupancy_rate":     chair["occupancy_rate"],
		}
		chairOccupancyData = append(chairOccupancyData, occupancyData)
	}

	// Calcular estatísticas gerais
	stats := gin.H{
		"totalSessionsToday":     totalSessions,
		"confirmedSessionsToday": confirmedSessions,
		"pendingApprovals":       len(pendingUsers),
		"totalChairs":            len(chairs),
		"activeChairs":           len(chairs),
		"attendanceRate":         0,
		"cancellationRate":       0,
	}

	// Calcular taxas (apenas se houver agendamentos)
	if totalSessions > 0 {
		attendanceRate := float64(completedSessions) / float64(totalSessions) * 100
		cancellationRate := float64(cancelledSessions) / float64(totalSessions) * 100
		stats["attendanceRate"] = int(attendanceRate)
		stats["cancellationRate"] = int(cancellationRate)
	}

	dashboard := gin.H{
		"stats":          stats,
		"todaySessions":  todaySessions,
		"pendingUsers":   pendingUsersData,
		"chairOccupancy": chairOccupancyData,
	}

	c.JSON(http.StatusOK, dashboard)
}

// calculateChairOccupancy calcula a ocupação de cada cadeira
func (h *DashboardHandler) calculateChairOccupancy(bookings []*entities.Booking, chairs []*entities.Chair) []gin.H {
	chairBookings := make(map[uint][]string)

	// Agrupar agendamentos por cadeira
	for _, booking := range bookings {
		if booking.ChairID != 0 {
			if chairBookings[booking.ChairID] == nil {
				chairBookings[booking.ChairID] = []string{}
			}
			chairBookings[booking.ChairID] = append(chairBookings[booking.ChairID], booking.Status)
		}
	}

	var occupancy []gin.H
	for _, chair := range chairs {
		chairID := chair.ID
		bookingStatuses := chairBookings[chairID]

		totalSlots := 8 // Assumindo 8 slots por dia
		occupiedSlots := len(bookingStatuses)
		occupancyRate := float64(occupiedSlots) / float64(totalSlots) * 100

		occupancy = append(occupancy, gin.H{
			"chair_id":       chairID,
			"chair_name":     chair.Name,
			"total_slots":    totalSlots,
			"occupied_slots": occupiedSlots,
			"occupancy_rate": occupancyRate,
			"status":         chair.Status,
		})
	}

	return occupancy
}

// calculateDayIndicators calcula indicadores do dia
func (h *DashboardHandler) calculateDayIndicators(bookings []*entities.Booking) gin.H {
	totalBookings := len(bookings)
	confirmedBookings := 0
	cancelledBookings := 0
	completedBookings := 0

	for _, booking := range bookings {
		switch booking.Status {
		case "confirmado":
			confirmedBookings++
		case "cancelado":
			cancelledBookings++
		case "concluido":
			completedBookings++
		}
	}

	return gin.H{
		"total_bookings":     totalBookings,
		"confirmed_bookings": confirmedBookings,
		"cancelled_bookings": cancelledBookings,
		"completed_bookings": completedBookings,
	}
}

// calculateGeneralIndicators calcula indicadores gerais
func (h *DashboardHandler) calculateGeneralIndicators() gin.H {
	// Implementar lógica para indicadores gerais
	return gin.H{
		"total_users":     0,
		"active_chairs":   0,
		"monthly_revenue": 0,
	}
}

// calculateChairStats calcula estatísticas das cadeiras
func (h *DashboardHandler) calculateChairStats(chairs []*entities.Chair) gin.H {
	totalChairs := len(chairs)
	activeChairs := 0
	inactiveChairs := 0
	maintenanceChairs := 0

	for _, chair := range chairs {
		switch chair.Status {
		case "ativa":
			activeChairs++
		case "inativa":
			inactiveChairs++
		case "manutencao":
			maintenanceChairs++
		}
	}

	return gin.H{
		"total_chairs":       totalChairs,
		"active_chairs":      activeChairs,
		"inactive_chairs":    inactiveChairs,
		"maintenance_chairs": maintenanceChairs,
	}
}

// @Summary Enviar lembretes de teste
// @Description Envia lembretes para todos os agendamentos do próximo dia (para testes)
// @Tags Dashboard
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]interface{} "Lembretes enviados com sucesso"
// @Failure 401 {object} map[string]interface{} "Não autorizado"
// @Failure 500 {object} map[string]interface{} "Erro interno do servidor"
// @Router /dashboard/test-reminders [post]
func (h *DashboardHandler) SendTestReminders(c *gin.Context) {
	// Verificar se é admin
	userInterface, exists := c.Get("user")
	if !exists {
		c.JSON(401, gin.H{"error": "Usuário não autenticado"})
		return
	}

	user := userInterface.(*entities.User)
	if user.Role != "admin" {
		c.JSON(403, gin.H{"error": "Acesso negado. Apenas administradores podem enviar lembretes de teste"})
		return
	}

	// Enviar lembretes
	if err := h.notificationUseCase.SendDailyReminders(); err != nil {
		c.JSON(500, gin.H{"error": fmt.Sprintf("Erro ao enviar lembretes: %v", err)})
		return
	}

	c.JSON(200, gin.H{
		"message":   "Lembretes enviados com sucesso",
		"timestamp": time.Now().Format("2006-01-02 15:04:05"),
	})
}
