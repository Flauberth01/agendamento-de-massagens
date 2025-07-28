package repositories

import (
	"time"

	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/repositories"

	"gorm.io/gorm"
)

type bookingRepositoryImpl struct {
	db *gorm.DB
}

func NewBookingRepository(db *gorm.DB) repositories.BookingRepository {
	return &bookingRepositoryImpl{
		db: db,
	}
}

// Create cria um novo agendamento
func (r *bookingRepositoryImpl) Create(booking *entities.Booking) error {
	return r.db.Create(booking).Error
}

// GetByID busca agendamento por ID
func (r *bookingRepositoryImpl) GetByID(id uint) (*entities.Booking, error) {
	var booking entities.Booking
	err := r.db.Preload("User").Preload("Chair").First(&booking, id).Error
	if err != nil {
		return nil, err
	}
	return &booking, nil
}

// Update atualiza um agendamento
func (r *bookingRepositoryImpl) Update(booking *entities.Booking) error {
	return r.db.Save(booking).Error
}

// Delete exclui um agendamento (soft delete)
func (r *bookingRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&entities.Booking{}, id).Error
}

// List lista agendamentos com paginação e filtros
func (r *bookingRepositoryImpl) List(limit, offset int, filters map[string]interface{}) ([]*entities.Booking, int64, error) {
	var bookings []*entities.Booking
	var total int64

	query := r.db.Model(&entities.Booking{}).Preload("User").Preload("Chair")

	// Aplicar filtros
	for key, value := range filters {
		switch key {
		case "user_id":
			query = query.Where("user_id = ?", value)
		case "chair_id":
			query = query.Where("chair_id = ?", value)
		case "status":
			query = query.Where("status = ?", value)
		case "date":
			if date, ok := value.(time.Time); ok {
				startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
				endOfDay := startOfDay.Add(24 * time.Hour)
				query = query.Where("start_time >= ? AND start_time < ?", startOfDay, endOfDay)
			}
		case "start_date":
			if date, ok := value.(time.Time); ok {
				query = query.Where("start_time >= ?", date)
			}
		case "end_date":
			if date, ok := value.(time.Time); ok {
				query = query.Where("start_time <= ?", date)
			}
		case "exclude_past":
			if exclude, ok := value.(bool); ok && exclude {
				now := time.Now()
				query = query.Where("start_time > ?", now)
			}
		}
	}

	// Por padrão, excluir agendamentos passados (a menos que explicitamente solicitado)
	if _, hasExcludePast := filters["exclude_past"]; !hasExcludePast {
		now := time.Now()
		query = query.Where("start_time > ?", now)
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("start_time DESC").Find(&bookings).Error
	return bookings, total, err
}

// GetByUser busca agendamentos de um usuário
func (r *bookingRepositoryImpl) GetByUser(userID uint, limit, offset int) ([]*entities.Booking, int64, error) {
	var total int64
	var bookings []*entities.Booking
	now := time.Now()

	// Contar total de agendamentos do usuário (excluindo passados)
	if err := r.db.Model(&entities.Booking{}).Where("user_id = ? AND deleted_at IS NULL AND start_time > ?", userID, now).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar agendamentos do usuário com preload das relações (excluindo passados)
	if err := r.db.Preload("User").Preload("Chair").Where("user_id = ? AND deleted_at IS NULL AND start_time > ?", userID, now).Order("start_time DESC").Limit(limit).Offset(offset).Find(&bookings).Error; err != nil {
		return nil, 0, err
	}

	return bookings, total, nil
}

// GetByChair busca agendamentos de uma cadeira
func (r *bookingRepositoryImpl) GetByChair(chairID uint, limit, offset int) ([]*entities.Booking, int64, error) {
	var bookings []*entities.Booking
	var total int64
	now := time.Now()

	query := r.db.Model(&entities.Booking{}).Preload("User").Where("chair_id = ? AND start_time > ?", chairID, now)

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("start_time DESC").Find(&bookings).Error
	return bookings, total, err
}

// GetByStatus busca agendamentos por status
func (r *bookingRepositoryImpl) GetByStatus(status string, limit, offset int) ([]*entities.Booking, int64, error) {
	var bookings []*entities.Booking
	var total int64
	now := time.Now()

	query := r.db.Model(&entities.Booking{}).Preload("User").Preload("Chair").Where("status = ? AND start_time > ?", status, now)

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("start_time DESC").Find(&bookings).Error
	return bookings, total, err
}

// GetByDateRange busca agendamentos por período
func (r *bookingRepositoryImpl) GetByDateRange(startDate, endDate time.Time, limit, offset int) ([]*entities.Booking, int64, error) {
	var bookings []*entities.Booking
	var total int64

	query := r.db.Model(&entities.Booking{}).Preload("User").Preload("Chair").
		Where("start_time >= ? AND start_time <= ?", startDate, endDate)

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("start_time ASC").Find(&bookings).Error
	return bookings, total, err
}

// GetByDate busca agendamentos de uma data específica
func (r *bookingRepositoryImpl) GetByDate(date time.Time) ([]*entities.Booking, error) {
	var bookings []*entities.Booking
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	err := r.db.Preload("User").Preload("Chair").
		Where("start_time >= ? AND start_time < ?", startOfDay, endOfDay).
		Order("start_time ASC").Find(&bookings).Error
	return bookings, err
}

// GetByDateIncludingPast busca agendamentos de uma data específica incluindo passados
func (r *bookingRepositoryImpl) GetByDateIncludingPast(date time.Time) ([]*entities.Booking, error) {
	var bookings []*entities.Booking
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	err := r.db.Preload("User").Preload("Chair").
		Where("start_time >= ? AND start_time < ?", startOfDay, endOfDay).
		Order("start_time ASC").Find(&bookings).Error
	return bookings, err
}

// GetByChairAndDate busca agendamentos de uma cadeira em uma data
func (r *bookingRepositoryImpl) GetByChairAndDate(chairID uint, date time.Time) ([]*entities.Booking, error) {
	var bookings []*entities.Booking
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)
	now := time.Now()

	err := r.db.Preload("User").
		Where("chair_id = ? AND start_time >= ? AND start_time < ? AND start_time > ?", chairID, startOfDay, endOfDay, now).
		Order("start_time ASC").Find(&bookings).Error
	return bookings, err
}

