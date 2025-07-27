package repositories

import (
	"time"

	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/repositories"
	"gorm.io/gorm"
)

type availabilityRepositoryImpl struct {
	db *gorm.DB
}

func NewAvailabilityRepository(db *gorm.DB) repositories.AvailabilityRepository {
	return &availabilityRepositoryImpl{
		db: db,
	}
}

// Create cria uma nova disponibilidade
func (r *availabilityRepositoryImpl) Create(availability *entities.Availability) error {
	return r.db.Create(availability).Error
}

// GetByID busca disponibilidade por ID
func (r *availabilityRepositoryImpl) GetByID(id uint) (*entities.Availability, error) {
	var availability entities.Availability
	err := r.db.Preload("Chair").First(&availability, id).Error
	if err != nil {
		return nil, err
	}
	return &availability, nil
}

// Update atualiza uma disponibilidade
func (r *availabilityRepositoryImpl) Update(availability *entities.Availability) error {
	return r.db.Save(availability).Error
}

// Delete exclui uma disponibilidade (soft delete)
func (r *availabilityRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&entities.Availability{}, id).Error
}

// List lista disponibilidades com paginação e filtros
func (r *availabilityRepositoryImpl) List(limit, offset int, filters map[string]interface{}) ([]*entities.Availability, int64, error) {
	var availabilities []*entities.Availability
	var total int64

	query := r.db.Model(&entities.Availability{}).Preload("Chair")

	// Aplicar filtros
	for key, value := range filters {
		switch key {
		case "chair_id":
			query = query.Where("chair_id = ?", value)
		case "day_of_week":
			query = query.Where("day_of_week = ?", value)
		case "is_active":
			query = query.Where("is_active = ?", value)
		case "start_time":
			query = query.Where("start_time >= ?", value)
		case "end_time":
			query = query.Where("end_time <= ?", value)
		}
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("chair_id ASC, day_of_week ASC, start_time ASC").Find(&availabilities).Error
	return availabilities, total, err
}

// GetByChair busca disponibilidades de uma cadeira
func (r *availabilityRepositoryImpl) GetByChair(chairID uint) ([]*entities.Availability, error) {
	var availabilities []*entities.Availability
	err := r.db.Where("chair_id = ?", chairID).Order("day_of_week ASC, start_time ASC").Find(&availabilities).Error
	return availabilities, err
}

// GetByDayOfWeek busca disponibilidades por dia da semana
func (r *availabilityRepositoryImpl) GetByDayOfWeek(dayOfWeek int) ([]*entities.Availability, error) {
	var availabilities []*entities.Availability
	err := r.db.Preload("Chair").Where("day_of_week = ? AND is_active = ?", dayOfWeek, true).
		Order("chair_id ASC, start_time ASC").Find(&availabilities).Error
	return availabilities, err
}

// GetActive busca disponibilidades ativas
func (r *availabilityRepositoryImpl) GetActive() ([]*entities.Availability, error) {
	var availabilities []*entities.Availability
	err := r.db.Preload("Chair").Where("is_active = ?", true).
		Order("chair_id ASC, day_of_week ASC, start_time ASC").Find(&availabilities).Error
	return availabilities, err
}

// GetByChairAndDay busca disponibilidades de uma cadeira em um dia específico
func (r *availabilityRepositoryImpl) GetByChairAndDay(chairID uint, dayOfWeek int) ([]*entities.Availability, error) {
	var availabilities []*entities.Availability
	err := r.db.Where("chair_id = ? AND day_of_week = ? AND is_active = ?", chairID, dayOfWeek, true).
		Order("start_time ASC").Find(&availabilities).Error
	return availabilities, err
}

// GetValidForDate busca disponibilidades válidas para uma data
func (r *availabilityRepositoryImpl) GetValidForDate(date time.Time) ([]*entities.Availability, error) {
	var availabilities []*entities.Availability
	dayOfWeek := int(date.Weekday())

	query := r.db.Preload("Chair").Where("day_of_week = ? AND is_active = ?", dayOfWeek, true)

	// Filtrar por período de validade
	query = query.Where("(valid_from IS NULL OR valid_from <= ?) AND (valid_to IS NULL OR valid_to >= ?)", date, date)

	err := query.Order("chair_id ASC, start_time ASC").Find(&availabilities).Error
	return availabilities, err
}

// GetChairAvailabilityForDate busca disponibilidade de uma cadeira para uma data
func (r *availabilityRepositoryImpl) GetChairAvailabilityForDate(chairID uint, date time.Time) ([]*entities.Availability, error) {
	var availabilities []*entities.Availability
	dayOfWeek := int(date.Weekday())

	query := r.db.Where("chair_id = ? AND day_of_week = ? AND is_active = ?", chairID, dayOfWeek, true)

	// Filtrar por período de validade
	query = query.Where("(valid_from IS NULL OR valid_from <= ?) AND (valid_to IS NULL OR valid_to >= ?)", date, date)

	err := query.Order("start_time ASC").Find(&availabilities).Error
	return availabilities, err
}

// HasConflict verifica se há conflito de horário
func (r *availabilityRepositoryImpl) HasConflict(chairID uint, dayOfWeek int, startTime, endTime string, excludeID *uint) (bool, error) {
	query := r.db.Model(&entities.Availability{}).
		Where("chair_id = ? AND day_of_week = ? AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?))",
			chairID, dayOfWeek, endTime, startTime, startTime, endTime)

	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	var count int64
	err := query.Count(&count).Error
	return count > 0, err
}

// IsChairAvailableAtTime verifica se uma cadeira está disponível em um horário
func (r *availabilityRepositoryImpl) IsChairAvailableAtTime(chairID uint, dateTime time.Time) (bool, error) {
	dayOfWeek := int(dateTime.Weekday())
	timeStr := dateTime.Format("15:04")

	var count int64
	query := r.db.Model(&entities.Availability{}).
		Where("chair_id = ? AND day_of_week = ? AND is_active = ? AND start_time <= ? AND end_time > ?",
			chairID, dayOfWeek, true, timeStr, timeStr)

	// Filtrar por período de validade
	date := time.Date(dateTime.Year(), dateTime.Month(), dateTime.Day(), 0, 0, 0, 0, dateTime.Location())
	query = query.Where("(valid_from IS NULL OR valid_from <= ?) AND (valid_to IS NULL OR valid_to >= ?)", date, date)

	err := query.Count(&count).Error
	return count > 0, err
}

// Activate ativa uma disponibilidade
func (r *availabilityRepositoryImpl) Activate(id uint) error {
	return r.db.Model(&entities.Availability{}).Where("id = ?", id).Update("is_active", true).Error
}

// Deactivate desativa uma disponibilidade
func (r *availabilityRepositoryImpl) Deactivate(id uint) error {
	return r.db.Model(&entities.Availability{}).Where("id = ?", id).Update("is_active", false).Error
}

// SetValidityPeriod define período de validade
func (r *availabilityRepositoryImpl) SetValidityPeriod(id uint, validFrom, validTo *time.Time) error {
	return r.db.Model(&entities.Availability{}).Where("id = ?", id).Updates(map[string]interface{}{
		"valid_from": validFrom,
		"valid_to":   validTo,
	}).Error
}

// CountByChair conta disponibilidades de uma cadeira
func (r *availabilityRepositoryImpl) CountByChair(chairID uint) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Availability{}).Where("chair_id = ?", chairID).Count(&count).Error
	return count, err
}

// CountActive conta disponibilidades ativas
func (r *availabilityRepositoryImpl) CountActive() (int64, error) {
	var count int64
	err := r.db.Model(&entities.Availability{}).Where("is_active = ?", true).Count(&count).Error
	return count, err
}

// CountTotal conta total de disponibilidades
func (r *availabilityRepositoryImpl) CountTotal() (int64, error) {
	var count int64
	err := r.db.Model(&entities.Availability{}).Count(&count).Error
	return count, err
}
