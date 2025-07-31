package entities

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestBooking_IsActive(t *testing.T) {
	tests := []struct {
		name     string
		status   string
		expected bool
	}{
		{"Agendado", "agendado", true},
		{"Presença confirmada", "presenca_confirmada", true},
		{"Cancelado", "cancelado", false},
		{"Realizado", "realizado", false},
		{"Falta", "falta", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			booking := &Booking{Status: tt.status}
			assert.Equal(t, tt.expected, booking.IsActive())
		})
	}
}

func TestBooking_IsCancelled(t *testing.T) {
	tests := []struct {
		name     string
		status   string
		expected bool
	}{
		{"Cancelado", "cancelado", true},
		{"Agendado", "agendado", false},
		{"Presença confirmada", "presenca_confirmada", false},
		{"Realizado", "realizado", false},
		{"Falta", "falta", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			booking := &Booking{Status: tt.status}
			assert.Equal(t, tt.expected, booking.IsCancelled())
		})
	}
}

func TestBooking_IsCompleted(t *testing.T) {
	tests := []struct {
		name     string
		status   string
		expected bool
	}{
		{"Realizado", "realizado", true},
		{"Agendado", "agendado", false},
		{"Presença confirmada", "presenca_confirmada", false},
		{"Cancelado", "cancelado", false},
		{"Falta", "falta", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			booking := &Booking{Status: tt.status}
			assert.Equal(t, tt.expected, booking.IsCompleted())
		})
	}
}

func TestBooking_IsPresenceConfirmed(t *testing.T) {
	tests := []struct {
		name     string
		status   string
		expected bool
	}{
		{"Presença confirmada", "presenca_confirmada", true},
		{"Agendado", "agendado", false},
		{"Realizado", "realizado", false},
		{"Cancelado", "cancelado", false},
		{"Falta", "falta", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			booking := &Booking{Status: tt.status}
			assert.Equal(t, tt.expected, booking.IsPresenceConfirmed())
		})
	}
}

func TestBooking_CanBeCancelled(t *testing.T) {
	now := time.Now()

	tests := []struct {
		name      string
		startTime time.Time
		status    string
		expected  bool
	}{
		{
			name:      "Pode cancelar - 4 horas antes",
			startTime: now.Add(4 * time.Hour),
			status:    "agendado",
			expected:  true,
		},
		{
			name:      "Não pode cancelar - 2 horas antes",
			startTime: now.Add(2 * time.Hour),
			status:    "agendado",
			expected:  false,
		},
		{
			name:      "Não pode cancelar - já cancelado",
			startTime: now.Add(4 * time.Hour),
			status:    "cancelado",
			expected:  false,
		},
		{
			name:      "Não pode cancelar - já realizado",
			startTime: now.Add(4 * time.Hour),
			status:    "realizado",
			expected:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			booking := &Booking{
				StartTime: tt.startTime,
				Status:    tt.status,
			}
			assert.Equal(t, tt.expected, booking.CanBeCancelled())
		})
	}
}

func TestBooking_Cancel(t *testing.T) {
	booking := &Booking{
		ID:        1,
		UserID:    1,
		ChairID:   1,
		StartTime: time.Now().Add(time.Hour),
		EndTime:   time.Now().Add(90 * time.Minute),
		Status:    "agendado",
	}

	booking.Cancel()
	assert.Equal(t, "cancelado", booking.Status)
}

func TestBooking_ConfirmPresence(t *testing.T) {
	booking := &Booking{
		ID:        1,
		UserID:    1,
		ChairID:   1,
		StartTime: time.Now().Add(time.Hour),
		EndTime:   time.Now().Add(90 * time.Minute),
		Status:    "agendado",
	}

	booking.ConfirmPresence()
	assert.Equal(t, "presenca_confirmada", booking.Status)
}

func TestBooking_Complete(t *testing.T) {
	booking := &Booking{
		ID:        1,
		UserID:    1,
		ChairID:   1,
		StartTime: time.Now().Add(time.Hour),
		EndTime:   time.Now().Add(90 * time.Minute),
		Status:    "presenca_confirmada",
	}

	booking.Complete()
	assert.Equal(t, "realizado", booking.Status)
}

