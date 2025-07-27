package dtos

import "time"

// CreateBookingRequest representa os dados para criar um agendamento
type CreateBookingRequest struct {
	UserID    uint      `json:"user_id" validate:"required"`
	ChairID   uint      `json:"chair_id" validate:"required"`
	StartTime time.Time `json:"start_time" validate:"required"`
	EndTime   time.Time `json:"end_time" validate:"required"`
	Notes     string    `json:"notes" validate:"max=1000"`
}

// CreateBookingResponse representa a resposta da criação de agendamento
type CreateBookingResponse struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	ChairID   uint      `json:"chair_id"`
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
	Status    string    `json:"status"`
	Notes     string    `json:"notes"`
	CreatedAt time.Time `json:"created_at"`
}

// UpdateBookingRequest representa os dados para atualizar um agendamento
type UpdateBookingRequest struct {
	StartTime time.Time `json:"start_time" validate:"required"`
	EndTime   time.Time `json:"end_time" validate:"required"`
	Notes     string    `json:"notes" validate:"max=1000"`
}

// BookingResponse representa a resposta de dados de agendamento
type BookingResponse struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	ChairID   uint      `json:"chair_id"`
	StartTime time.Time `json:"start_time"`
	EndTime   time.Time `json:"end_time"`
	Status    string    `json:"status"`
	Notes     string    `json:"notes"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// BookingWithRelationsResponse representa agendamento com relacionamentos
type BookingWithRelationsResponse struct {
	ID        uint          `json:"id"`
	UserID    uint          `json:"user_id"`
	ChairID   uint          `json:"chair_id"`
	StartTime time.Time     `json:"start_time"`
	EndTime   time.Time     `json:"end_time"`
	Status    string        `json:"status"`
	Notes     string        `json:"notes"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
	User      UserResponse  `json:"user"`
	Chair     ChairResponse `json:"chair"`
}

// ListBookingsRequest representa os filtros para listar agendamentos
type ListBookingsRequest struct {
	Limit   int                    `json:"limit" validate:"min=1,max=100"`
	Offset  int                    `json:"offset" validate:"min=0"`
	Filters map[string]interface{} `json:"filters"`
}

// ListBookingsResponse representa a resposta da listagem de agendamentos
type ListBookingsResponse struct {
	Bookings []BookingResponse `json:"bookings"`
	Total    int64             `json:"total"`
	Limit    int               `json:"limit"`
	Offset   int               `json:"offset"`
}

// CancelBookingRequest representa os dados para cancelar um agendamento
type CancelBookingRequest struct {
	Reason string `json:"reason" validate:"required,min=5,max=500"`
}

// BookingStatsResponse representa estatísticas dos agendamentos
type BookingStatsResponse struct {
	TotalBookings     int64 `json:"total_bookings"`
	ConfirmedBookings int64 `json:"confirmed_bookings"`
	CancelledBookings int64 `json:"cancelled_bookings"`
	CompletedBookings int64 `json:"completed_bookings"`
	PendingBookings   int64 `json:"pending_bookings"`
}

// CheckAvailabilityRequest representa os dados para verificar disponibilidade
type CheckAvailabilityRequest struct {
	ChairID   uint      `json:"chair_id" validate:"required"`
	StartTime time.Time `json:"start_time" validate:"required"`
	EndTime   time.Time `json:"end_time" validate:"required"`
}

// AvailabilityResponse representa a resposta de disponibilidade
type AvailabilityResponse struct {
	Available bool   `json:"available"`
	Message   string `json:"message"`
}
