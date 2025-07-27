package adapters

import (
	"time"
	"agendamento-backend/internal/domain/ports"
)

// TimeServiceAdapter implementa TimeService
type TimeServiceAdapter struct{}

// NewTimeServiceAdapter cria uma nova instância do TimeServiceAdapter
func NewTimeServiceAdapter() ports.TimeService {
	return &TimeServiceAdapter{}
}

// Now retorna o tempo atual
func (t *TimeServiceAdapter) Now() time.Time {
	return time.Now()
}

// ParseTime parse uma string de tempo
func (t *TimeServiceAdapter) ParseTime(layout, value string) (time.Time, error) {
	return time.Parse(layout, value)
}

// FormatTime formata um tempo para string
func (t *TimeServiceAdapter) FormatTime(time time.Time, layout string) string {
	return time.Format(layout)
}

// AddDuration adiciona uma duração ao tempo
func (t *TimeServiceAdapter) AddDuration(time time.Time, duration time.Duration) time.Time {
	return time.Add(duration)
}

// IsWeekend verifica se é fim de semana
func (t *TimeServiceAdapter) IsWeekend(time time.Time) bool {
	weekday := time.Weekday()
	return weekday == 6 || weekday == 0
}

// IsBusinessDay verifica se é dia útil
func (t *TimeServiceAdapter) IsBusinessDay(time time.Time) bool {
	return !t.IsWeekend(time)
}
