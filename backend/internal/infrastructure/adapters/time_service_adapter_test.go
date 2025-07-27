package adapters

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestNewTimeServiceAdapter(t *testing.T) {
	adapter := NewTimeServiceAdapter()
	assert.NotNil(t, adapter)
}

func TestTimeServiceAdapter_Now(t *testing.T) {
	adapter := NewTimeServiceAdapter()

	now := adapter.Now()

	assert.NotZero(t, now)
	assert.True(t, time.Since(now) < time.Second) // Deve ser muito recente
}

func TestTimeServiceAdapter_ParseTime(t *testing.T) {
	adapter := NewTimeServiceAdapter()

	// Teste com formato válido
	layout := "2006-01-02 15:04:05"
	timeStr := "2023-12-25 14:30:00"

	parsedTime, err := adapter.ParseTime(layout, timeStr)

	assert.NoError(t, err)
	assert.Equal(t, 2023, parsedTime.Year())
	assert.Equal(t, time.December, parsedTime.Month())
	assert.Equal(t, 25, parsedTime.Day())
	assert.Equal(t, 14, parsedTime.Hour())
	assert.Equal(t, 30, parsedTime.Minute())

	// Teste com formato inválido
	_, err = adapter.ParseTime(layout, "invalid-time")
	assert.Error(t, err)
}

func TestTimeServiceAdapter_FormatTime(t *testing.T) {
	adapter := NewTimeServiceAdapter()

	layout := "2006-01-02 15:04:05"
	testTime := time.Date(2023, 12, 25, 14, 30, 0, 0, time.UTC)

	formatted := adapter.FormatTime(testTime, layout)

	assert.Equal(t, "2023-12-25 14:30:00", formatted)
}

func TestTimeServiceAdapter_AddDuration(t *testing.T) {
	adapter := NewTimeServiceAdapter()

	baseTime := time.Date(2023, 12, 25, 14, 30, 0, 0, time.UTC)
	duration := 2 * time.Hour

	result := adapter.AddDuration(baseTime, duration)

	expected := baseTime.Add(duration)
	assert.Equal(t, expected, result)
	assert.Equal(t, 16, result.Hour()) // 14 + 2 = 16
}

func TestTimeServiceAdapter_IsWeekend(t *testing.T) {
	adapter := NewTimeServiceAdapter()

	// Teste com sábado
	saturday := time.Date(2023, 12, 23, 14, 30, 0, 0, time.UTC) // Sábado
	assert.True(t, adapter.IsWeekend(saturday))

	// Teste com domingo
	sunday := time.Date(2023, 12, 24, 14, 30, 0, 0, time.UTC) // Domingo
	assert.True(t, adapter.IsWeekend(sunday))

	// Teste com segunda-feira
	monday := time.Date(2023, 12, 25, 14, 30, 0, 0, time.UTC) // Segunda
	assert.False(t, adapter.IsWeekend(monday))

	// Teste com sexta-feira
	friday := time.Date(2023, 12, 22, 14, 30, 0, 0, time.UTC) // Sexta
	assert.False(t, adapter.IsWeekend(friday))
}

func TestTimeServiceAdapter_IsBusinessDay(t *testing.T) {
	adapter := NewTimeServiceAdapter()

	// Teste com sábado (não é dia útil)
	saturday := time.Date(2023, 12, 23, 14, 30, 0, 0, time.UTC) // Sábado
	assert.False(t, adapter.IsBusinessDay(saturday))

	// Teste com domingo (não é dia útil)
	sunday := time.Date(2023, 12, 24, 14, 30, 0, 0, time.UTC) // Domingo
	assert.False(t, adapter.IsBusinessDay(sunday))

	// Teste com segunda-feira (é dia útil)
	monday := time.Date(2023, 12, 25, 14, 30, 0, 0, time.UTC) // Segunda
	assert.True(t, adapter.IsBusinessDay(monday))

	// Teste com sexta-feira (é dia útil)
	friday := time.Date(2023, 12, 22, 14, 30, 0, 0, time.UTC) // Sexta
	assert.True(t, adapter.IsBusinessDay(friday))
}

func TestTimeServiceAdapter_Integration(t *testing.T) {
	adapter := NewTimeServiceAdapter()

	// Teste integrado: criar tempo, adicionar duração, verificar se é dia útil
	baseTime := time.Date(2023, 12, 25, 14, 30, 0, 0, time.UTC) // Segunda-feira
	duration := 24 * time.Hour                                  // 1 dia

	result := adapter.AddDuration(baseTime, duration)

	// Deve ser terça-feira
	assert.True(t, adapter.IsBusinessDay(result))
	assert.False(t, adapter.IsWeekend(result))

	// Formatar o resultado
	formatted := adapter.FormatTime(result, "2006-01-02")
	assert.Equal(t, "2023-12-26", formatted)
}
