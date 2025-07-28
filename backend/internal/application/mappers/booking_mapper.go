package mappers

import (
	"agendamento-backend/internal/application/dtos"
	"agendamento-backend/internal/domain/entities"
)

// ToBookingEntity converte CreateBookingRequest para entidade Booking
func ToBookingEntity(req *dtos.CreateBookingRequest) *entities.Booking {
	return &entities.Booking{
		ChairID:   req.ChairID,
		StartTime: req.StartTime,
		Notes:     req.Notes,
		// UserID deve ser definido pelo handler a partir do contexto de autenticação
		// EndTime será definido automaticamente pelos hooks da entidade (30 minutos após StartTime)
	}
}

// ToBookingUpdateEntity converte UpdateBookingRequest para entidade Booking
func ToBookingUpdateEntity(id uint, req *dtos.UpdateBookingRequest) *entities.Booking {
	return &entities.Booking{
		ID:        id,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		Notes:     req.Notes,
	}
}

// ToBookingResponse converte entidade Booking para BookingResponse
func ToBookingResponse(booking *entities.Booking) *dtos.BookingResponse {
	return &dtos.BookingResponse{
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
}

// ToCreateBookingResponse converte entidade Booking para CreateBookingResponse
func ToCreateBookingResponse(booking *entities.Booking) *dtos.CreateBookingResponse {
	return &dtos.CreateBookingResponse{
		ID:        booking.ID,
		UserID:    booking.UserID,
		ChairID:   booking.ChairID,
		StartTime: booking.StartTime,
		EndTime:   booking.EndTime,
		Status:    booking.Status,
		Notes:     booking.Notes,
		CreatedAt: booking.CreatedAt,
	}
}

// ToBookingWithRelationsResponse converte entidade Booking com relacionamentos
func ToBookingWithRelationsResponse(booking *entities.Booking, user *entities.User, chair *entities.Chair) *dtos.BookingWithRelationsResponse {
	response := &dtos.BookingWithRelationsResponse{
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

	if user != nil {
		userResponse := ToResponse(user)
		response.User = *userResponse
	}

	if chair != nil {
		chairResponse := ToChairResponse(chair)
		response.Chair = *chairResponse
	}

	return response
}

// ToBookingResponseList converte lista de entidades Booking para lista de BookingResponse
func ToBookingResponseList(bookings []*entities.Booking) []dtos.BookingResponse {
	responses := make([]dtos.BookingResponse, len(bookings))
	for i, booking := range bookings {
		responses[i] = *ToBookingResponse(booking)
	}
	return responses
}

// ToListBookingsResponse converte lista de entidades Booking para ListBookingsResponse
func ToListBookingsResponse(bookings []*entities.Booking, total int64, limit, offset int) *dtos.ListBookingsResponse {
	return &dtos.ListBookingsResponse{
		Bookings: ToBookingResponseList(bookings),
		Total:    total,
		Limit:    limit,
		Offset:   offset,
	}
}

// ToBookingStatsResponse converte estatísticas para BookingStatsResponse
func ToBookingStatsResponse(stats map[string]int64) *dtos.BookingStatsResponse {
	return &dtos.BookingStatsResponse{
		TotalBookings:     stats["total"],
		ConfirmedBookings: stats["confirmed"],
		CancelledBookings: stats["cancelled"],
		CompletedBookings: stats["completed"],
		PendingBookings:   stats["pending"],
	}
}
