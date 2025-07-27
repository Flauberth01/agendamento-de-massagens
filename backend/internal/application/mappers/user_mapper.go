package mappers

import (
	"agendamento-backend/internal/application/dtos"
	"agendamento-backend/internal/domain/entities"
)

// ToEntity converte CreateUserRequest para entidade User
func ToEntity(req *dtos.CreateUserRequest) *entities.User {
	return &entities.User{
		Name:          req.Name,
		CPF:           req.CPF,
		Email:         req.Email,
		Phone:         req.Phone,
		Password:      req.Password,
		RequestedRole: req.RequestedRole,
		Function:      req.Function,
		Position:      req.Position,
		Registration:  req.Registration,
		Sector:        req.Sector,
		Gender:        req.Gender,
		BirthDate:     req.BirthDate,
	}
}

// ToUpdateEntity converte UpdateUserRequest para entidade User
func ToUpdateEntity(id uint, req *dtos.UpdateUserRequest) *entities.User {
	return &entities.User{
		ID:           id,
		Name:         req.Name,
		CPF:          req.CPF,
		Email:        req.Email,
		Phone:        req.Phone,
		Password:     req.Password,
		Function:     req.Function,
		Position:     req.Position,
		Registration: req.Registration,
		Sector:       req.Sector,
		Gender:       req.Gender,
		BirthDate:    req.BirthDate,
	}
}

// ToResponse converte entidade User para UserResponse
func ToResponse(user *entities.User) *dtos.UserResponse {
	return &dtos.UserResponse{
		ID:            user.ID,
		Name:          user.Name,
		CPF:           user.CPF,
		Email:         user.Email,
		Phone:         user.Phone,
		Role:          user.Role,
		RequestedRole: user.RequestedRole,
		Status:        user.Status,
		Function:      user.Function,
		Position:      user.Position,
		Registration:  user.Registration,
		Sector:        user.Sector,
		Gender:        user.Gender,
		BirthDate:     user.BirthDate,
		CreatedAt:     user.CreatedAt,
		UpdatedAt:     user.UpdatedAt,
		LastLogin:     user.LastLogin,
	}
}

// ToCreateResponse converte entidade User para CreateUserResponse
func ToCreateResponse(user *entities.User) *dtos.CreateUserResponse {
	return &dtos.CreateUserResponse{
		ID:            user.ID,
		Name:          user.Name,
		CPF:           user.CPF,
		Email:         user.Email,
		Phone:         user.Phone,
		Role:          user.Role,
		RequestedRole: user.RequestedRole,
		Status:        user.Status,
		Function:      user.Function,
		Position:      user.Position,
		Registration:  user.Registration,
		Sector:        user.Sector,
		Gender:        user.Gender,
		BirthDate:     user.BirthDate,
		CreatedAt:     user.CreatedAt,
	}
}

// ToResponseList converte lista de entidades User para lista de UserResponse
func ToResponseList(users []*entities.User) []dtos.UserResponse {
	responses := make([]dtos.UserResponse, len(users))
	for i, user := range users {
		responses[i] = *ToResponse(user)
	}
	return responses
}

// ToListResponse converte lista de entidades User para ListUsersResponse
func ToListResponse(users []*entities.User, total int64, limit, offset int) *dtos.ListUsersResponse {
	return &dtos.ListUsersResponse{
		Users:  ToResponseList(users),
		Total:  total,
		Limit:  limit,
		Offset: offset,
	}
}
