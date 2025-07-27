package mappers

import (
	"time"
	"agendamento-backend/internal/application/dtos"
	"agendamento-backend/internal/domain/entities"
)

// ToAvailabilityEntity converte CreateAvailabilityRequest para entidade Availability
func ToAvailabilityEntity(req *dtos.CreateAvailabilityRequest) *entities.Availability {
	return &entities.Availability{
		ChairID:   req.ChairID,
		DayOfWeek: req.DayOfWeek,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		IsActive:  req.IsActive,
	}
}

// ToAvailabilityUpdateEntity converte UpdateAvailabilityRequest para entidade Availability
func ToAvailabilityUpdateEntity(id uint, req *dtos.UpdateAvailabilityRequest) *entities.Availability {
	return &entities.Availability{
		ID:        id,
		DayOfWeek: req.DayOfWeek,
		StartTime: req.StartTime,
		EndTime:   req.EndTime,
		IsActive:  req.IsActive,
	}
}

// ToAvailabilityDataResponse converte entidade Availability para AvailabilityDataResponse
func ToAvailabilityDataResponse(availability *entities.Availability) *dtos.AvailabilityDataResponse {
	return &dtos.AvailabilityDataResponse{
		ID:        availability.ID,
		ChairID:   availability.ChairID,
		DayOfWeek: availability.DayOfWeek,
		StartTime: availability.StartTime,
		EndTime:   availability.EndTime,
		IsActive:  availability.IsActive,
		CreatedAt: availability.CreatedAt,
		UpdatedAt: availability.UpdatedAt,
	}
}

// ToCreateAvailabilityResponse converte entidade Availability para CreateAvailabilityResponse
func ToCreateAvailabilityResponse(availability *entities.Availability) *dtos.CreateAvailabilityResponse {
	return &dtos.CreateAvailabilityResponse{
		ID:        availability.ID,
		ChairID:   availability.ChairID,
		DayOfWeek: availability.DayOfWeek,
		StartTime: availability.StartTime,
		EndTime:   availability.EndTime,
		IsActive:  availability.IsActive,
		CreatedAt: availability.CreatedAt,
	}
}

// ToAvailabilityDataResponseList converte lista de entidades Availability para lista de AvailabilityDataResponse
func ToAvailabilityDataResponseList(availabilities []*entities.Availability) []dtos.AvailabilityDataResponse {
	responses := make([]dtos.AvailabilityDataResponse, len(availabilities))
	for i, availability := range availabilities {
		responses[i] = *ToAvailabilityDataResponse(availability)
	}
	return responses
}

// ToListAvailabilitiesResponse converte lista de entidades Availability para ListAvailabilitiesResponse
func ToListAvailabilitiesResponse(availabilities []*entities.Availability, total int64, limit, offset int) *dtos.ListAvailabilitiesResponse {
	return &dtos.ListAvailabilitiesResponse{
		Availabilities: ToAvailabilityDataResponseList(availabilities),
		Total:          total,
		Limit:          limit,
		Offset:         offset,
	}
}

// ToChairAvailabilityResponse converte dados para ChairAvailabilityResponse
func ToChairAvailabilityResponse(chairID uint, date, startTime, endTime time.Time, isAvailable bool, message string) *dtos.ChairAvailabilityResponse {
	return &dtos.ChairAvailabilityResponse{
		ChairID:     chairID,
		Date:        date,
		StartTime:   startTime,
		EndTime:     endTime,
		IsAvailable: isAvailable,
		Message:     message,
	}
}

// ToTimeSlotResponse converte dados para TimeSlotResponse
func ToTimeSlotResponse(startTime, endTime time.Time, available bool) *dtos.TimeSlotResponse {
	return &dtos.TimeSlotResponse{
		StartTime: startTime,
		EndTime:   endTime,
		Available: available,
	}
}

// ToWeeklyAvailabilityResponse converte dados para WeeklyAvailabilityResponse
func ToWeeklyAvailabilityResponse(chairID uint, weekOf time.Time, dailySlots map[int][]dtos.TimeSlotResponse) *dtos.WeeklyAvailabilityResponse {
	return &dtos.WeeklyAvailabilityResponse{
		ChairID:    chairID,
		WeekOf:     weekOf,
		DailySlots: dailySlots,
	}
}
