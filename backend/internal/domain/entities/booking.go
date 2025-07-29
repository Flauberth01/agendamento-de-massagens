package entities

import (
	"time"

	"gorm.io/gorm"
)

type Booking struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	UserID    uint           `json:"user_id" gorm:"not null" validate:"required"`
	ChairID   uint           `json:"chair_id" gorm:"not null" validate:"required"`
	StartTime time.Time      `json:"start_time" gorm:"not null" validate:"required"`
	EndTime   time.Time      `json:"end_time" gorm:"not null" validate:"required"`
	Status    string         `json:"status" gorm:"size:20;default:'agendado'" validate:"oneof=agendado presenca_confirmada cancelado realizado falta"`
	Notes     string         `json:"notes" gorm:"size:500"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`

	// Relacionamentos
	User  User  `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Chair Chair `json:"chair,omitempty" gorm:"foreignKey:ChairID"`
}

// TableName especifica o nome da tabela
func (Booking) TableName() string {
	return "bookings"
}

// BeforeCreate hook executado antes de criar um agendamento
func (b *Booking) BeforeCreate(tx *gorm.DB) error {
	if b.Status == "" {
		b.Status = "agendado"
	}

	// Garantir que a sessão seja de 30 minutos
	if !b.EndTime.IsZero() && !b.StartTime.IsZero() {
		duration := b.EndTime.Sub(b.StartTime)
		if duration != 30*time.Minute {
			b.EndTime = b.StartTime.Add(30 * time.Minute)
		}
	}

	return nil
}

// BeforeUpdate hook executado antes de atualizar um agendamento
func (b *Booking) BeforeUpdate(tx *gorm.DB) error {
	// Garantir que a sessão seja de 30 minutos
	if !b.EndTime.IsZero() && !b.StartTime.IsZero() {
		duration := b.EndTime.Sub(b.StartTime)
		if duration != 30*time.Minute {
			b.EndTime = b.StartTime.Add(30 * time.Minute)
		}
	}
	return nil
}

// IsActive verifica se o agendamento está ativo
func (b *Booking) IsActive() bool {
	return b.Status == "agendado" || b.Status == "presenca_confirmada"
}

// IsCancelled verifica se o agendamento foi cancelado
func (b *Booking) IsCancelled() bool {
	return b.Status == "cancelado"
}

// IsCompleted verifica se o agendamento foi concluído
func (b *Booking) IsCompleted() bool {
	return b.Status == "realizado"
}

// IsPresenceConfirmed verifica se a presença foi confirmada
func (b *Booking) IsPresenceConfirmed() bool {
	return b.Status == "presenca_confirmada"
}

// CanBeCancelled verifica se o agendamento pode ser cancelado
func (b *Booking) CanBeCancelled() bool {
	// Pode ser cancelado até 3 horas antes do horário
	minCancelTime := time.Now().Add(3 * time.Hour)
	return b.IsActive() && b.StartTime.After(minCancelTime)
}

// Cancel cancela o agendamento
func (b *Booking) Cancel() {
	b.Status = "cancelado"
}

// ConfirmPresence marca a presença como confirmada
func (b *Booking) ConfirmPresence() {
	b.Status = "presenca_confirmada"
}

// Complete marca o agendamento como concluído
func (b *Booking) Complete() {
	b.Status = "realizado"
}

// MarkAsNoShow marca como falta
func (b *Booking) MarkAsNoShow() {
	b.Status = "falta"
}

// GetDuration retorna a duração da sessão
func (b *Booking) GetDuration() time.Duration {
	return b.EndTime.Sub(b.StartTime)
}

// IsToday verifica se o agendamento é para hoje
func (b *Booking) IsToday() bool {
	now := time.Now()
	return b.StartTime.Year() == now.Year() &&
		b.StartTime.Month() == now.Month() &&
		b.StartTime.Day() == now.Day()
}

// IsPast verifica se o agendamento já passou
func (b *Booking) IsPast() bool {
	return b.EndTime.Before(time.Now())
}

// IsFuture verifica se o agendamento é futuro
func (b *Booking) IsFuture() bool {
	return b.StartTime.After(time.Now())
}
