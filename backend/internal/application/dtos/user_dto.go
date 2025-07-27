package dtos

import "time"

// CreateUserRequest representa os dados para criar um usuário
type CreateUserRequest struct {
	Name          string     `json:"name" validate:"required,min=2,max=60"`
	CPF           string     `json:"cpf" validate:"required,cpf"`
	Email         string     `json:"email" validate:"required,email"`
	Phone         string     `json:"phone" validate:"required,min=10,max=20"`
	Password      string     `json:"password" validate:"required,min=6"`
	RequestedRole string     `json:"requested_role" validate:"oneof=usuario atendente admin"`
	Function      string     `json:"function"`
	Position      string     `json:"position"`
	Registration  string     `json:"registration"`
	Sector        string     `json:"sector"`
	Gender        string     `json:"gender" validate:"oneof=masculino feminino outro"`
	BirthDate     *time.Time `json:"birth_date"`
}

// CreateUserResponse representa a resposta da criação de usuário
type CreateUserResponse struct {
	ID            uint       `json:"id"`
	Name          string     `json:"name"`
	CPF           string     `json:"cpf"`
	Email         string     `json:"email"`
	Phone         string     `json:"phone"`
	Role          string     `json:"role"`
	RequestedRole string     `json:"requested_role"`
	Status        string     `json:"status"`
	Function      string     `json:"function"`
	Position      string     `json:"position"`
	Registration  string     `json:"registration"`
	Sector        string     `json:"sector"`
	Gender        string     `json:"gender"`
	BirthDate     *time.Time `json:"birth_date"`
	CreatedAt     time.Time  `json:"created_at"`
}

// UpdateUserRequest representa os dados para atualizar um usuário
type UpdateUserRequest struct {
	Name         string     `json:"name" validate:"required,min=2,max=60"`
	CPF          string     `json:"cpf" validate:"required,cpf"`
	Email        string     `json:"email" validate:"required,email"`
	Phone        string     `json:"phone" validate:"required,min=10,max=20"`
	Password     string     `json:"password,omitempty" validate:"omitempty,min=6"`
	Function     string     `json:"function"`
	Position     string     `json:"position"`
	Registration string     `json:"registration"`
	Sector       string     `json:"sector"`
	Gender       string     `json:"gender" validate:"oneof=masculino feminino outro"`
	BirthDate    *time.Time `json:"birth_date"`
}

// UserResponse representa a resposta de dados de usuário
type UserResponse struct {
	ID            uint       `json:"id"`
	Name          string     `json:"name"`
	CPF           string     `json:"cpf"`
	Email         string     `json:"email"`
	Phone         string     `json:"phone"`
	Role          string     `json:"role"`
	RequestedRole string     `json:"requested_role"`
	Status        string     `json:"status"`
	Function      string     `json:"function"`
	Position      string     `json:"position"`
	Registration  string     `json:"registration"`
	Sector        string     `json:"sector"`
	Gender        string     `json:"gender"`
	BirthDate     *time.Time `json:"birth_date"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	LastLogin     *time.Time `json:"last_login"`
}

// ListUsersRequest representa os filtros para listar usuários
type ListUsersRequest struct {
	Limit   int                    `json:"limit" validate:"min=1,max=100"`
	Offset  int                    `json:"offset" validate:"min=0"`
	Filters map[string]interface{} `json:"filters"`
}

// ListUsersResponse representa a resposta da listagem de usuários
type ListUsersResponse struct {
	Users  []UserResponse `json:"users"`
	Total  int64          `json:"total"`
	Limit  int            `json:"limit"`
	Offset int            `json:"offset"`
}

// ApproveUserRequest representa os dados para aprovar um usuário
type ApproveUserRequest struct {
	Reason string `json:"reason,omitempty"`
}

// RejectUserRequest representa os dados para rejeitar um usuário
type RejectUserRequest struct {
	Reason string `json:"reason" validate:"required,min=5"`
}

// LoginRequest representa os dados de login
type LoginRequest struct {
	CPF      string `json:"cpf" validate:"required,cpf"`
	Password string `json:"password" validate:"required,min=6"`
}

// LoginResponse representa a resposta do login
type LoginResponse struct {
	Token     string       `json:"token"`
	User      UserResponse `json:"user"`
	ExpiresAt time.Time    `json:"expires_at"`
}
