package repositories

import (
	"agendamento-backend/internal/domain/entities"
)

type ChairRepository interface {
	// CRUD básico
	Create(chair *entities.Chair) error
	GetByID(id uint) (*entities.Chair, error)
	GetByName(name string) (*entities.Chair, error)
	Update(chair *entities.Chair) error
	Delete(id uint) error

	// Listagem e filtros
	List(limit, offset int, filters map[string]interface{}) ([]*entities.Chair, int64, error)
	GetActive(limit, offset int) ([]*entities.Chair, int64, error)
	GetByStatus(status string, limit, offset int) ([]*entities.Chair, int64, error)
	GetByLocation(location string, limit, offset int) ([]*entities.Chair, int64, error)

	// Operações específicas
	ChangeStatus(id uint, newStatus string, changedBy uint) error
	GetAvailableChairs() ([]*entities.Chair, error)

	// Validações
	ExistsByName(name string) (bool, error)
	ExistsByLocation(location string) (bool, error)

	// Estatísticas
	CountByStatus(status string) (int64, error)
	CountTotal() (int64, error)
	CountActive() (int64, error)
}
