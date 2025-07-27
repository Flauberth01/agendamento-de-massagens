package models

import (
	"time"

	"agendamento-backend/internal/domain/entities"

	"gorm.io/gorm"
)

// UserModel representa o modelo de persistência do usuário
type UserModel struct {
	ID            uint       `gorm:"primaryKey"`
	Name          string     `gorm:"size:60;not null"`
	CPF           string     `gorm:"size:15;unique;not null"`
	Email         string     `gorm:"size:100;unique;not null"`
	Phone         string     `gorm:"size:20;unique"`
	Password      string     `gorm:"size:255;not null"`
	Role          string     `gorm:"size:20;default:'usuario'"`
	RequestedRole string     `gorm:"size:20;default:'usuario'"`
	Status        string     `gorm:"size:20;default:'pendente'"`
	Function      string     `gorm:"size:50"`
	Position      string     `gorm:"size:50"`
	Registration  string     `gorm:"size:50"`
	Sector        string     `gorm:"size:50"`
	Gender        string     `gorm:"size:15"`
	BirthDate     *time.Time `gorm:"type:date"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
	DeletedAt     gorm.DeletedAt `gorm:"index"`
	LastLogin     *time.Time
}

// TableName especifica o nome da tabela
func (UserModel) TableName() string {
	return "users"
}

// BeforeCreate hook executado antes de criar um usuário
func (u *UserModel) BeforeCreate(tx *gorm.DB) error {
	if u.Role == "" {
		u.Role = "usuario"
	}
	if u.RequestedRole == "" {
		u.RequestedRole = "usuario"
	}
	if u.Status == "" {
		u.Status = "pendente"
	}
	return nil
}

// ToEntity converte o modelo para entidade de domínio
func (u *UserModel) ToEntity() *entities.User {
	return &entities.User{
		ID:            u.ID,
		Name:          u.Name,
		CPF:           u.CPF,
		Email:         u.Email,
		Phone:         u.Phone,
		Password:      u.Password,
		Role:          u.Role,
		RequestedRole: u.RequestedRole,
		Status:        u.Status,
		Function:      u.Function,
		Position:      u.Position,
		Registration:  u.Registration,
		Sector:        u.Sector,
		Gender:        u.Gender,
		BirthDate:     u.BirthDate,
		CreatedAt:     u.CreatedAt,
		UpdatedAt:     u.UpdatedAt,
		DeletedAt:     &u.DeletedAt.Time,
		LastLogin:     u.LastLogin,
	}
}

// FromEntity converte a entidade de domínio para modelo
func (u *UserModel) FromEntity(entity *entities.User) {
	u.ID = entity.ID
	u.Name = entity.Name
	u.CPF = entity.CPF
	u.Email = entity.Email
	u.Phone = entity.Phone
	u.Password = entity.Password
	u.Role = entity.Role
	u.RequestedRole = entity.RequestedRole
	u.Status = entity.Status
	u.Function = entity.Function
	u.Position = entity.Position
	u.Registration = entity.Registration
	u.Sector = entity.Sector
	u.Gender = entity.Gender
	u.BirthDate = entity.BirthDate
	u.CreatedAt = entity.CreatedAt
	u.UpdatedAt = entity.UpdatedAt
	if entity.DeletedAt != nil {
		u.DeletedAt.Time = *entity.DeletedAt
	}
	u.LastLogin = entity.LastLogin
}
