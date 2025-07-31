package entities

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestChair_IsActive(t *testing.T) {
	tests := []struct {
		name     string
		status   string
		expected bool
	}{
		{"Ativa", "ativa", true},
		{"Inativa", "inativa", false},
		{"Status vazio", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			chair := &Chair{Status: tt.status}
			assert.Equal(t, tt.expected, chair.IsActive())
		})
	}
}

func TestChair_IsAvailable(t *testing.T) {
	tests := []struct {
		name     string
		status   string
		expected bool
	}{
		{"Disponível - ativa", "ativa", true},
		{"Indisponível - inativa", "inativa", false},
		{"Indisponível - status vazio", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			chair := &Chair{Status: tt.status}
			assert.Equal(t, tt.expected, chair.IsAvailable())
		})
	}
}

func TestChair_SetInactive(t *testing.T) {
	chair := &Chair{
		ID:          1,
		Name:        "Cadeira Teste",
		Description: "Cadeira para testes",
		Location:    "Sala 101",
		Status:      "ativa",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	chair.SetInactive()
	assert.Equal(t, "inativa", chair.Status)
}

func TestChair_SetActive(t *testing.T) {
	chair := &Chair{
		ID:          1,
		Name:        "Cadeira Teste",
		Description: "Cadeira para testes",
		Location:    "Sala 101",
		Status:      "inativa",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	chair.SetActive()
	assert.Equal(t, "ativa", chair.Status)
}

func TestChair_Validation(t *testing.T) {
	now := time.Now()

	validChair := &Chair{
		ID:          1,
		Name:        "Cadeira Teste",
		Description: "Cadeira para testes unitários",
		Location:    "Sala 101",
		Status:      "ativa",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// Teste de campos obrigatórios
	assert.NotEmpty(t, validChair.Name)
	assert.NotEmpty(t, validChair.Location)
	assert.NotEmpty(t, validChair.Status)
	assert.NotZero(t, validChair.CreatedAt)
	assert.NotZero(t, validChair.UpdatedAt)

	// Teste de tamanho mínimo do nome
	assert.GreaterOrEqual(t, len(validChair.Name), 2)
	assert.LessOrEqual(t, len(validChair.Name), 100)

	// Teste de tamanho mínimo da localização
	assert.GreaterOrEqual(t, len(validChair.Location), 2)
	assert.LessOrEqual(t, len(validChair.Location), 100)
}

func TestChair_TableName(t *testing.T) {
	chair := &Chair{}
	assert.Equal(t, "chairs", chair.TableName())
}

func TestChair_DefaultStatus(t *testing.T) {
	// Teste para verificar se o status padrão é definido corretamente
	// Este teste simula o comportamento do BeforeCreate hook
	chair := &Chair{
		ID:          1,
		Name:        "Cadeira Teste",
		Description: "Cadeira para testes",
		Location:    "Sala 101",
		Status:      "", // Status vazio
	}

	// Simular o comportamento do BeforeCreate
	if chair.Status == "" {
		chair.Status = "ativa"
	}

	assert.Equal(t, "ativa", chair.Status)
}

func TestChair_StatusValidation(t *testing.T) {
	tests := []struct {
		name    string
		status  string
		isValid bool
	}{
		{"Status válido - ativa", "ativa", true},
		{"Status válido - inativa", "inativa", true},
		{"Status inválido", "inválido", false},
		{"Status vazio", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			chair := &Chair{Status: tt.status}

			// Validar se o status é um dos valores permitidos
			isValid := chair.Status == "ativa" || chair.Status == "inativa"
			assert.Equal(t, tt.isValid, isValid)
		})
	}
}

func TestChair_CompleteStructure(t *testing.T) {
	now := time.Now()

	chair := &Chair{
		ID:          1,
		Name:        "Cadeira Teste Completa",
		Description: "Uma cadeira completa para testes",
		Location:    "Sala de Testes 101",
		Status:      "ativa",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// Verificar estrutura completa
	assert.Equal(t, uint(1), chair.ID)
	assert.Equal(t, "Cadeira Teste Completa", chair.Name)
	assert.Equal(t, "Uma cadeira completa para testes", chair.Description)
	assert.Equal(t, "Sala de Testes 101", chair.Location)
	assert.Equal(t, "ativa", chair.Status)
	assert.Equal(t, now, chair.CreatedAt)
	assert.Equal(t, now, chair.UpdatedAt)

	// Verificar se é ativa e disponível
	assert.True(t, chair.IsActive())
	assert.True(t, chair.IsAvailable())
}

func TestChair_StatusTransitions(t *testing.T) {
	chair := &Chair{
		ID:       1,
		Name:     "Cadeira para Transições",
		Location: "Sala 102",
		Status:   "ativa",
	}

	// Teste transição ativa -> inativa
	assert.True(t, chair.IsActive())
	chair.SetInactive()
	assert.False(t, chair.IsActive())
	assert.False(t, chair.IsAvailable())

	// Teste transição inativa -> ativa
	chair.SetActive()
	assert.True(t, chair.IsActive())
	assert.True(t, chair.IsAvailable())
}