func TestBooking_MarkAsNoShow(t *testing.T) {
	booking := &Booking{
		ID:        1,
		UserID:    1,
		ChairID:   1,
		StartTime: time.Now().Add(time.Hour),
		EndTime:   time.Now().Add(90 * time.Minute),
		Status:    "agendado",
	}

	booking.MarkAsNoShow()
	assert.Equal(t, "falta", booking.Status)
}

func TestBooking_GetDuration(t *testing.T) {
	startTime := time.Date(2023, 12, 25, 14, 0, 0, 0, time.UTC)
	endTime := time.Date(2023, 12, 25, 14, 30, 0, 0, time.UTC)

	booking := &Booking{
		ID:        1,
		UserID:    1,
		ChairID:   1,
		StartTime: startTime,
		EndTime:   endTime,
		Status:    "agendado",
	}

	duration := booking.GetDuration()
	expectedDuration := 30 * time.Minute

	assert.Equal(t, expectedDuration, duration)
}

func TestBooking_IsToday(t *testing.T) {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 14, 0, 0, 0, now.Location())
	tomorrow := today.Add(24 * time.Hour)

	tests := []struct {
		name      string
		startTime time.Time
		expected  bool
	}{
		{"Hoje", today, true},
		{"Amanhã", tomorrow, false},
		{"Ontem", today.Add(-24 * time.Hour), false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			booking := &Booking{
				ID:        1,
				UserID:    1,
				ChairID:   1,
				StartTime: tt.startTime,
				EndTime:   tt.startTime.Add(30 * time.Minute),
				Status:    "agendado",
			}
			assert.Equal(t, tt.expected, booking.IsToday())
		})
	}
}

func TestBooking_IsPast(t *testing.T) {
	now := time.Now()
	past := now.Add(-time.Hour)
	future := now.Add(time.Hour)

	tests := []struct {
		name     string
		endTime  time.Time
		expected bool
	}{
		{"Passado", past, true},
		{"Futuro", future, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			booking := &Booking{
				ID:        1,
				UserID:    1,
				ChairID:   1,
				StartTime: tt.endTime.Add(-30 * time.Minute),
				EndTime:   tt.endTime,
				Status:    "agendado",
			}
			assert.Equal(t, tt.expected, booking.IsPast())
		})
	}
}

func TestBooking_IsFuture(t *testing.T) {
	now := time.Now()
	past := now.Add(-time.Hour)
	future := now.Add(time.Hour)

	tests := []struct {
		name      string
		startTime time.Time
		expected  bool
	}{
		{"Futuro", future, true},
		{"Passado", past, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			booking := &Booking{
				ID:        1,
				UserID:    1,
				ChairID:   1,
				StartTime: tt.startTime,
				EndTime:   tt.startTime.Add(30 * time.Minute),
				Status:    "agendado",
			}
			assert.Equal(t, tt.expected, booking.IsFuture())
		})
	}
}

func TestBooking_Validation(t *testing.T) {
	now := time.Now()

	validBooking := &Booking{
		ID:        1,
		UserID:    1,
		ChairID:   1,
		StartTime: now.Add(time.Hour),
		EndTime:   now.Add(90 * time.Minute),
		Status:    "agendado",
		Notes:     "Teste de agendamento",
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Teste de campos obrigatórios
	assert.NotZero(t, validBooking.UserID)
	assert.NotZero(t, validBooking.ChairID)
	assert.NotZero(t, validBooking.StartTime)
	assert.NotZero(t, validBooking.EndTime)
	assert.NotEmpty(t, validBooking.Status)
	assert.NotZero(t, validBooking.CreatedAt)
	assert.NotZero(t, validBooking.UpdatedAt)
}

func TestBooking_TableName(t *testing.T) {
	booking := &Booking{}
	assert.Equal(t, "bookings", booking.TableName())
}
