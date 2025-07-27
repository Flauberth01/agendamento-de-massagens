package entities

import (
	"time"
)

type User struct {
	ID            uint       `json:"id"`
	Name          string     `json:"name" validate:"required,min=2,max=60"`
	CPF           string     `json:"cpf" validate:"required,cpf"`
	Email         string     `json:"email" validate:"required,email"`
	Phone         string     `json:"phone" validate:"required,min=10,max=20"`
	Password      string     `json:"-" validate:"required,min=6"`
	Role          string     `json:"role" validate:"oneof=usuario atendente admin"`
	RequestedRole string     `json:"requested_role" validate:"oneof=usuario atendente admin"`
	Status        string     `json:"status" validate:"oneof=pendente aprovado reprovado"`
	Function      string     `json:"function"`
	Position      string     `json:"position"`
	Registration  string     `json:"registration"`
	Sector        string     `json:"sector"`
	Gender        string     `json:"gender" validate:"oneof=masculino feminino outro"`
	BirthDate     *time.Time `json:"birth_date"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	DeletedAt     *time.Time `json:"-"`
	LastLogin     *time.Time `json:"last_login"`

	// Relacionamentos
	Bookings []Booking `json:"bookings,omitempty"`
}

// IsAdmin verifica se o usuário é admin
func (u *User) IsAdmin() bool {
	return u.Role == "admin"
}

// IsAttendant verifica se o usuário é atendente
func (u *User) IsAttendant() bool {
	return u.Role == "atendente"
}

// IsUser verifica se o usuário é usuário comum
func (u *User) IsUser() bool {
	return u.Role == "usuario"
}

// CanManageUsers verifica se pode gerenciar usuários
func (u *User) CanManageUsers() bool {
	return u.IsAdmin() || u.IsAttendant()
}

// CanManageChairs verifica se pode gerenciar cadeiras
func (u *User) CanManageChairs() bool {
	return u.IsAdmin()
}

// IsActive verifica se o usuário está ativo
func (u *User) IsActive() bool {
	return u.Status == "aprovado"
}

// IsApproved verifica se o usuário está aprovado
func (u *User) IsApproved() bool {
	return u.Status == "aprovado"
}

// SetDefaultValues define valores padrão para campos obrigatórios
func (u *User) SetDefaultValues() {
	if u.Role == "" {
		u.Role = "usuario"
	}
	if u.RequestedRole == "" {
		u.RequestedRole = "usuario"
	}
	if u.Status == "" {
		u.Status = "pendente"
	}
}