// GetByChairAndDateIncludingPast busca agendamentos de uma cadeira em uma data incluindo passados
func (r *bookingRepositoryImpl) GetByChairAndDateIncludingPast(chairID uint, date time.Time) ([]*entities.Booking, error) {
	var bookings []*entities.Booking
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	err := r.db.Preload("User").
		Where("chair_id = ? AND start_time >= ? AND start_time < ?", chairID, startOfDay, endOfDay).
		Order("start_time ASC").Find(&bookings).Error
	return bookings, err
}

// GetConflictingBookings busca agendamentos que conflitam com um horário
func (r *bookingRepositoryImpl) GetConflictingBookings(chairID uint, startTime, endTime time.Time) ([]*entities.Booking, error) {
	var bookings []*entities.Booking
	err := r.db.Where("chair_id = ? AND status IN (?, ?) AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))",
		chairID, "agendado", "confirmado", endTime, startTime, startTime, endTime).Find(&bookings).Error
	return bookings, err
}

// GetUpcomingBookings busca próximos agendamentos de um usuário
func (r *bookingRepositoryImpl) GetUpcomingBookings(userID uint, limit int) ([]*entities.Booking, error) {
	var bookings []*entities.Booking
	now := time.Now()
	err := r.db.Preload("Chair").
		Where("user_id = ? AND start_time > ? AND status IN (?, ?)", userID, now, "agendado", "confirmado").
		Order("start_time ASC").Limit(limit).Find(&bookings).Error
	return bookings, err
}

// GetTodayBookings busca agendamentos de hoje
func (r *bookingRepositoryImpl) GetTodayBookings() ([]*entities.Booking, error) {
	now := time.Now()
	return r.GetByDate(now)
}

