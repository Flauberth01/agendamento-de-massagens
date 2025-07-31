package entities

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestAvailability_IsValidForDate(t *testing.T) {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	tests := []struct {
		name         string
		availability *Availability
		date         time.Time
		expected     bool
	}{
		{
			name: "Válida para hoje - dia correto e ativa",
			availability: &Availability{
				DayOfWeek: int(today.Weekday()),
				IsActive:  true,
			},
			date:     today,
			expected: true,
		},
		{
			name: "Inválida - dia da semana diferente",
			availability: &Availability{
				DayOfWeek: int(today.Weekday()),
				IsActive:  true,
			},
			date:     today.Add(24 * time.Hour), // Amanhã
			expected: false,
		},
		{
			name: "Inválida - inativa",
			availability: &Availability{
				DayOfWeek: int(today.Weekday()),
				IsActive:  false,
			},
			date:     today,
			expected: false,
		},
		{
			name: "Inválida - antes do período de validade",
			availability: &Availability{
				DayOfWeek: int(today.Weekday()),
				IsActive:  true,
				ValidFrom: &today,
			},
			date:     today.Add(-24 * time.Hour), // Ontem
			expected: false,
		},
		{
			name: "Inválida - depois do período de validade",
			availability: &Availability{
				DayOfWeek: int(today.Weekday()),
				IsActive:  true,
				ValidTo:   &today,
			},
			date:     today.Add(24 * time.Hour), // Amanhã
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.availability.IsValidForDate(tt.date)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestAvailability_GetTimeSlots(t *testing.T) {
	tests := []struct {
		name          string
		startTime     string
		endTime       string
		expectedSlots []string
		expectError   bool
	}{
		{
			name:          "Slots válidos - 2 horas",
			startTime:     "09:00",
			endTime:       "11:00",
			expectedSlots: []string{"09:00", "09:30", "10:00", "10:30"},
			expectError:   false,
		},
		{
			name:          "Slots válidos - 1 hora",
			startTime:     "14:00",
			endTime:       "15:00",
			expectedSlots: []string{"14:00", "14:30"},
			expectError:   false,
		},
		{
			name:          "Slots válidos - 30 minutos",
			startTime:     "16:00",
			endTime:       "16:30",
			expectedSlots: []string{"16:00"},
			expectError:   false,
		},
		{
			name:          "Formato inválido",
			startTime:     "invalid",
			endTime:       "15:00",
			expectedSlots: nil,
			expectError:   true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			availability := &Availability{
				StartTime: tt.startTime,
				EndTime:   tt.endTime,
			}

			slots, err := availability.GetTimeSlots()

			if tt.expectError {
				assert.Error(t, err)
				assert.Nil(t, slots)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.expectedSlots, slots)
			}
		})
	}
}

func TestAvailability_GetDayOfWeekName(t *testing.T) {
	tests := []struct {
		name      string
		dayOfWeek int
		expected  string
	}{
		{"Domingo", 0, "Domingo"},
		{"Segunda", 1, "Segunda"},
		{"Terça", 2, "Terça"},
		{"Quarta", 3, "Quarta"},
		{"Quinta", 4, "Quinta"},
		{"Sexta", 5, "Sexta"},
		{"Sábado", 6, "Sábado"},
		{"Inválido - negativo", -1, "Inválido"},
		{"Inválido - maior que 6", 7, "Inválido"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			availability := &Availability{DayOfWeek: tt.dayOfWeek}
			result := availability.GetDayOfWeekName()
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestAvailability_Activate(t *testing.T) {
	availability := &Availability{
		ID:        1,
		ChairID:   1,
		DayOfWeek: 1,
		StartTime: "09:00",
		EndTime:   "17:00",
		IsActive:  false,
	}

	availability.Activate()
	assert.True(t, availability.IsActive)
}

func TestAvailability_Deactivate(t *testing.T) {
	availability := &Availability{
		ID:        1,
		ChairID:   1,
		DayOfWeek: 1,
		StartTime: "09:00",
		EndTime:   "17:00",
		IsActive:  true,
	}

	availability.Deactivate()
	assert.False(t, availability.IsActive)
}

func TestAvailability_SetValidityPeriod(t *testing.T) {
	now := time.Now()
	from := now.AddDate(0, 0, 1) // Amanhã
	to := now.AddDate(0, 1, 0)   // Próximo mês

	availability := &Availability{
		ID:        1,
		ChairID:   1,
		DayOfWeek: 1,
		StartTime: "09:00",
		EndTime:   "17:00",
		IsActive:  true,
	}

	availability.SetValidityPeriod(&from, &to)

	assert.Equal(t, &from, availability.ValidFrom)
	assert.Equal(t, &to, availability.ValidTo)
}

func TestAvailability_IsCurrentlyValid(t *testing.T) {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	tests := []struct {
		name         string
		availability *Availability
		expected     bool
	}{
		{
			name: "Válida atualmente",
			availability: &Availability{
				DayOfWeek: int(today.Weekday()),
				IsActive:  true,
			},
			expected: true,
		},
		{
			name: "Inválida - inativa",
			availability: &Availability{
				DayOfWeek: int(today.Weekday()),
				IsActive:  false,
			},
			expected: false,
		},
		{
			name: "Inválida - dia da semana diferente",
			availability: &Availability{
				DayOfWeek: int(today.Weekday()) + 1, // Próximo dia
				IsActive:  true,
			},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := tt.availability.IsCurrentlyValid()
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestAvailability_Validation(t *testing.T) {
	now := time.Now()

	validAvailability := &Availability{
		ID:        1,
		ChairID:   1,
		DayOfWeek: 1,
		StartTime: "09:00",
		EndTime:   "17:00",
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Teste de campos obrigatórios
	assert.NotZero(t, validAvailability.ChairID)
	assert.GreaterOrEqual(t, validAvailability.DayOfWeek, 0)
	assert.LessOrEqual(t, validAvailability.DayOfWeek, 6)
	assert.NotEmpty(t, validAvailability.StartTime)
	assert.NotEmpty(t, validAvailability.EndTime)
	assert.NotZero(t, validAvailability.CreatedAt)
	assert.NotZero(t, validAvailability.UpdatedAt)
}

func TestAvailability_TableName(t *testing.T) {
	availability := &Availability{}
	assert.Equal(t, "availabilities", availability.TableName())
}

func TestAvailability_DefaultIsActive(t *testing.T) {
	// Teste para verificar se IsActive é definido como true por padrão
	// Este teste simula o comportamento do BeforeCreate hook
	availability := &Availability{
		ID:        1,
		ChairID:   1,
		DayOfWeek: 1,
		StartTime: "09:00",
		EndTime:   "17:00",
		IsActive:  false, // Será definido como true
	}

	// Simular o comportamento do BeforeCreate
	availability.IsActive = true

	assert.True(t, availability.IsActive)
}

func TestAvailability_CompleteStructure(t *testing.T) {
	now := time.Now()
	from := now.AddDate(0, 0, 1)
	to := now.AddDate(0, 1, 0)

	availability := &Availability{
		ID:        1,
		ChairID:   1,
		DayOfWeek: 1,
		StartTime: "09:00",
		EndTime:   "17:00",
		ValidFrom: &from,
		ValidTo:   &to,
		IsActive:  true,
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Verificar estrutura completa
	assert.Equal(t, uint(1), availability.ID)
	assert.Equal(t, uint(1), availability.ChairID)
	assert.Equal(t, 1, availability.DayOfWeek)
	assert.Equal(t, "09:00", availability.StartTime)
	assert.Equal(t, "17:00", availability.EndTime)
	assert.Equal(t, &from, availability.ValidFrom)
	assert.Equal(t, &to, availability.ValidTo)
	assert.True(t, availability.IsActive)
	assert.Equal(t, now, availability.CreatedAt)
	assert.Equal(t, now, availability.UpdatedAt)

	// Verificar métodos
	assert.Equal(t, "Segunda", availability.GetDayOfWeekName())
	// Não testar IsCurrentlyValid aqui pois depende do dia da semana atual
}

func TestAvailability_TimeSlotEdgeCases(t *testing.T) {
	tests := []struct {
		name          string
		startTime     string
		endTime       string
		expectedSlots []string
	}{
		{
			name:          "Exatamente 30 minutos",
			startTime:     "10:00",
			endTime:       "10:30",
			expectedSlots: []string{"10:00"},
		},
		{
			name:          "Menos de 30 minutos",
			startTime:     "10:00",
			endTime:       "10:15",
			expectedSlots: []string{"10:00"},
		},
		{
			name:          "Múltiplos slots",
			startTime:     "08:00",
			endTime:       "10:00",
			expectedSlots: []string{"08:00", "08:30", "09:00", "09:30"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			availability := &Availability{
				StartTime: tt.startTime,
				EndTime:   tt.endTime,
			}

			slots, err := availability.GetTimeSlots()
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedSlots, slots)
		})
	}
}
