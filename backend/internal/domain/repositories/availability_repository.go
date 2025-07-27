package repositories

import (
	"time"
	"agendamento-backend/internal/domain/entities"
)

type AvailabilityRepository interface {
	// CRUD básico
	Create(availability *entities.Availability) error
	GetByID(id uint) (*entities.Availability, error)
	Update(availability *entities.Availability) error
	Delete(id uint) error

	// Listagem e filtros
	List(limit, offset int, filters map[string]interface{}) ([]*entities.Availability, int64, error)
	GetByChair(chairID uint) ([]*entities.Availability, error)
	GetByDayOfWeek(dayOfWeek int) ([]*entities.Availability, error)
	GetActive() ([]*entities.Availability, error)

	// Operações específicas
	GetByChairAndDay(chairID uint, dayOfWeek int) ([]*entities.Availability, error)
	GetValidForDate(date time.Time) ([]*entities.Availability, error)
	GetChairAvailabilityForDate(chairID uint, date time.Time) ([]*entities.Availability, error)

	// Validações
	HasConflict(chairID uint, dayOfWeek int, startTime, endTime string, excludeID *uint) (bool, error)
	IsChairAvailableAtTime(chairID uint, dateTime time.Time) (bool, error)

	// Operações de status
	Activate(id uint) error
	Deactivate(id uint) error
	SetValidityPeriod(id uint, validFrom, validTo *time.Time) error

	// Estatísticas
	CountByChair(chairID uint) (int64, error)
	CountActive() (int64, error)
	CountTotal() (int64, error)
}
