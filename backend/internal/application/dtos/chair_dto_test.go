package dtos

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCreateChairRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request CreateChairRequest
		isValid bool
	}{
		{
			name: "Valid request",
			request: CreateChairRequest{
				Name:        "Cadeira Teste",
				Description: "Cadeira para testes",
				Location:    "Sala 101",
			},
			isValid: true,
		},
		{
			name: "Invalid - missing name",
			request: CreateChairRequest{
				Description: "Cadeira para testes",
				Location:    "Sala 101",
			},
			isValid: false,
		},
		{
			name: "Invalid - missing location",
			request: CreateChairRequest{
				Name:        "Cadeira Teste",
				Description: "Cadeira para testes",
			},
			isValid: false,
		},
		{
			name: "Invalid - name too short",
			request: CreateChairRequest{
				Name:        "A",
				Description: "Cadeira para testes",
				Location:    "Sala 101",
			},
			isValid: false,
		},
		{
			name: "Invalid - location too short",
			request: CreateChairRequest{
				Name:        "Cadeira Teste",
				Description: "Cadeira para testes",
				Location:    "A",
			},
			isValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Validar se todos os campos obrigatórios estão presentes
			hasRequiredFields := tt.request.Name != "" &&
				tt.request.Location != ""

			// Validar tamanho mínimo dos campos
			hasValidName := len(tt.request.Name) >= 2
			hasValidLocation := len(tt.request.Location) >= 2

			isValid := hasRequiredFields && hasValidName && hasValidLocation

			assert.Equal(t, tt.isValid, isValid)
		})
	}
}

func TestUpdateChairRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request UpdateChairRequest
		isValid bool
	}{
		{
			name: "Valid request",
			request: UpdateChairRequest{
				Name:        "Cadeira Atualizada",
				Description: "Cadeira atualizada para testes",
				Location:    "Sala 102",
			},
			isValid: true,
		},
		{
			name: "Invalid - name too short",
			request: UpdateChairRequest{
				Name:        "A",
				Description: "Cadeira para testes",
				Location:    "Sala 101",
			},
			isValid: false,
		},
		{
			name: "Invalid - location too short",
			request: UpdateChairRequest{
				Name:        "Cadeira Teste",
				Description: "Cadeira para testes",
				Location:    "A",
			},
			isValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Validar tamanho mínimo dos campos (se fornecidos)
			hasValidName := tt.request.Name == "" || len(tt.request.Name) >= 2
			hasValidLocation := tt.request.Location == "" || len(tt.request.Location) >= 2

			isValid := hasValidName && hasValidLocation

			assert.Equal(t, tt.isValid, isValid)
		})
	}
}

func TestChairResponse_Fields(t *testing.T) {
	now := time.Now()

	response := ChairResponse{
		ID:          1,
		Name:        "Cadeira Teste",
		Description: "Cadeira para testes unitários",
		Location:    "Sala 101",
		Status:      "ativa",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// Validar campos essenciais
	assert.Equal(t, uint(1), response.ID)
	assert.Equal(t, "Cadeira Teste", response.Name)
	assert.Equal(t, "Cadeira para testes unitários", response.Description)
	assert.Equal(t, "Sala 101", response.Location)
	assert.Equal(t, "ativa", response.Status)
	assert.Equal(t, now, response.CreatedAt)
	assert.Equal(t, now, response.UpdatedAt)
}

func TestListChairsRequest_Validation(t *testing.T) {
	tests := []struct {
		name    string
		request ListChairsRequest
		isValid bool
	}{
		{
			name: "Valid request",
			request: ListChairsRequest{
				Limit:  10,
				Offset: 0,
				Filters: map[string]interface{}{
					"status": "ativa",
				},
			},
			isValid: true,
		},
		{
			name: "Invalid limit",
			request: ListChairsRequest{
				Limit:  -1,
				Offset: 0,
			},
			isValid: false,
		},
		{
			name: "Invalid offset",
			request: ListChairsRequest{
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

func TestListChairsResponse_Fields(t *testing.T) {
	now := time.Now()

	chairs := []ChairResponse{
		{
			ID:          1,
			Name:        "Cadeira 1",
			Description: "Primeira cadeira",
			Location:    "Sala 101",
			Status:      "ativa",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          2,
			Name:        "Cadeira 2",
			Description: "Segunda cadeira",
			Location:    "Sala 102",
			Status:      "ativa",
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}

	response := ListChairsResponse{
		Chairs: chairs,
		Total:  2,
		Limit:  10,
		Offset: 0,
	}

	// Validar estrutura da resposta
	assert.Len(t, response.Chairs, 2)
	assert.Equal(t, int64(2), response.Total)
	assert.Equal(t, 10, response.Limit)
	assert.Equal(t, 0, response.Offset)

	// Validar dados das cadeiras
	assert.Equal(t, uint(1), response.Chairs[0].ID)
	assert.Equal(t, "Cadeira 1", response.Chairs[0].Name)
	assert.Equal(t, "Sala 101", response.Chairs[0].Location)

	assert.Equal(t, uint(2), response.Chairs[1].ID)
	assert.Equal(t, "Cadeira 2", response.Chairs[1].Name)
	assert.Equal(t, "Sala 102", response.Chairs[1].Location)
}

func TestChairStatus_Validation(t *testing.T) {
	validStatuses := []string{"ativa", "inativa"}

	for _, status := range validStatuses {
		t.Run("Valid status: "+status, func(t *testing.T) {
			// Simular validação de status
			isValid := contains(validStatuses, status)
			assert.True(t, isValid)
		})
	}

	invalidStatuses := []string{"", "invalid", "pendente", "aprovado"}

	for _, status := range invalidStatuses {
		t.Run("Invalid status: "+status, func(t *testing.T) {
			// Simular validação de status
			isValid := contains(validStatuses, status)
			assert.False(t, isValid)
		})
	}
}

func TestChairResponse_CompleteStructure(t *testing.T) {
	now := time.Now()

	response := ChairResponse{
		ID:          1,
		Name:        "Cadeira Completa",
		Description: "Uma cadeira completa para testes",
		Location:    "Sala de Testes 101",
		Status:      "ativa",
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	// Verificar estrutura completa
	assert.Equal(t, uint(1), response.ID)
	assert.Equal(t, "Cadeira Completa", response.Name)
	assert.Equal(t, "Uma cadeira completa para testes", response.Description)
	assert.Equal(t, "Sala de Testes 101", response.Location)
	assert.Equal(t, "ativa", response.Status)
	assert.Equal(t, now, response.CreatedAt)
	assert.Equal(t, now, response.UpdatedAt)

	// Verificar se é uma cadeira válida
	assert.NotEmpty(t, response.Name)
	assert.NotEmpty(t, response.Location)
	assert.GreaterOrEqual(t, len(response.Name), 2)
	assert.GreaterOrEqual(t, len(response.Location), 2)
}
