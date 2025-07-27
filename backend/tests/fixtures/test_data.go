package fixtures

import (
	"time"

	"agendamento-backend/internal/application/dtos"
	"agendamento-backend/internal/domain/entities"
)

// TestData contém dados de teste reutilizáveis
type TestData struct{}

// NewTestData cria uma nova instância de TestData
func NewTestData() *TestData {
	return &TestData{}
}

// ValidCreateUserRequest retorna um CreateUserRequest válido
func (td *TestData) ValidCreateUserRequest() *dtos.CreateUserRequest {
	return &dtos.CreateUserRequest{
		Name:          "João Silva",
		CPF:           "12345678909",
		Email:         "joao@example.com",
		Phone:         "11999999999",
		Password:      "123456",
		RequestedRole: "usuario",
		Function:      "Desenvolvedor",
		Position:      "Junior",
		Registration:  "12345",
		Sector:        "TI",
		Gender:        "masculino",
	}
}

// InvalidCreateUserRequest retorna um CreateUserRequest inválido
func (td *TestData) InvalidCreateUserRequest() *dtos.CreateUserRequest {
	return &dtos.CreateUserRequest{
		Name:          "João Silva",
		CPF:           "123",
		Email:         "invalid-email",
		Phone:         "11999999999",
		Password:      "123456",
		RequestedRole: "usuario",
		Gender:        "masculino",
	}
}

// ValidUpdateUserRequest retorna um UpdateUserRequest válido
func (td *TestData) ValidUpdateUserRequest() *dtos.UpdateUserRequest {
	return &dtos.UpdateUserRequest{
		Name:         "João Silva Atualizado",
		CPF:          "12345678909",
		Email:        "joao.novo@example.com",
		Phone:        "11988888888",
		Password:     "nova123456",
		Function:     "Desenvolvedor Senior",
		Position:     "Pleno",
		Registration: "54321",
		Sector:       "Desenvolvimento",
		Gender:       "masculino",
	}
}

// ValidUser retorna uma entidade User válida
func (td *TestData) ValidUser() *entities.User {
	now := time.Now()
	return &entities.User{
		ID:            1,
		Name:          "João Silva",
		CPF:           "12345678909",
		Email:         "joao@example.com",
		Phone:         "11999999999",
		Role:          "usuario",
		RequestedRole: "usuario",
		Status:        "aprovado",
		Function:      "Desenvolvedor",
		Position:      "Junior",
		Registration:  "12345",
		Sector:        "TI",
		Gender:        "masculino",
		CreatedAt:     now,
		UpdatedAt:     now,
		LastLogin:     &now,
	}
}

// AdminUser retorna um usuário admin
func (td *TestData) AdminUser() *entities.User {
	user := td.ValidUser()
	user.ID = 2
	user.Name = "Admin User"
	user.Email = "admin@example.com"
	user.Role = "admin"
	user.RequestedRole = "admin"
	return user
}

// AttendantUser retorna um usuário atendente
func (td *TestData) AttendantUser() *entities.User {
	user := td.ValidUser()
	user.ID = 3
	user.Name = "Attendant User"
	user.Email = "atendente@example.com"
	user.Role = "atendente"
	user.RequestedRole = "atendente"
	return user
}

// PendingUser retorna um usuário pendente
func (td *TestData) PendingUser() *entities.User {
	user := td.ValidUser()
	user.ID = 4
	user.Name = "Pending User"
	user.Email = "pending@example.com"
	user.Status = "pendente"
	return user
}

// UserList retorna uma lista de usuários para testes
func (td *TestData) UserList() []*entities.User {
	return []*entities.User{
		td.ValidUser(),
		td.AdminUser(),
		td.AttendantUser(),
		td.PendingUser(),
	}
}

// ValidLoginRequest retorna um LoginRequest válido
func (td *TestData) ValidLoginRequest() *dtos.LoginRequest {
	return &dtos.LoginRequest{
		CPF:      "12345678909",
		Password: "123456",
	}
}

// InvalidLoginRequest retorna um LoginRequest inválido
func (td *TestData) InvalidLoginRequest() *dtos.LoginRequest {
	return &dtos.LoginRequest{
		CPF:      "123",
		Password: "",
	}
}
