package mappers

import (
	"agendamento-backend/internal/application/dtos"
	"agendamento-backend/internal/domain/entities"
)

// ToChairEntity converte CreateChairRequest para entidade Chair
func ToChairEntity(req *dtos.CreateChairRequest) *entities.Chair {
	status := req.Status
	if status == "" {
		status = "ativa"
	}

	return &entities.Chair{
		Name:        req.Name,
		Description: req.Description,
		Location:    req.Location,
		Status:      status,
	}
}

// ToChairUpdateEntity converte UpdateChairRequest para entidade Chair
func ToChairUpdateEntity(id uint, req *dtos.UpdateChairRequest) *entities.Chair {
	return &entities.Chair{
		ID:          id,
		Name:        req.Name,
		Description: req.Description,
		Location:    req.Location,
		Status:      req.Status,
	}
}

// ToChairResponse converte entidade Chair para ChairResponse
func ToChairResponse(chair *entities.Chair) *dtos.ChairResponse {
	return &dtos.ChairResponse{
		ID:          chair.ID,
		Name:        chair.Name,
		Description: chair.Description,
		Location:    chair.Location,
		Status:      chair.Status,
		CreatedAt:   chair.CreatedAt,
		UpdatedAt:   chair.UpdatedAt,
	}
}

// ToCreateChairResponse converte entidade Chair para CreateChairResponse
func ToCreateChairResponse(chair *entities.Chair) *dtos.CreateChairResponse {
	return &dtos.CreateChairResponse{
		ID:          chair.ID,
		Name:        chair.Name,
		Description: chair.Description,
		Location:    chair.Location,
		Status:      chair.Status,
		CreatedAt:   chair.CreatedAt,
	}
}

// ToChairResponseList converte lista de entidades Chair para lista de ChairResponse
func ToChairResponseList(chairs []*entities.Chair) []dtos.ChairResponse {
	responses := make([]dtos.ChairResponse, len(chairs))
	for i, chair := range chairs {
		responses[i] = *ToChairResponse(chair)
	}
	return responses
}

// ToListChairsResponse converte lista de entidades Chair para ListChairsResponse
func ToListChairsResponse(chairs []*entities.Chair, total int64, limit, offset int) *dtos.ListChairsResponse {
	return &dtos.ListChairsResponse{
		Chairs: ToChairResponseList(chairs),
		Total:  total,
		Limit:  limit,
		Offset: offset,
	}
}

// ToChairStatsResponse converte estatísticas para ChairStatsResponse
func ToChairStatsResponse(stats map[string]int64) *dtos.ChairStatsResponse {
	return &dtos.ChairStatsResponse{
		TotalChairs:     stats["total"],
		ActiveChairs:    stats["active"],
		InactiveChairs:  stats["inactive"],
		AvailableChairs: stats["available"],
	}
}
