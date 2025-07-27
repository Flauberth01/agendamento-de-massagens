package mappers

import (
	"testing"
	"time"

	"agendamento-backend/internal/application/dtos"
	"agendamento-backend/internal/domain/entities"

	"github.com/stretchr/testify/assert"
)

func TestToEntity(t *testing.T) {
	req := &dtos.CreateUserRequest{
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

	entity := ToEntity(req)

	assert.Equal(t, req.Name, entity.Name)
	assert.Equal(t, req.CPF, entity.CPF)
	assert.Equal(t, req.Email, entity.Email)
	assert.Equal(t, req.Phone, entity.Phone)
	assert.Equal(t, req.Password, entity.Password)
	assert.Equal(t, req.RequestedRole, entity.RequestedRole)
	assert.Equal(t, req.Function, entity.Function)
	assert.Equal(t, req.Position, entity.Position)
	assert.Equal(t, req.Registration, entity.Registration)
	assert.Equal(t, req.Sector, entity.Sector)
	assert.Equal(t, req.Gender, entity.Gender)
}

func TestToUpdateEntity(t *testing.T) {
	id := uint(1)
	req := &dtos.UpdateUserRequest{
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

	entity := ToUpdateEntity(id, req)

	assert.Equal(t, id, entity.ID)
	assert.Equal(t, req.Name, entity.Name)
	assert.Equal(t, req.CPF, entity.CPF)
	assert.Equal(t, req.Email, entity.Email)
	assert.Equal(t, req.Phone, entity.Phone)
	assert.Equal(t, req.Password, entity.Password)
	assert.Equal(t, req.Function, entity.Function)
	assert.Equal(t, req.Position, entity.Position)
	assert.Equal(t, req.Registration, entity.Registration)
	assert.Equal(t, req.Sector, entity.Sector)
	assert.Equal(t, req.Gender, entity.Gender)
}

func TestToResponse(t *testing.T) {
	now := time.Now()
	entity := &entities.User{
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

	response := ToResponse(entity)

	assert.Equal(t, entity.ID, response.ID)
	assert.Equal(t, entity.Name, response.Name)
	assert.Equal(t, entity.CPF, response.CPF)
	assert.Equal(t, entity.Email, response.Email)
	assert.Equal(t, entity.Phone, response.Phone)
	assert.Equal(t, entity.Role, response.Role)
	assert.Equal(t, entity.RequestedRole, response.RequestedRole)
	assert.Equal(t, entity.Status, response.Status)
	assert.Equal(t, entity.Function, response.Function)
	assert.Equal(t, entity.Position, response.Position)
	assert.Equal(t, entity.Registration, response.Registration)
	assert.Equal(t, entity.Sector, response.Sector)
	assert.Equal(t, entity.Gender, response.Gender)
	assert.Equal(t, entity.CreatedAt, response.CreatedAt)
	assert.Equal(t, entity.UpdatedAt, response.UpdatedAt)
	assert.Equal(t, entity.LastLogin, response.LastLogin)
}

func TestToCreateResponse(t *testing.T) {
	now := time.Now()
	entity := &entities.User{
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

	response := ToCreateResponse(entity)

	assert.Equal(t, entity.ID, response.ID)
	assert.Equal(t, entity.Name, response.Name)
	assert.Equal(t, entity.CPF, response.CPF)
	assert.Equal(t, entity.Email, response.Email)
	assert.Equal(t, entity.Phone, response.Phone)
	assert.Equal(t, entity.Role, response.Role)
	assert.Equal(t, entity.RequestedRole, response.RequestedRole)
	assert.Equal(t, entity.Status, response.Status)
	assert.Equal(t, entity.Function, response.Function)
	assert.Equal(t, entity.Position, response.Position)
	assert.Equal(t, entity.Registration, response.Registration)
	assert.Equal(t, entity.Sector, response.Sector)
	assert.Equal(t, entity.Gender, response.Gender)
	assert.Equal(t, entity.CreatedAt, response.CreatedAt)
}

func TestToResponseList(t *testing.T) {
	entities := []*entities.User{
		{
			ID:    1,
			Name:  "João Silva",
			Email: "joao@example.com",
			Role:  "usuario",
		},
		{
			ID:    2,
			Name:  "Maria Santos",
			Email: "maria@example.com",
			Role:  "admin",
		},
	}

	responses := ToResponseList(entities)

	assert.Len(t, responses, 2)
	assert.Equal(t, entities[0].ID, responses[0].ID)
	assert.Equal(t, entities[0].Name, responses[0].Name)
	assert.Equal(t, entities[0].Email, responses[0].Email)
	assert.Equal(t, entities[0].Role, responses[0].Role)
	assert.Equal(t, entities[1].ID, responses[1].ID)
	assert.Equal(t, entities[1].Name, responses[1].Name)
	assert.Equal(t, entities[1].Email, responses[1].Email)
	assert.Equal(t, entities[1].Role, responses[1].Role)
}

func TestToListResponse(t *testing.T) {
	entities := []*entities.User{
		{
			ID:    1,
			Name:  "João Silva",
			Email: "joao@example.com",
			Role:  "usuario",
		},
		{
			ID:    2,
			Name:  "Maria Santos",
			Email: "maria@example.com",
			Role:  "admin",
		},
	}

	total := int64(2)
	limit := 10
	offset := 0

	response := ToListResponse(entities, total, limit, offset)

	assert.Len(t, response.Users, 2)
	assert.Equal(t, total, response.Total)
	assert.Equal(t, limit, response.Limit)
	assert.Equal(t, offset, response.Offset)
	assert.Equal(t, entities[0].ID, response.Users[0].ID)
	assert.Equal(t, entities[1].ID, response.Users[1].ID)
}

func TestToResponseList_EmptyList(t *testing.T) {
	entities := []*entities.User{}

	responses := ToResponseList(entities)

	assert.Len(t, responses, 0)
	assert.Empty(t, responses)
}

func TestToListResponse_EmptyList(t *testing.T) {
	entities := []*entities.User{}
	total := int64(0)
	limit := 10
	offset := 0

	response := ToListResponse(entities, total, limit, offset)

	assert.Len(t, response.Users, 0)
	assert.Equal(t, total, response.Total)
	assert.Equal(t, limit, response.Limit)
	assert.Equal(t, offset, response.Offset)
}
