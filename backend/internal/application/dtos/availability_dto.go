package dtos

import "time"

// CreateAvailabilityRequest representa os dados para criar uma disponibilidade
type CreateAvailabilityRequest struct {
	ChairID   uint   `json:"chair_id" validate:"required"`
	DayOfWeek int    `json:"day_of_week" validate:"required,min=0,max=6"`
	StartTime string `json:"start_time" validate:"required"`
	EndTime   string `json:"end_time" validate:"required"`
	IsActive  bool   `json:"is_active"`
}

// CreateAvailabilityResponse representa a resposta da criação de disponibilidade
type CreateAvailabilityResponse struct {
	ID        uint      `json:"id"`
	ChairID   uint      `json:"chair_id"`
	DayOfWeek int       `json:"day_of_week"`
	StartTime string    `json:"start_time"`
	EndTime   string    `json:"end_time"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

// UpdateAvailabilityRequest representa os dados para atualizar uma disponibilidade
type UpdateAvailabilityRequest struct {
	DayOfWeek int    `json:"day_of_week" validate:"required,min=0,max=6"`
	StartTime string `json:"start_time" validate:"required"`
	EndTime   string `json:"end_time" validate:"required"`
	IsActive  bool   `json:"is_active"`
}

// AvailabilityDataResponse representa a resposta de dados de disponibilidade
type AvailabilityDataResponse struct {
	ID        uint      `json:"id"`
	ChairID   uint      `json:"chair_id"`
	DayOfWeek int       `json:"day_of_week"`
	StartTime string    `json:"start_time"`
	EndTime   string    `json:"end_time"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ListAvailabilitiesRequest representa os filtros para listar disponibilidades
type ListAvailabilitiesRequest struct {
	Limit   int                    `json:"limit" validate:"min=1,max=100"`
	Offset  int                    `json:"offset" validate:"min=0"`
	Filters map[string]interface{} `json:"filters"`
}

// ListAvailabilitiesResponse representa a resposta da listagem de disponibilidades
type ListAvailabilitiesResponse struct {
	Availabilities []AvailabilityDataResponse `json:"availabilities"`
	Total          int64                      `json:"total"`
	Limit          int                        `json:"limit"`
	Offset         int                        `json:"offset"`
}

// CheckChairAvailabilityRequest representa os dados para verificar disponibilidade de uma cadeira
type CheckChairAvailabilityRequest struct {
	ChairID   uint      `json:"chair_id" validate:"required"`
	Date      time.Time `json:"date" validate:"required"`
	StartTime time.Time `json:"start_time" validate:"required"`
	EndTime   time.Time `json:"end_time" validate:"required"`
}

// ChairAvailabilityResponse representa a resposta de disponibilidade de uma cadeira
type ChairAvailabilityResponse struct {
	ChairID     uint      `json:"chair_id"`
	Date        time.Time `json:"date"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	IsAvailable bool      `json:"is_available"`
	Message     string    `json:"message"`
}

// WeeklyAvailabilityRequest representa os dados para obter disponibilidade semanal
type WeeklyAvailabilityRequest struct {
	ChairID uint      `json:"chair_id" validate:"required"`
	WeekOf  time.Time `json:"week_of" validate:"required"`
}

// WeeklyAvailabilityResponse representa a resposta de disponibilidade semanal
type WeeklyAvailabilityResponse struct {
	ChairID    uint                       `json:"chair_id"`
	WeekOf     time.Time                  `json:"week_of"`
	DailySlots map[int][]TimeSlotResponse `json:"daily_slots"` // day_of_week -> time slots
}

// TimeSlotResponse representa um slot de tempo disponível
type TimeSlotResponse struct {
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
	Available bool      `json:"available"`
}