// HasConflict verifica se há conflito de horário
func (r *bookingRepositoryImpl) HasConflict(chairID uint, startTime, endTime time.Time, excludeBookingID *uint) (bool, error) {
	query := r.db.Model(&entities.Booking{}).
		Where("chair_id = ? AND status IN (?, ?) AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))",
			chairID, "agendado", "confirmado", endTime, startTime, startTime, endTime)

	if excludeBookingID != nil {
		query = query.Where("id != ?", *excludeBookingID)
	}

	var count int64
	err := query.Count(&count).Error
	return count > 0, err
}

// CanBook verifica se é possível fazer um agendamento
func (r *bookingRepositoryImpl) CanBook(userID, chairID uint, startTime time.Time) (bool, string, error) {
	endTime := startTime.Add(30 * time.Minute)

	// Verificar se usuário tem sessão ativa no momento
	hasActive, err := r.HasActiveBooking(userID)
	if err != nil {
		return false, "Erro ao verificar sessão ativa", err
	}
	if hasActive {
		return false, "Usuário já possui uma sessão ativa. Apenas uma sessão por vez é permitida", nil
	}

	// Verificar conflito de horário para a cadeira
	hasConflict, err := r.HasConflict(chairID, startTime, endTime, nil)
	if err != nil {
		return false, "Erro ao verificar conflitos", err
	}
	if hasConflict {
		return false, "Já existe um agendamento para este horário nesta cadeira", nil
	}

	// Verificar se usuário já tem outro agendamento futuro (excluindo cancelados)
	now := time.Now()
	var futureCount int64
	err = r.db.Model(&entities.Booking{}).
		Where("user_id = ? AND status IN (?, ?) AND start_time > ?",
			userID, "agendado", "confirmado", now).
		Count(&futureCount).Error
	if err != nil {
		return false, "Erro ao verificar agendamentos futuros", err
	}

	if futureCount > 0 {
		return false, "Usuário já possui um agendamento futuro. Apenas um agendamento por vez é permitido", nil
	}
	return true, "", nil
}

// HasActiveBooking verifica se o usuário tem algum agendamento ativo
func (r *bookingRepositoryImpl) HasActiveBooking(userID uint) (bool, error) {
	now := time.Now()
	var count int64
	err := r.db.Model(&entities.Booking{}).
		Where("user_id = ? AND status IN (?, ?) AND start_time <= ? AND end_time > ?",
			userID, "agendado", "confirmado", now, now).
		Count(&count).Error
	return count > 0, err
}

// Cancel cancela um agendamento
func (r *bookingRepositoryImpl) Cancel(id uint, cancelledBy uint, reason string) error {
	return r.db.Model(&entities.Booking{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status": "cancelado",
		"notes":  reason,
	}).Error
}

// Confirm confirma um agendamento
func (r *bookingRepositoryImpl) Confirm(id uint, confirmedBy uint) error {
	return r.db.Model(&entities.Booking{}).Where("id = ?", id).Update("status", "confirmado").Error
}

// Complete marca um agendamento como concluído
func (r *bookingRepositoryImpl) Complete(id uint, completedBy uint) error {
	return r.db.Model(&entities.Booking{}).Where("id = ?", id).Update("status", "concluido").Error
}

// MarkAsNoShow marca um agendamento como falta
func (r *bookingRepositoryImpl) MarkAsNoShow(id uint, markedBy uint) error {
	return r.db.Model(&entities.Booking{}).Where("id = ?", id).Update("status", "falta").Error
}

// CountByStatus conta agendamentos por status
func (r *bookingRepositoryImpl) CountByStatus(status string) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Booking{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

// CountByUser conta agendamentos de um usuário
func (r *bookingRepositoryImpl) CountByUser(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Booking{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

// CountByChair conta agendamentos de uma cadeira
func (r *bookingRepositoryImpl) CountByChair(chairID uint) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Booking{}).Where("chair_id = ?", chairID).Count(&count).Error
	return count, err
}

// CountByDate conta agendamentos de uma data
func (r *bookingRepositoryImpl) CountByDate(date time.Time) (int64, error) {
	var count int64
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)
	err := r.db.Model(&entities.Booking{}).Where("start_time >= ? AND start_time < ?", startOfDay, endOfDay).Count(&count).Error
	return count, err
}

