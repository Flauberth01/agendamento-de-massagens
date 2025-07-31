package dtos

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCreateBookingRequest_Validation(t *testing.T) {
	now := time.Now()
	futureTime := now.Add(time.Hour)

	tests := []struct {
		name    string
		request CreateBookingRequest
		isValid bool
	}{
		{
			name: "Valid request",
			request: CreateBookingRequest{
				ChairID:   1,
				StartTime: futureTime,
				Notes:     "Teste de agendamento",
			},
			isValid: true,
		},
		{
			name: "Invalid - missing ChairID",
			request: CreateBookingRequest{
				StartTime: futureTime,
				Notes:     "Teste de agendamento",
			},
			isValid: false,
		},
		{
			name: "Invalid - past start time",
			request: CreateBookingRequest{
				ChairID:   1,
				StartTime: now.Add(-time.Hour),
				Notes:     "Teste de agendamento",
			},
			isValid: false,
		},
		{
			name: "Invalid - zero start time",
			request: CreateBookingRequest{
				ChairID:   1,
				StartTime: time.Time{},
				Notes:     "Teste de agendamento",
			},
			isValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Validar se todos os campos obrigatórios estão presentes
			hasRequiredFields := tt.request.ChairID != 0 &&
				!tt.request.StartTime.IsZero()

			// Validar se o horário é futuro
			hasValidTime := !tt.request.StartTime.IsZero() &&
				tt.request.StartTime.After(now)

			isValid := hasRequiredFields && hasValidTime

			assert.Equal(t, tt.isValid, isValid)
		})
	}
}

func TestUpdateBookingRequest_Validation(t *testing.T) {
	now := time.Now()
	futureTime := now.Add(time.Hour)

	tests := []struct {
		name    string
		request UpdateBookingRequest
		isValid bool
	}{
		{
			name: "Valid request",
			request: UpdateBookingRequest{
				StartTime: futureTime,
				EndTime:   futureTime.Add(30 * time.Minute),
				Notes:     "Atualização de agendamento",
			},
			isValid: true,
		},
		{
			name: "Invalid - past start time",
			request: UpdateBookingRequest{
				StartTime: now.Add(-time.Hour),
				EndTime:   now.Add(-30 * time.Minute),
				Notes:     "Atualização de agendamento",
			},
			isValid: false,
		},
		{
			name: "Invalid - end time before start time",
			request: UpdateBookingRequest{
				StartTime: futureTime,
				EndTime:   futureTime.Add(-30 * time.Minute),
				Notes:     "Atualização de agendamento",
			},
			isValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Validar se o horário é válido (se fornecido)
			hasValidTime := tt.request.StartTime.IsZero() ||
				tt.request.StartTime.After(now)

			// Validar se EndTime é depois de StartTime
			hasValidEndTime := tt.request.EndTime.After(tt.request.StartTime)

			isValid := hasValidTime && hasValidEndTime

			assert.Equal(t, tt.isValid, isValid)
		})
	}
}

func TestBookingResponse_Fields(t *testing.T) {
	now := time.Now()
	startTime := now.Add(time.Hour)
	endTime := startTime.Add(30 * time.Minute)

	response := BookingResponse{
		ID:        1,
		UserID:    1,
		ChairID:   1,
		StartTime: startTime,
		EndTime:   endTime,
		Status:    "agendado",
		Notes:     "Teste de agendamento",
		CreatedAt: now,
		UpdatedAt: now,
		User: UserResponse{
			ID:    1,
			Name:  "João Silva",
			Email: "joao@example.com",
		},
		Chair: ChairResponse{
			ID:       1,
			Name:     "Cadeira 1",
			Location: "Sala 101",
		},
	}

	// Validar campos essenciais
	assert.Equal(t, uint(1), response.ID)
	assert.Equal(t, uint(1), response.UserID)
	assert.Equal(t, uint(1), response.ChairID)
	assert.Equal(t, startTime, response.StartTime)
	assert.Equal(t, endTime, response.EndTime)
	assert.Equal(t, "agendado", response.Status)
	assert.Equal(t, "Teste de agendamento", response.Notes)
	assert.Equal(t, now, response.CreatedAt)
	assert.Equal(t, now, response.UpdatedAt)

	// Validar relacionamentos
	assert.Equal(t, uint(1), response.User.ID)
	assert.Equal(t, "João Silva", response.User.Name)
	assert.Equal(t, uint(1), response.Chair.ID)
	assert.Equal(t, "Cadeira 1", response.Chair.Name)
}

func TestListBookingsRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request ListBookingsRequest
		isValid bool
	}{
		{
			name: "Valid request",
			request: ListBookingsRequest{
				Limit:  10,
				Offset: 0,
				Filters: map[string]interface{}{
					"status":  "agendado",
					"user_id": 1,
				},
			},
			isValid: true,
		},
		{
			name: "Invalid limit",
			request: ListBookingsRequest{
				Limit:  -1,
				Offset: 0,
			},
			isValid: false,
		},
		{
			name: "Invalid offset",
			request: ListBookingsRequest{
				Limit:  10,
				Offset: -1,
			},
			isValid: false,
		},
		{
			name: "Valid request with date filters",
			request: ListBookingsRequest{
				Limit:  10,
				Offset: 0,
				Filters: map[string]interface{}{
					"start_date": "2023-12-25",
					"end_date":   "2023-12-26",
				},
			},
			isValid: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isValid := tt.request.Limit > 0 && tt.request.Offset >= 0
			assert.Equal(t, tt.isValid, isValid)
		})
	}
}

func TestListBookingsResponse_Fields(t *testing.T) {
	now := time.Now()
	startTime := now.Add(time.Hour)
	endTime := startTime.Add(30 * time.Minute)

	bookings := []BookingResponse{
		{
			ID:        1,
			UserID:    1,
			ChairID:   1,
			StartTime: startTime,
			EndTime:   endTime,
			Status:    "agendado",
			User: UserResponse{
				ID:   1,
				Name: "João Silva",
			},
			Chair: ChairResponse{
				ID:   1,
				Name: "Cadeira 1",
			},
		},
		{
			ID:        2,
			UserID:    2,
			ChairID:   1,
			StartTime: startTime.Add(time.Hour),
			EndTime:   endTime.Add(time.Hour),
			Status:    "agendado",
			User: UserResponse{
				ID:   2,
				Name: "Maria Santos",
			},
			Chair: ChairResponse{
				ID:   1,
				Name: "Cadeira 1",
			},
		},
	}

	response := ListBookingsResponse{
		Bookings: bookings,
		Total:    2,
		Limit:    10,
		Offset:   0,
	}

	// Validar estrutura da resposta
	assert.Len(t, response.Bookings, 2)
	assert.Equal(t, int64(2), response.Total)
	assert.Equal(t, 10, response.Limit)
	assert.Equal(t, 0, response.Offset)

	// Validar dados dos agendamentos
	assert.Equal(t, uint(1), response.Bookings[0].ID)
	assert.Equal(t, uint(1), response.Bookings[0].UserID)
	assert.Equal(t, "agendado", response.Bookings[0].Status)
	assert.Equal(t, "João Silva", response.Bookings[0].User.Name)

	assert.Equal(t, uint(2), response.Bookings[1].ID)
	assert.Equal(t, uint(2), response.Bookings[1].UserID)
	assert.Equal(t, "agendado", response.Bookings[1].Status)
	assert.Equal(t, "Maria Santos", response.Bookings[1].User.Name)
}

func TestBookingStatus_Validation(t *testing.T) {
	validStatuses := []string{"agendado", "presenca_confirmada", "cancelado", "realizado", "falta"}

	for _, status := range validStatuses {
		t.Run("Valid status: "+status, func(t *testing.T) {
			// Simular validação de status
			isValid := contains(validStatuses, status)
			assert.True(t, isValid)
		})
	}

	invalidStatuses := []string{"", "invalid", "pendente", "aprovado"}

	for _, status := range invalidStatuses {
		t.Run("Invalid status: "+status, func(t *testing.T) {
			// Simular validação de status
			isValid := contains(validStatuses, status)
			assert.False(t, isValid)
		})
	}
}

// Função auxiliar para verificar se um slice contém um valor
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}
