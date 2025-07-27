package ports

import "time"

// TimeService define a interface para serviços de tempo
type TimeService interface {
	// Now retorna o tempo atual
	Now() time.Time

	// ParseTime parse uma string de tempo
	ParseTime(layout, value string) (time.Time, error)

	// FormatTime formata um tempo para string
	FormatTime(t time.Time, layout string) string

	// AddDuration adiciona uma duração ao tempo
	AddDuration(t time.Time, duration time.Duration) time.Time

	// IsWeekend verifica se é fim de semana
	IsWeekend(t time.Time) bool

	// IsBusinessDay verifica se é dia útil
	IsBusinessDay(t time.Time) bool
}
