package adapters

import (
	"testing"

	"agendamento-backend/internal/application/dtos"

	"github.com/stretchr/testify/assert"
)

func TestNewValidatorAdapter(t *testing.T) {
	adapter := NewValidatorAdapter()
	assert.NotNil(t, adapter)
}

func TestValidatorAdapter_ValidateStruct(t *testing.T) {
	adapter := NewValidatorAdapter()

	// Teste com struct válida
	validRequest := &dtos.CreateUserRequest{
		Name:          "João Silva",
		CPF:           "12345678909",
		Email:         "joao@example.com",
		Phone:         "11999999999",
		Password:      "123456",
		RequestedRole: "usuario",
		Gender:        "masculino",
	}

	err := adapter.ValidateStruct(validRequest)
	assert.NoError(t, err)

	// Teste com struct inválida (email inválido)
	invalidRequest := &dtos.CreateUserRequest{
		Name:          "João Silva",
		CPF:           "12345678909",
		Email:         "invalid-email",
		Phone:         "11999999999",
		Password:      "123456",
		RequestedRole: "usuario",
		Gender:        "masculino",
	}

	err = adapter.ValidateStruct(invalidRequest)
	assert.Error(t, err)
}

func TestValidatorAdapter_ValidateField(t *testing.T) {
	adapter := NewValidatorAdapter()

	// Teste com campo válido - criar uma struct simples para teste
	type TestStruct struct {
		Email string `validate:"email"`
	}

	validStruct := TestStruct{Email: "joao@example.com"}
	err := adapter.ValidateField(validStruct, "email")
	assert.NoError(t, err)

	// Teste com campo inválido
	invalidStruct := TestStruct{Email: "invalid-email"}
	err = adapter.ValidateField(invalidStruct, "email")
	assert.Error(t, err)
}
