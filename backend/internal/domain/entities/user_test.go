package entities

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestUser_IsAdmin(t *testing.T) {
	tests := []struct {
		name     string
		role     string
		expected bool
	}{
		{"Admin user", "admin", true},
		{"Regular user", "usuario", false},
		{"Attendant user", "atendente", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := &User{Role: tt.role}
			assert.Equal(t, tt.expected, user.IsAdmin())
		})
	}
}

func TestUser_IsAttendant(t *testing.T) {
	tests := []struct {
		name     string
		role     string
		expected bool
	}{
		{"Attendant user", "atendente", true},
		{"Admin user", "admin", false},
		{"Regular user", "usuario", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := &User{Role: tt.role}
			assert.Equal(t, tt.expected, user.IsAttendant())
		})
	}
}

func TestUser_IsUser(t *testing.T) {
	tests := []struct {
		name     string
		role     string
		expected bool
	}{
		{"Regular user", "usuario", true},
		{"Admin user", "admin", false},
		{"Attendant user", "atendente", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := &User{Role: tt.role}
			assert.Equal(t, tt.expected, user.IsUser())
		})
	}
}

func TestUser_CanManageUsers(t *testing.T) {
	tests := []struct {
		name     string
		role     string
		expected bool
	}{
		{"Admin user", "admin", true},
		{"Attendant user", "atendente", true},
		{"Regular user", "usuario", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := &User{Role: tt.role}
			assert.Equal(t, tt.expected, user.CanManageUsers())
		})
	}
}

func TestUser_CanManageChairs(t *testing.T) {
	tests := []struct {
		name     string
		role     string
		expected bool
	}{
		{"Admin user", "admin", true},
		{"Attendant user", "atendente", false},
		{"Regular user", "usuario", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := &User{Role: tt.role}
			assert.Equal(t, tt.expected, user.CanManageChairs())
		})
	}
}

func TestUser_IsActive(t *testing.T) {
	tests := []struct {
		name     string
		status   string
		expected bool
	}{
		{"Approved user", "aprovado", true},
		{"Pending user", "pendente", false},
		{"Rejected user", "reprovado", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := &User{Status: tt.status}
			assert.Equal(t, tt.expected, user.IsActive())
		})
	}
}

func TestUser_IsApproved(t *testing.T) {
	tests := []struct {
		name     string
		status   string
		expected bool
	}{
		{"Approved user", "aprovado", true},
		{"Pending user", "pendente", false},
		{"Rejected user", "reprovado", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := &User{Status: tt.status}
			assert.Equal(t, tt.expected, user.IsApproved())
		})
	}
}

func TestUser_SetDefaultValues(t *testing.T) {
	tests := []struct {
		name           string
		initialUser    *User
		expectedRole   string
		expectedStatus string
	}{
		{
			name:           "Empty user",
			initialUser:    &User{},
			expectedRole:   "usuario",
			expectedStatus: "pendente",
		},
		{
			name:           "User with role",
			initialUser:    &User{Role: "admin"},
			expectedRole:   "admin",
			expectedStatus: "pendente",
		},
		{
			name:           "User with status",
			initialUser:    &User{Status: "aprovado"},
			expectedRole:   "usuario",
			expectedStatus: "aprovado",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user := tt.initialUser
			user.SetDefaultValues()

			assert.Equal(t, tt.expectedRole, user.Role)
			assert.Equal(t, tt.expectedStatus, user.Status)
		})
	}
}

func TestUser_Validation(t *testing.T) {
	now := time.Now()

	validUser := &User{
		Name:          "João Silva",
		CPF:           "12345678909",
		Email:         "joao@example.com",
		Phone:         "11999999999",
		Password:      "123456",
		Role:          "usuario",
		RequestedRole: "usuario",
		Status:        "aprovado",
		Gender:        "masculino",
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	// Teste de campos obrigatórios
	assert.NotEmpty(t, validUser.Name)
	assert.NotEmpty(t, validUser.CPF)
	assert.NotEmpty(t, validUser.Email)
	assert.NotEmpty(t, validUser.Phone)
	assert.NotEmpty(t, validUser.Password)
	assert.NotEmpty(t, validUser.Role)
	assert.NotEmpty(t, validUser.Gender)
	assert.NotZero(t, validUser.CreatedAt)
	assert.NotZero(t, validUser.UpdatedAt)
}
