package repositories

import (
	"agendamento-backend/internal/domain/entities"
	"time"
)

type BookingRepository interface {
	// CRUD básico
	Create(booking *entities.Booking) error
	GetByID(id uint) (*entities.Booking, error)
	Update(booking *entities.Booking) error
	Delete(id uint) error

	// Listagem e filtros
	List(limit, offset int, filters map[string]interface{}) ([]*entities.Booking, int64, error)
	GetByUser(userID uint, limit, offset int) ([]*entities.Booking, int64, error)
	GetByChair(chairID uint, limit, offset int) ([]*entities.Booking, int64, error)
	GetByStatus(status string, limit, offset int) ([]*entities.Booking, int64, error)
	GetByDateRange(startDate, endDate time.Time, limit, offset int) ([]*entities.Booking, int64, error)

	// Operações específicas de agendamento
	GetByDate(date time.Time) ([]*entities.Booking, error)
	GetByChairAndDate(chairID uint, date time.Time) ([]*entities.Booking, error)
	GetConflictingBookings(chairID uint, startTime, endTime time.Time) ([]*entities.Booking, error)
	GetUpcomingBookings(userID uint, limit int) ([]*entities.Booking, error)
	GetTodayBookings() ([]*entities.Booking, error)

	// Validações de conflito
	HasConflict(chairID uint, startTime, endTime time.Time, excludeBookingID *uint) (bool, error)
	CanBook(userID, chairID uint, startTime time.Time) (bool, string, error)
	HasActiveBooking(userID uint) (bool, error)

	// Operações de status
	Cancel(id uint, cancelledBy uint, reason string) error
	Confirm(id uint, confirmedBy uint) error
	Complete(id uint, completedBy uint) error
	MarkAsNoShow(id uint, markedBy uint) error

	// Estatísticas
	CountByStatus(status string) (int64, error)
	CountByUser(userID uint) (int64, error)
	CountByChair(chairID uint) (int64, error)
	CountByDate(date time.Time) (int64, error)
	CountTotal() (int64, error)

	// Relatórios
	GetBookingsByPeriod(startDate, endDate time.Time) ([]*entities.Booking, error)
	GetBookingsByDateRange(startDate, endDate time.Time) ([]*entities.Booking, error)
	GetBookingsByDateRangeIncludingPast(startDate, endDate time.Time) ([]*entities.Booking, error)
	GetOccupancyRate(chairID uint, startDate, endDate time.Time) (float64, error)
	GetUserBookingHistory(userID uint, limit, offset int) ([]*entities.Booking, int64, error)

	// Métodos para dashboard
	CountByDateRange(startDate, endDate time.Time) (int64, error)
	CountByChairAndDate(chairID uint, date time.Time) (int64, error)
	CountByStatusAndDateRange(status string, startDate, endDate time.Time) (int64, error)

	// Métodos incluindo agendamentos passados (para relatórios administrativos)
	GetByDateIncludingPast(date time.Time) ([]*entities.Booking, error)
	GetByChairAndDateIncludingPast(chairID uint, date time.Time) ([]*entities.Booking, error)
}
