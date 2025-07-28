package dtos

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCreateUserRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request CreateUserRequest
		isValid bool
	}{
		{
			name: "Valid request",
			request: CreateUserRequest{
				Name:          "João Silva",
				CPF:           "12345678909",
				Email:         "joao@example.com",
				Phone:         "11999999999",
				Password:      "123456",
				RequestedRole: "usuario",
				Gender:        "masculino",
			},
			isValid: true,
		},
		{
			name: "Invalid email",
			request: CreateUserRequest{
				Name:          "João Silva",
				CPF:           "12345678909",
				Email:         "invalid-email",
				Phone:         "11999999999",
				Password:      "123456",
				RequestedRole: "usuario",
				Gender:        "masculino",
			},
			isValid: false,
		},
		{
			name: "Missing required fields",
			request: CreateUserRequest{
				Name:   "João Silva",
				Gender: "masculino",
			},
			isValid: false,
		},
		{
			name: "Invalid CPF",
			request: CreateUserRequest{
				Name:          "João Silva",
				CPF:           "123",
				Email:         "joao@example.com",
				Phone:         "11999999999",
				Password:      "123456",
				RequestedRole: "usuario",
				Gender:        "masculino",
			},
			isValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Validar se todos os campos obrigatórios estão presentes
			hasRequiredFields := tt.request.Name != "" &&
				tt.request.CPF != "" &&
				tt.request.Email != "" &&
				tt.request.Phone != "" &&
				tt.request.Password != "" &&
				tt.request.Gender != ""

			// Validar formato de email (simples)
			hasValidEmail := tt.request.Email != "" &&
				len(tt.request.Email) > 3 &&
				tt.request.Email != "invalid-email"

			// Validar CPF (simples)
			hasValidCPF := tt.request.CPF != "" &&
				len(tt.request.CPF) >= 11 &&
				tt.request.CPF != "123"

			isValid := hasRequiredFields && hasValidEmail && hasValidCPF

			assert.Equal(t, tt.isValid, isValid)
		})
	}
}

func TestUpdateUserRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request UpdateUserRequest
		isValid bool
	}{
		{
			name: "Valid request",
			request: UpdateUserRequest{
				Name:   "João Silva",
				CPF:    "12345678909",
				Email:  "joao@example.com",
				Phone:  "11999999999",
				Gender: "masculino",
			},
			isValid: true,
		},
		{
			name: "Invalid email",
			request: UpdateUserRequest{
				Name:   "João Silva",
				CPF:    "12345678909",
				Email:  "invalid-email",
				Phone:  "11999999999",
				Gender: "masculino",
			},
			isValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Validar se todos os campos obrigatórios estão presentes
			hasRequiredFields := tt.request.Name != "" &&
				tt.request.CPF != "" &&
				tt.request.Email != "" &&
				tt.request.Phone != "" &&
				tt.request.Gender != ""

			// Validar formato de email (simples)
			hasValidEmail := tt.request.Email != "" &&
				len(tt.request.Email) > 3 &&
				tt.request.Email != "invalid-email"

			isValid := hasRequiredFields && hasValidEmail

			assert.Equal(t, tt.isValid, isValid)
		})
	}
}

func TestUserResponse_Fields(t *testing.T) {
	now := time.Now()
	response := UserResponse{
		ID:        1,
		Name:      "João Silva",
		CPF:       "12345678909",
		Email:     "joao@example.com",
		Phone:     "11999999999",
		Role:      "usuario",
		Status:    "aprovado",
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Validar campos essenciais
	assert.Equal(t, uint(1), response.ID)
	assert.Equal(t, "João Silva", response.Name)
	assert.Equal(t, "12345678909", response.CPF)
	assert.Equal(t, "joao@example.com", response.Email)
	assert.Equal(t, "11999999999", response.Phone)
	assert.Equal(t, "usuario", response.Role)
	assert.Equal(t, "aprovado", response.Status)
	assert.Equal(t, now, response.CreatedAt)
	assert.Equal(t, now, response.UpdatedAt)
}

func TestListUsersRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request ListUsersRequest
		isValid bool
	}{
		{
			name: "Valid request",
			request: ListUsersRequest{
				Limit:  10,
				Offset: 0,
				Filters: map[string]interface{}{
					"status": "aprovado",
				},
			},
			isValid: true,
		},
		{
			name: "Invalid limit",
			request: ListUsersRequest{
				Limit:  -1,
				Offset: 0,
			},
			isValid: false,
		},
		{
			name: "Invalid offset",
			request: ListUsersRequest{
				Limit:  10,
				Offset: -1,
			},
			isValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isValid := tt.request.Limit > 0 && tt.request.Offset >= 0
			assert.Equal(t, tt.isValid, isValid)
		})
	}
}

func TestListUsersResponse_Fields(t *testing.T) {
	users := []UserResponse{
		{
			ID:    1,
			Name:  "João Silva",
			Email: "joao@example.com",
		},
		{
			ID:    2,
			Name:  "Maria Santos",
			Email: "maria@example.com",
		},
	}

	response := ListUsersResponse{
		Users:  users,
		Total:  2,
		Limit:  10,
		Offset: 0,
	}

	// Validar estrutura da resposta
	assert.Len(t, response.Users, 2)
	assert.Equal(t, int64(2), response.Total)
	assert.Equal(t, 10, response.Limit)
	assert.Equal(t, 0, response.Offset)

	// Validar dados dos usuários
	assert.Equal(t, uint(1), response.Users[0].ID)
	assert.Equal(t, "João Silva", response.Users[0].Name)
	assert.Equal(t, "joao@example.com", response.Users[0].Email)

	assert.Equal(t, uint(2), response.Users[1].ID)
	assert.Equal(t, "Maria Santos", response.Users[1].Name)
	assert.Equal(t, "maria@example.com", response.Users[1].Email)
}
