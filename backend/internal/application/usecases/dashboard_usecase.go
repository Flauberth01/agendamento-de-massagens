package usecases

import (
	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/repositories"
	"time"
)

type DashboardUseCase struct {
	bookingRepo repositories.BookingRepository
	userRepo    repositories.UserRepository
	chairRepo   repositories.ChairRepository
}

func NewDashboardUseCase(
	bookingRepo repositories.BookingRepository,
	userRepo repositories.UserRepository,
	chairRepo repositories.ChairRepository,
) *DashboardUseCase {
	return &DashboardUseCase{
		bookingRepo: bookingRepo,
		userRepo:    userRepo,
		chairRepo:   chairRepo,
	}
}

// DashboardData representa os dados do dashboard
type DashboardData struct {
	ScheduledSessions  []*entities.Booking `json:"scheduled_sessions"`
	PendingApprovals   []*entities.User    `json:"pending_approvals"`
	ChairOccupancy     []ChairOccupancy    `json:"chair_occupancy"`
	AttendanceStats    AttendanceStats     `json:"attendance_stats"`
	CancellationStats  CancellationStats   `json:"cancellation_stats"`
	TotalBookingsToday int64               `json:"total_bookings_today"`
	TotalBookingsWeek  int64               `json:"total_bookings_week"`
	TotalBookingsMonth int64               `json:"total_bookings_month"`
}

// ChairOccupancy representa a ocupação de uma cadeira
type ChairOccupancy struct {
	ChairID       uint    `json:"chair_id"`
	ChairName     string  `json:"chair_name"`
	TotalSlots    int     `json:"total_slots"`
	OccupiedSlots int     `json:"occupied_slots"`
	OccupancyRate float64 `json:"occupancy_rate"`
}

// AttendanceStats representa estatísticas de comparecimento
type AttendanceStats struct {
	TotalSessions    int64   `json:"total_sessions"`
	AttendedSessions int64   `json:"attended_sessions"`
	NoShowSessions   int64   `json:"no_show_sessions"`
	AttendanceRate   float64 `json:"attendance_rate"`
}

// CancellationStats representa estatísticas de cancelamento
type CancellationStats struct {
	TotalBookings     int64   `json:"total_bookings"`
	CancelledBookings int64   `json:"cancelled_bookings"`
	CancellationRate  float64 `json:"cancellation_rate"`
}

// getChairOccupancy calcula a ocupação das cadeiras para uma data
func (uc *DashboardUseCase) getChairOccupancy(date time.Time) ([]ChairOccupancy, error) {
	// Buscar todas as cadeiras
	chairs, _, err := uc.chairRepo.List(100, 0, nil) // Limite alto para pegar todas
	if err != nil {
		return nil, err
	}

	var occupancy []ChairOccupancy
	for _, chair := range chairs {
		// Contar agendamentos para esta cadeira na data
		occupiedSlots, err := uc.bookingRepo.CountByChairAndDate(chair.ID, date)
		if err != nil {
			return nil, err
		}

		// Assumindo 8 slots por dia (8h às 16h)
		totalSlots := 8
		occupancyRate := float64(occupiedSlots) / float64(totalSlots) * 100

		occupancy = append(occupancy, ChairOccupancy{
			ChairID:       chair.ID,
			ChairName:     chair.Name,
			TotalSlots:    totalSlots,
			OccupiedSlots: int(occupiedSlots),
			OccupancyRate: occupancyRate,
		})
	}

	return occupancy, nil
}

// getAttendanceStats calcula estatísticas de comparecimento
func (uc *DashboardUseCase) getAttendanceStats(days int) (*AttendanceStats, error) {
	startDate := time.Now().AddDate(0, 0, -days)
	endDate := time.Now()

	// Contar sessões completadas
	totalSessions, err := uc.bookingRepo.CountByStatusAndDateRange("completado", startDate, endDate)
	if err != nil {
		return nil, err
	}

	// Contar no-shows
	noShowSessions, err := uc.bookingRepo.CountByStatusAndDateRange("faltou", startDate, endDate)
	if err != nil {
		return nil, err
	}

	attendedSessions := totalSessions
	totalSessionsWithNoShow := totalSessions + noShowSessions

	var attendanceRate float64
	if totalSessionsWithNoShow > 0 {
		attendanceRate = float64(attendedSessions) / float64(totalSessionsWithNoShow) * 100
	}

	return &AttendanceStats{
		TotalSessions:    totalSessionsWithNoShow,
		AttendedSessions: attendedSessions,
		NoShowSessions:   noShowSessions,
		AttendanceRate:   attendanceRate,
	}, nil
}

// getCancellationStats calcula estatísticas de cancelamento
func (uc *DashboardUseCase) getCancellationStats(days int) (*CancellationStats, error) {
	startDate := time.Now().AddDate(0, 0, -days)
	endDate := time.Now()

	// Contar todos os agendamentos
	totalBookings, err := uc.bookingRepo.CountByDateRange(startDate, endDate)
	if err != nil {
		return nil, err
	}

	// Contar cancelamentos
	cancelledBookings, err := uc.bookingRepo.CountByStatusAndDateRange("cancelado", startDate, endDate)
	if err != nil {
		return nil, err
	}

	var cancellationRate float64
	if totalBookings > 0 {
		cancellationRate = float64(cancelledBookings) / float64(totalBookings) * 100
	}

	return &CancellationStats{
		TotalBookings:     totalBookings,
		CancelledBookings: cancelledBookings,
		CancellationRate:  cancellationRate,
	}, nil
}
