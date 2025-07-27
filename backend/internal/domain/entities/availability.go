package entities

import (
	"time"

	"gorm.io/gorm"
)

type Availability struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	ChairID   uint           `json:"chair_id" gorm:"not null" validate:"required"`
	DayOfWeek int            `json:"day_of_week" gorm:"not null" validate:"required,min=0,max=6"` // 0=Domingo, 6=Sábado
	StartTime string         `json:"start_time" gorm:"size:5;not null" validate:"required"`       // Formato HH:MM
	EndTime   string         `json:"end_time" gorm:"size:5;not null" validate:"required"`         // Formato HH:MM
	ValidFrom *time.Time     `json:"valid_from" gorm:"type:date"`
	ValidTo   *time.Time     `json:"valid_to" gorm:"type:date"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relacionamentos
	Chair Chair `json:"chair,omitempty" gorm:"foreignKey:ChairID"`
}

// TableName especifica o nome da tabela
func (Availability) TableName() string {
	return "availabilities"
}

// BeforeCreate hook executado antes de criar uma disponibilidade
func (a *Availability) BeforeCreate(tx *gorm.DB) error {
	a.IsActive = true
	return nil
}

// IsValidForDate verifica se a disponibilidade é válida para uma data específica
func (a *Availability) IsValidForDate(date time.Time) bool {
	if !a.IsActive {
		return false
	}

	// Verificar dia da semana
	if int(date.Weekday()) != a.DayOfWeek {
		return false
	}

	// Verificar período de validade
	if a.ValidFrom != nil && date.Before(*a.ValidFrom) {
		return false
	}

	if a.ValidTo != nil && date.After(*a.ValidTo) {
		return false
	}

	return true
}

// GetTimeSlots retorna os slots de tempo disponíveis (blocos de 30 minutos)
func (a *Availability) GetTimeSlots() ([]string, error) {
	startTime, err := time.Parse("15:04", a.StartTime)
	if err != nil {
		return nil, err
	}

	endTime, err := time.Parse("15:04", a.EndTime)
	if err != nil {
		return nil, err
	}

	var slots []string
	current := startTime

	for current.Before(endTime) {
		slots = append(slots, current.Format("15:04"))
		current = current.Add(30 * time.Minute)
	}

	return slots, nil
}

// GetDayOfWeekName retorna o nome do dia da semana
func (a *Availability) GetDayOfWeekName() string {
	days := []string{"Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"}
	if a.DayOfWeek >= 0 && a.DayOfWeek < len(days) {
		return days[a.DayOfWeek]
	}
	return "Inválido"
}

// Activate ativa a disponibilidade
func (a *Availability) Activate() {
	a.IsActive = true
}

// Deactivate desativa a disponibilidade
func (a *Availability) Deactivate() {
	a.IsActive = false
}

// SetValidityPeriod define o período de validade
func (a *Availability) SetValidityPeriod(from, to *time.Time) {
	a.ValidFrom = from
	a.ValidTo = to
}

// IsCurrentlyValid verifica se a disponibilidade é válida no momento atual
func (a *Availability) IsCurrentlyValid() bool {
	return a.IsValidForDate(time.Now())
}
