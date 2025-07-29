package usecases

import (
	"errors"
	"fmt"
	"time"

	"agendamento-backend/internal/application/dtos"
	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/ports"
	"agendamento-backend/internal/domain/repositories"
)

type BookingUseCase struct {
	bookingRepo      repositories.BookingRepository
	chairRepo        repositories.ChairRepository
	userRepo         repositories.UserRepository
	availabilityRepo repositories.AvailabilityRepository
	auditRepo        repositories.AuditLogRepository
	emailRepo        repositories.EmailRepository
	validator        ports.Validator
}

func NewBookingUseCase(
	bookingRepo repositories.BookingRepository,
	chairRepo repositories.ChairRepository,
	userRepo repositories.UserRepository,
	availabilityRepo repositories.AvailabilityRepository,
	auditRepo repositories.AuditLogRepository,
	emailRepo repositories.EmailRepository,
	validator ports.Validator,
) *BookingUseCase {
	return &BookingUseCase{
		bookingRepo:      bookingRepo,
		chairRepo:        chairRepo,
		userRepo:         userRepo,
		availabilityRepo: availabilityRepo,
		auditRepo:        auditRepo,
		emailRepo:        emailRepo,
		validator:        validator,
	}
}

// CreateBooking cria um novo agendamento
func (uc *BookingUseCase) CreateBooking(booking *entities.Booking, createdBy uint) error {
	// Verificar se usuário existe e está aprovado
	user, err := uc.userRepo.GetByID(booking.UserID)
	if err != nil {
		return fmt.Errorf("usuário não encontrado: %w", err)
	}

	if user.Status != "aprovado" {
		return fmt.Errorf("usuário não está aprovado")
	}

	// Verificar se cadeira existe e está ativa
	chair, err := uc.chairRepo.GetByID(booking.ChairID)
	if err != nil {
		return fmt.Errorf("cadeira não encontrada: %w", err)
	}

	if chair.Status != "ativa" {
		return fmt.Errorf("cadeira não está disponível")
	}

	// Verificar disponibilidade
	if err := uc.checkAvailability(booking); err != nil {
		return err
	}

	// Criar agendamento
	if err := uc.bookingRepo.Create(booking); err != nil {
		return fmt.Errorf("erro ao criar agendamento: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&createdBy, entities.ActionCreate, entities.ResourceBooking, &booking.ID)
	auditLog.SetDescription(fmt.Sprintf("Agendamento criado para %s na cadeira %s", user.Name, chair.Name))
	uc.auditRepo.Create(auditLog)

	// Enviar email de confirmação
	if err := uc.emailRepo.SendBookingConfirmation(user, booking); err != nil {
		// Não falhar se o email falhar
	}

	return nil
}

// checkAvailability verifica se o agendamento é possível
func (uc *BookingUseCase) checkAvailability(booking *entities.Booking) error {
	// Garantir que a sessão seja de 30 minutos
	booking.EndTime = booking.StartTime.Add(30 * time.Minute)

	// Verificar se o horário está no futuro
	if booking.StartTime.Before(time.Now()) {
		return errors.New("não é possível agendar para horários passados")
	}

	// Verificar se há conflito de horário
	canBook, reason, err := uc.bookingRepo.CanBook(booking.UserID, booking.ChairID, booking.StartTime)
	if err != nil {
		return fmt.Errorf("erro ao verificar disponibilidade: %w", err)
	}
	if !canBook {
		return errors.New(reason)
	}

	// Verificar se a cadeira tem disponibilidade configurada para este horário
	isAvailable, err := uc.availabilityRepo.IsChairAvailableAtTime(booking.ChairID, booking.StartTime)
	if err != nil {
		return fmt.Errorf("erro ao verificar disponibilidade da cadeira: %w", err)
	}
	if !isAvailable {
		return errors.New("cadeira não tem disponibilidade configurada para este horário")
	}

	return nil
}

// GetBookingByID busca agendamento por ID
func (uc *BookingUseCase) GetBookingByID(id uint) (*entities.Booking, error) {
	return uc.bookingRepo.GetByID(id)
}

// UpdateBooking atualiza um agendamento
func (uc *BookingUseCase) UpdateBooking(booking *entities.Booking, updatedBy uint) error {
	// Validar dados
	if err := uc.validator.ValidateStruct(booking); err != nil {
		return fmt.Errorf("dados inválidos: %w", err)
	}

	// Buscar agendamento atual
	currentBooking, err := uc.bookingRepo.GetByID(booking.ID)
	if err != nil {
		return fmt.Errorf("agendamento não encontrado: %w", err)
	}

	// Verificar se pode ser alterado
	if !currentBooking.IsActive() {
		return errors.New("agendamento não pode ser alterado")
	}

	// Se horário foi alterado, verificar disponibilidade
	if !booking.StartTime.Equal(currentBooking.StartTime) || booking.ChairID != currentBooking.ChairID {
		// Garantir que a sessão seja de 30 minutos
		booking.EndTime = booking.StartTime.Add(30 * time.Minute)

		// Verificar se o horário está no futuro
		if booking.StartTime.Before(time.Now()) {
			return errors.New("não é possível agendar para horários passados")
		}

		// Verificar conflitos (excluindo o próprio agendamento)
		hasConflict, err := uc.bookingRepo.HasConflict(booking.ChairID, booking.StartTime, booking.EndTime, &booking.ID)
		if err != nil {
			return fmt.Errorf("erro ao verificar conflitos: %w", err)
		}
		if hasConflict {
			return errors.New("já existe um agendamento para este horário")
		}

		// Verificar disponibilidade da cadeira
		isAvailable, err := uc.availabilityRepo.IsChairAvailableAtTime(booking.ChairID, booking.StartTime)
		if err != nil {
			return fmt.Errorf("erro ao verificar disponibilidade da cadeira: %w", err)
		}
		if !isAvailable {
			return errors.New("cadeira não tem disponibilidade configurada para este horário")
		}
	}

	// Atualizar agendamento
	if err := uc.bookingRepo.Update(booking); err != nil {
		return fmt.Errorf("erro ao atualizar agendamento: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&updatedBy, entities.ActionUpdate, entities.ResourceBooking, &booking.ID)
	auditLog.SetDescription("Agendamento atualizado")
	uc.auditRepo.Create(auditLog)

	return nil
}

// CancelBooking cancela um agendamento
func (uc *BookingUseCase) CancelBooking(bookingID, cancelledBy uint, reason string) error {
	booking, err := uc.bookingRepo.GetByID(bookingID)
	if err != nil {
		return fmt.Errorf("agendamento não encontrado: %w", err)
	}

	if !booking.CanBeCancelled() {
		return errors.New("agendamento não pode ser cancelado (muito próximo do horário ou já realizado)")
	}

	if err := uc.bookingRepo.Cancel(bookingID, cancelledBy, reason); err != nil {
		return fmt.Errorf("erro ao cancelar agendamento: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&cancelledBy, entities.ActionCancel, entities.ResourceBooking, &bookingID)
	auditLog.SetDescription(fmt.Sprintf("Agendamento cancelado: %s", reason))
	uc.auditRepo.Create(auditLog)

	// Enviar email de cancelamento (não bloquear se falhar)
	go func() {
		// Buscar dados completos para o email
		user, err := uc.userRepo.GetByID(booking.UserID)
		if err != nil {
			return
		}

		chair, err := uc.chairRepo.GetByID(booking.ChairID)
		if err != nil {
			return
		}

		booking.User = *user
		booking.Chair = *chair

		if err := uc.emailRepo.SendBookingCancellation(user, booking, reason); err != nil {
			// Log do erro mas não falha a operação
			fmt.Printf("Erro ao enviar email de cancelamento: %v\n", err)
		}
	}()

	return nil
}

// CompleteBooking marca um agendamento como realizado
func (uc *BookingUseCase) CompleteBooking(bookingID, completedBy uint) error {
	booking, err := uc.bookingRepo.GetByID(bookingID)
	if err != nil {
		return fmt.Errorf("agendamento não encontrado: %w", err)
	}

	if !booking.IsActive() {
		return errors.New("agendamento não está ativo")
	}

	if err := uc.bookingRepo.Complete(bookingID, completedBy); err != nil {
		return fmt.Errorf("erro ao marcar agendamento como realizado: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&completedBy, entities.ActionUpdate, entities.ResourceBooking, &bookingID)
	auditLog.SetDescription("Agendamento marcado como realizado")
	uc.auditRepo.Create(auditLog)

	return nil
}

// MarkAsNoShow marca um agendamento como falta
func (uc *BookingUseCase) MarkAsNoShow(bookingID, markedBy uint) error {
	booking, err := uc.bookingRepo.GetByID(bookingID)
	if err != nil {
		return fmt.Errorf("agendamento não encontrado: %w", err)
	}

	if !booking.IsPast() {
		return errors.New("só é possível marcar como falta agendamentos que já passaram")
	}

	if err := uc.bookingRepo.MarkAsNoShow(bookingID, markedBy); err != nil {
		return fmt.Errorf("erro ao marcar como falta: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&markedBy, entities.ActionUpdate, entities.ResourceBooking, &bookingID)
	auditLog.SetDescription("Agendamento marcado como falta")
	uc.auditRepo.Create(auditLog)

	return nil
}

// ListBookings lista agendamentos com paginação
func (uc *BookingUseCase) ListBookings(limit, offset int, filters map[string]interface{}) ([]*entities.Booking, int64, error) {
	return uc.bookingRepo.List(limit, offset, filters)
}

// GetUserBookings busca agendamentos de um usuário
func (uc *BookingUseCase) GetUserBookings(userID uint, limit, offset int) ([]*entities.Booking, int64, error) {
	return uc.bookingRepo.GetByUser(userID, limit, offset)
}

// GetTodayBookings busca agendamentos de hoje
func (uc *BookingUseCase) GetTodayBookings() ([]*entities.Booking, error) {
	return uc.bookingRepo.GetTodayBookings()
}

// GetUpcomingBookings busca próximos agendamentos de um usuário
func (uc *BookingUseCase) GetUpcomingBookings(userID uint, limit int) ([]*entities.Booking, error) {
	return uc.bookingRepo.GetUpcomingBookings(userID, limit)
}

// GetBookingStats retorna estatísticas dos agendamentos
func (uc *BookingUseCase) GetBookingStats() (map[string]int64, error) {
	stats := make(map[string]int64)

	// Total de agendamentos
	total, err := uc.bookingRepo.CountTotal()
	if err != nil {
		return nil, fmt.Errorf("erro ao contar total de agendamentos: %w", err)
	}
	stats["total"] = total

	// Agendamentos por status
	statuses := []string{"agendado", "confirmado", "realizado", "cancelado", "falta"}
	for _, status := range statuses {
		count, err := uc.bookingRepo.CountByStatus(status)
		if err != nil {
			return nil, fmt.Errorf("erro ao contar agendamentos por status %s: %w", status, err)
		}
		stats[status] = count
	}

	// Agendamentos de hoje
	todayBookings, err := uc.bookingRepo.GetByDate(time.Now())
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar agendamentos de hoje: %w", err)
	}
	stats["hoje"] = int64(len(todayBookings))

	// Agendamentos desta semana
	now := time.Now()
	startOfWeek := now.AddDate(0, 0, -int(now.Weekday()))
	endOfWeek := startOfWeek.AddDate(0, 0, 6)
	weekBookings, err := uc.bookingRepo.GetBookingsByPeriod(startOfWeek, endOfWeek)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar agendamentos da semana: %w", err)
	}
	stats["semana"] = int64(len(weekBookings))

	// Agendamentos deste mês
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, -1)
	monthBookings, err := uc.bookingRepo.GetBookingsByPeriod(startOfMonth, endOfMonth)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar agendamentos do mês: %w", err)
	}
	stats["mes"] = int64(len(monthBookings))

	return stats, nil
}

// GetBookingsByChair busca agendamentos de uma cadeira específica
func (uc *BookingUseCase) GetBookingsByChair(chairID uint, limit, offset int) ([]*entities.Booking, int64, error) {
	return uc.bookingRepo.GetByChair(chairID, limit, offset)
}

// GetBookingsByDate busca agendamentos de uma data específica
func (uc *BookingUseCase) GetBookingsByDate(date time.Time) ([]*entities.Booking, error) {
	return uc.bookingRepo.GetByDate(date)
}

// GetBookingsByDateIncludingPast busca agendamentos de uma data específica incluindo passados
func (uc *BookingUseCase) GetBookingsByDateIncludingPast(date time.Time) ([]*entities.Booking, error) {
	return uc.bookingRepo.GetByDateIncludingPast(date)
}

// GetChairBookingsByDate busca agendamentos de uma cadeira em uma data específica
func (uc *BookingUseCase) GetChairBookingsByDate(chairID uint, date time.Time) ([]*entities.Booking, error) {
	return uc.bookingRepo.GetByChairAndDate(chairID, date)
}

// RescheduleBooking reagenda um agendamento
func (uc *BookingUseCase) RescheduleBooking(bookingID uint, newStartTime time.Time, newChairID uint, updatedBy uint) error {
	// Buscar agendamento atual
	booking, err := uc.bookingRepo.GetByID(bookingID)
	if err != nil {
		return fmt.Errorf("agendamento não encontrado: %w", err)
	}

	// Verificar se pode ser reagendado (não pode estar concluído ou cancelado)
	if booking.Status == "concluido" || booking.Status == "cancelado" {
		return errors.New("não é possível reagendar um agendamento concluído ou cancelado")
	}

	// Se não especificou nova cadeira, manter a atual
	if newChairID == 0 {
		newChairID = booking.ChairID
	}

	// Verificar se a nova cadeira existe e está ativa
	chair, err := uc.chairRepo.GetByID(newChairID)
	if err != nil {
		return fmt.Errorf("cadeira não encontrada: %w", err)
	}
	if chair.Status != "ativa" {
		return errors.New("cadeira não está disponível")
	}

	// Calcular novo horário de fim (30 minutos após o início)
	newEndTime := newStartTime.Add(30 * time.Minute)

	// Verificar se o novo horário está no futuro
	if newStartTime.Before(time.Now()) {
		return errors.New("não é possível reagendar para um horário no passado")
	}

	// Verificar disponibilidade no novo horário
	canBook, message, err := uc.bookingRepo.CanBook(booking.UserID, newChairID, newStartTime)
	if err != nil {
		return fmt.Errorf("erro ao verificar disponibilidade: %w", err)
	}
	if !canBook {
		return fmt.Errorf("não é possível reagendar: %s", message)
	}

	// Verificar se a cadeira está disponível no novo horário
	isAvailable, err := uc.availabilityRepo.IsChairAvailableAtTime(newChairID, newStartTime)
	if err != nil {
		return fmt.Errorf("erro ao verificar disponibilidade da cadeira: %w", err)
	}
	if !isAvailable {
		return errors.New("cadeira não está disponível no horário solicitado")
	}

	// Atualizar agendamento
	booking.ChairID = newChairID
	booking.StartTime = newStartTime
	booking.EndTime = newEndTime

	err = uc.bookingRepo.Update(booking)
	if err != nil {
		return fmt.Errorf("erro ao atualizar agendamento: %w", err)
	}

	// Registrar auditoria
	auditLog := entities.NewAuditLog(&updatedBy, entities.ActionUpdate, entities.ResourceBooking, &bookingID)
	auditLog.SetDescription(fmt.Sprintf("Reagendado para %s na cadeira %d", newStartTime.Format("2006-01-02 15:04"), newChairID))
	uc.auditRepo.Create(auditLog)

	return nil
}

// GetRescheduleOptions busca opções disponíveis para reagendamento
func (uc *BookingUseCase) GetRescheduleOptions(bookingID uint, date time.Time) (*dtos.RescheduleOptionsResponse, error) {
	// Buscar agendamento atual
	booking, err := uc.bookingRepo.GetByID(bookingID)
	if err != nil {
		return nil, fmt.Errorf("agendamento não encontrado: %w", err)
	}

	// Verificar se pode ser reagendado (não pode estar concluído ou cancelado)
	if booking.Status == "concluido" || booking.Status == "cancelado" {
		return nil, errors.New("não é possível reagendar um agendamento concluído ou cancelado")
	}

	// Verificar se a data está no futuro
	if date.Before(time.Now().Truncate(24 * time.Hour)) {
		return nil, errors.New("não é possível reagendar para uma data no passado")
	}

	// Buscar cadeira
	chair, err := uc.chairRepo.GetByID(booking.ChairID)
	if err != nil {
		return nil, fmt.Errorf("cadeira não encontrada: %w", err)
	}

	// Buscar disponibilidades da cadeira para a data
	availabilities, err := uc.availabilityRepo.GetChairAvailabilityForDate(booking.ChairID, date)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar disponibilidades: %w", err)
	}

	// Buscar agendamentos existentes para a cadeira na data
	bookings, err := uc.bookingRepo.GetByChairAndDate(booking.ChairID, date)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar agendamentos: %w", err)
	}

	// Criar mapa de horários já agendados (apenas agendamentos não cancelados)
	bookedSlots := make(map[string]bool)
	for _, existingBooking := range bookings {
		if existingBooking.Status != "cancelado" && existingBooking.Status != "falta" && existingBooking.ID != bookingID {
			slotTime := existingBooking.StartTime.Format("15:04")
			bookedSlots[slotTime] = true
		}
	}

	// Gerar todos os slots disponíveis e remover os já agendados
	var availableSlots []string
	for _, availability := range availabilities {
		if availability.IsValidForDate(date) {
			slots, err := availability.GetTimeSlots()
			if err != nil {
				continue
			}

			// Filtrar apenas slots não agendados
			for _, slot := range slots {
				if !bookedSlots[slot] {
					availableSlots = append(availableSlots, slot)
				}
			}
		}
	}

	// Converter booking para DTO
	bookingResponse := dtos.BookingResponse{
		ID:        booking.ID,
		UserID:    booking.UserID,
		ChairID:   booking.ChairID,
		StartTime: booking.StartTime,
		EndTime:   booking.EndTime,
		Status:    booking.Status,
		Notes:     booking.Notes,
		CreatedAt: booking.CreatedAt,
		UpdatedAt: booking.UpdatedAt,
	}

	response := &dtos.RescheduleOptionsResponse{
		BookingID:      bookingID,
		CurrentBooking: bookingResponse,
		AvailableSlots: availableSlots,
		Date:           date.Format("2006-01-02"),
		ChairID:        booking.ChairID,
		ChairName:      chair.Name,
	}

	return response, nil
}

// RescheduleBookingDateTime reagenda apenas data e horário de um agendamento
func (uc *BookingUseCase) RescheduleBookingDateTime(bookingID uint, newStartTime time.Time, updatedBy uint) error {
	// Buscar agendamento atual
	booking, err := uc.bookingRepo.GetByID(bookingID)
	if err != nil {
		return fmt.Errorf("agendamento não encontrado: %w", err)
	}

	// Verificar se pode ser reagendado (não pode estar concluído ou cancelado)
	if booking.Status == "concluido" || booking.Status == "cancelado" {
		return errors.New("não é possível reagendar um agendamento concluído ou cancelado")
	}

	// Verificar se o novo horário está no futuro
	if newStartTime.Before(time.Now()) {
		return errors.New("não é possível reagendar para um horário no passado")
	}

	// Calcular novo horário de fim (30 minutos após o início)
	newEndTime := newStartTime.Add(30 * time.Minute)

	// Verificar disponibilidade no novo horário (excluindo o próprio agendamento)
	hasConflict, err := uc.bookingRepo.HasConflict(booking.ChairID, newStartTime, newEndTime, &bookingID)
	if err != nil {
		return fmt.Errorf("erro ao verificar disponibilidade: %w", err)
	}
	if hasConflict {
		return errors.New("já existe um agendamento neste horário")
	}

	// Verificar se a cadeira está disponível no novo horário
	isAvailable, err := uc.availabilityRepo.IsChairAvailableAtTime(booking.ChairID, newStartTime)
	if err != nil {
		return fmt.Errorf("erro ao verificar disponibilidade da cadeira: %w", err)
	}
	if !isAvailable {
		return errors.New("cadeira não está disponível no horário solicitado")
	}

	// Atualizar apenas data e horário
	booking.StartTime = newStartTime
	booking.EndTime = newEndTime

	err = uc.bookingRepo.Update(booking)
	if err != nil {
		return fmt.Errorf("erro ao atualizar agendamento: %w", err)
	}

	// Registrar auditoria
	auditLog := entities.NewAuditLog(&updatedBy, entities.ActionUpdate, entities.ResourceBooking, &bookingID)
	auditLog.SetDescription(fmt.Sprintf("Reagendado para %s", newStartTime.Format("2006-01-02 15:04")))
	uc.auditRepo.Create(auditLog)

	return nil
}

// GetSystemStats retorna estatísticas gerais do sistema
func (uc *BookingUseCase) GetSystemStats() (map[string]interface{}, error) {
	now := time.Now()

	// Total de usuários
	totalUsers, err := uc.userRepo.CountTotal()
	if err != nil {
		return nil, fmt.Errorf("erro ao contar usuários: %w", err)
	}

	// Total de cadeiras
	totalChairs, err := uc.chairRepo.CountTotal()
	if err != nil {
		return nil, fmt.Errorf("erro ao contar cadeiras: %w", err)
	}

	// Total de agendamentos
	totalBookings, err := uc.bookingRepo.CountTotal()
	if err != nil {
		return nil, fmt.Errorf("erro ao contar agendamentos: %w", err)
	}

	// Agendamentos deste mês
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, -1)
	monthlyBookings, err := uc.bookingRepo.GetBookingsByPeriod(startOfMonth, endOfMonth)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar agendamentos do mês: %w", err)
	}

	// Taxa de comparecimento (últimos 30 dias)
	thirtyDaysAgo := now.AddDate(0, 0, -30)
	recentBookings, err := uc.bookingRepo.GetBookingsByPeriod(thirtyDaysAgo, now)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar agendamentos recentes: %w", err)
	}

	attendedCount := int64(0)
	cancelledCount := int64(0)
	for _, booking := range recentBookings {
		if booking.Status == "concluido" {
			attendedCount++
		} else if booking.Status == "cancelado" {
			cancelledCount++
		}
	}

	attendanceRate := 0.0
	if int64(len(recentBookings)) > 0 {
		attendanceRate = float64(attendedCount) / float64(len(recentBookings)) * 100
	}

	// Taxa de ocupação (hoje)
	todayBookings, err := uc.bookingRepo.GetByDate(now)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar agendamentos de hoje: %w", err)
	}

	// Calcular slots disponíveis hoje (assumindo 8 horas de funcionamento)
	activeChairs, _, err := uc.chairRepo.GetActive(1000, 0)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar cadeiras ativas: %w", err)
	}

	totalSlots := int64(len(activeChairs) * 16) // 16 slots de 30min em 8 horas
	occupiedSlots := int64(len(todayBookings))
	occupancyRate := 0.0
	if totalSlots > 0 {
		occupancyRate = float64(occupiedSlots) / float64(totalSlots) * 100
	}

	return map[string]interface{}{
		"total_users":      totalUsers,
		"total_chairs":     totalChairs,
		"total_bookings":   totalBookings,
		"monthly_bookings": int64(len(monthlyBookings)),
		"attendance_rate":  attendanceRate,
		"occupancy_rate":   occupancyRate,
		"cancellations":    cancelledCount,
	}, nil
}

