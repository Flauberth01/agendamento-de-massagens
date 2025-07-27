package dtos

import "time"

// CreateChairRequest representa os dados para criar uma cadeira
type CreateChairRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=60"`
	Description string `json:"description" validate:"max=500"`
	Location    string `json:"location" validate:"required,min=2,max=100"`
	Status      string `json:"status" validate:"oneof=ativa inativa"`
}

// CreateChairResponse representa a resposta da criação de cadeira
type CreateChairResponse struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

// UpdateChairRequest representa os dados para atualizar uma cadeira
type UpdateChairRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=60"`
	Description string `json:"description" validate:"max=500"`
	Location    string `json:"location" validate:"required,min=2,max=100"`
	Status      string `json:"status" validate:"oneof=ativa inativa"`
}

// ChairResponse representa a resposta de dados de cadeira
type ChairResponse struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ListChairsRequest representa os filtros para listar cadeiras
type ListChairsRequest struct {
	Limit   int                    `json:"limit" validate:"min=1,max=100"`
	Offset  int                    `json:"offset" validate:"min=0"`
	Filters map[string]interface{} `json:"filters"`
}

// ListChairsResponse representa a resposta da listagem de cadeiras
type ListChairsResponse struct {
	Chairs []ChairResponse `json:"chairs"`
	Total  int64           `json:"total"`
	Limit  int             `json:"limit"`
	Offset int             `json:"offset"`
}

// ChairStatsResponse representa estatísticas das cadeiras
type ChairStatsResponse struct {
	TotalChairs     int64 `json:"total_chairs"`
	ActiveChairs    int64 `json:"active_chairs"`
	InactiveChairs  int64 `json:"inactive_chairs"`
	AvailableChairs int64 `json:"available_chairs"`
}