// CountTotal conta total de agendamentos
func (r *bookingRepositoryImpl) CountTotal() (int64, error) {
	var count int64
	err := r.db.Model(&entities.Booking{}).Count(&count).Error
	return count, err
}

// GetBookingsByPeriod busca agendamentos por período
func (r *bookingRepositoryImpl) GetBookingsByPeriod(startDate, endDate time.Time) ([]*entities.Booking, error) {
	var bookings []*entities.Booking
	now := time.Now()
	err := r.db.Preload("User").Preload("Chair").
		Where("start_time >= ? AND start_time <= ? AND start_time > ?", startDate, endDate, now).
		Order("start_time ASC").
		Find(&bookings).Error
	return bookings, err
}

// GetOccupancyRate calcula taxa de ocupação de uma cadeira
func (r *bookingRepositoryImpl) GetOccupancyRate(chairID uint, startDate, endDate time.Time) (float64, error) {
	// Contar agendamentos concluídos no período
	var completedCount int64
	err := r.db.Model(&entities.Booking{}).
		Where("chair_id = ? AND status = ? AND start_time >= ? AND start_time <= ?",
			chairID, "concluido", startDate, endDate).Count(&completedCount).Error
	if err != nil {
		return 0, err
	}

	// Contar total de agendamentos no período
	var totalCount int64
	err = r.db.Model(&entities.Booking{}).
		Where("chair_id = ? AND start_time >= ? AND start_time <= ?",
			chairID, startDate, endDate).Count(&totalCount).Error
	if err != nil {
		return 0, err
	}

	if totalCount == 0 {
		return 0, nil
	}

	return float64(completedCount) / float64(totalCount) * 100, nil
}

// GetUserBookingHistory busca histórico de agendamentos de um usuário
func (r *bookingRepositoryImpl) GetUserBookingHistory(userID uint, limit, offset int) ([]*entities.Booking, int64, error) {
	var bookings []*entities.Booking
	var total int64
	now := time.Now()

	query := r.db.Model(&entities.Booking{}).Preload("Chair").Where("user_id = ? AND start_time > ?", userID, now)

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("start_time DESC").Find(&bookings).Error
	return bookings, total, err
}

// CountByDateRange conta agendamentos em um período
func (r *bookingRepositoryImpl) CountByDateRange(startDate, endDate time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Booking{}).
		Where("start_time >= ? AND start_time <= ?", startDate, endDate).
		Count(&count).Error
	return count, err
}

// CountByChairAndDate conta agendamentos de uma cadeira em uma data específica
func (r *bookingRepositoryImpl) CountByChairAndDate(chairID uint, date time.Time) (int64, error) {
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour).Add(-time.Nanosecond)

	var count int64
	err := r.db.Model(&entities.Booking{}).
		Where("chair_id = ? AND start_time >= ? AND start_time <= ?", chairID, startOfDay, endOfDay).
		Count(&count).Error
	return count, err
}

// CountByStatusAndDateRange conta agendamentos por status em um período
func (r *bookingRepositoryImpl) CountByStatusAndDateRange(status string, startDate, endDate time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Booking{}).
		Where("status = ? AND start_time >= ? AND start_time <= ?", status, startDate, endDate).
		Count(&count).Error
	return count, err
}

// GetBookingsByDateRange busca agendamentos em um período específico
func (r *bookingRepositoryImpl) GetBookingsByDateRange(startDate, endDate time.Time) ([]*entities.Booking, error) {
	var bookings []*entities.Booking
	now := time.Now()
	err := r.db.Preload("User").Preload("Chair").
		Where("start_time >= ? AND start_time <= ? AND start_time > ?", startDate, endDate, now).
		Order("start_time ASC").
		Find(&bookings).Error
	return bookings, err
}

// GetBookingsByDateRangeIncludingPast busca agendamentos em um período específico incluindo passados
func (r *bookingRepositoryImpl) GetBookingsByDateRangeIncludingPast(startDate, endDate time.Time) ([]*entities.Booking, error) {
	var bookings []*entities.Booking
	err := r.db.Preload("User").Preload("Chair").
		Where("start_time >= ? AND start_time <= ?", startDate, endDate).
		Order("start_time ASC").
		Find(&bookings).Error
	return bookings, err
}