// GetAttendantStats retorna estatísticas para atendentes
func (uc *BookingUseCase) GetAttendantStats() (map[string]interface{}, error) {
	now := time.Now()

	// Agendamentos de hoje
	todayBookings, err := uc.bookingRepo.GetByDate(now)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar agendamentos de hoje: %w", err)
	}

	// Agendamentos confirmados de hoje
	confirmedSessions := int64(0)
	pendingSessions := int64(0)
	for _, booking := range todayBookings {
		if booking.Status == "confirmado" {
			confirmedSessions++
		} else if booking.Status == "agendado" {
			pendingSessions++
		}
	}

	// Estatísticas dos últimos 30 dias
	thirtyDaysAgo := now.AddDate(0, 0, -30)
	recentBookings, err := uc.bookingRepo.GetBookingsByPeriod(thirtyDaysAgo, now)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar agendamentos recentes: %w", err)
	}

	totalSessions := int64(len(recentBookings))
	attendedSessions := int64(0)
	noShows := int64(0)

	for _, booking := range recentBookings {
		if booking.Status == "concluido" {
			attendedSessions++
		} else if booking.Status == "falta" {
			noShows++
		}
	}

	attendanceRate := 0.0
	if totalSessions > 0 {
		attendanceRate = float64(attendedSessions) / float64(totalSessions) * 100
	}

	// Duração média das sessões (fixa em 30 minutos)
	avgSessionDuration := 30.0

	return map[string]interface{}{
		"total_sessions":       totalSessions,
		"attendance_rate":      attendanceRate,
		"no_shows":             noShows,
		"avg_session_duration": avgSessionDuration,
		"today_sessions":       int64(len(todayBookings)),
		"confirmed_sessions":   confirmedSessions,
		"pending_sessions":     pendingSessions,
	}, nil
}

// GetUserStats retorna estatísticas de um usuário específico
func (uc *BookingUseCase) GetUserStats(userID uint) (map[string]interface{}, error) {
	// Buscar todos os agendamentos do usuário
	userBookings, _, err := uc.bookingRepo.GetByUser(userID, 1000, 0)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar agendamentos do usuário: %w", err)
	}

	total := int64(len(userBookings))
	completed := int64(0)
	cancelled := int64(0)
	pending := int64(0)
	upcoming := int64(0)

	now := time.Now()
	for _, booking := range userBookings {
		switch booking.Status {
		case "concluido":
			completed++
		case "cancelado":
			cancelled++
		case "agendado":
			if booking.StartTime.After(now) {
				upcoming++
			} else {
				pending++
			}
		}
	}

	// Taxa de comparecimento
	attendanceRate := 0.0
	if total > 0 {
		attendanceRate = float64(completed) / float64(total) * 100
	}

	return map[string]interface{}{
		"total":           total,
		"completed":       completed,
		"cancelled":       cancelled,
		"pending":         pending,
		"upcoming":        upcoming,
		"attendance_rate": attendanceRate,
	}, nil
}
