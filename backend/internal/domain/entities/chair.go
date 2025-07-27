package entities

import (
	"time"

	"gorm.io/gorm"
)

type Chair struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"size:100;not null" validate:"required,min=2,max=100"`
	Description string         `json:"description" gorm:"size:255"`
	Location    string         `json:"location" gorm:"size:100;not null" validate:"required,min=2,max=100"`
	Status      string         `json:"status" gorm:"size:20;default:'ativa'" validate:"oneof=ativa inativa"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relacionamentos
	Bookings       []Booking       `json:"bookings,omitempty" gorm:"foreignKey:ChairID"`
	Availabilities []Availability  `json:"availabilities,omitempty" gorm:"foreignKey:ChairID"`
}

// TableName especifica o nome da tabela
func (Chair) TableName() string {
	return "chairs"
}

// BeforeCreate hook executado antes de criar uma cadeira
func (c *Chair) BeforeCreate(tx *gorm.DB) error {
	if c.Status == "" {
		c.Status = "ativa"
	}
	return nil
}

// IsActive verifica se a cadeira está ativa
func (c *Chair) IsActive() bool {
	return c.Status == "ativa"
}

// IsAvailable verifica se a cadeira está disponível para agendamento
func (c *Chair) IsAvailable() bool {
	return c.Status == "ativa"
}

// SetInactive marca a cadeira como inativa
func (c *Chair) SetInactive() {
	c.Status = "inativa"
}

// SetActive marca a cadeira como ativa
func (c *Chair) SetActive() {
	c.Status = "ativa"
}
