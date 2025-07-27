package repositories

import (
	"agendamento-backend/internal/domain/entities"
)

type UserRepository interface {
	// CRUD básico
	Create(user *entities.User) error
	GetByID(id uint) (*entities.User, error)
	GetByEmail(email string) (*entities.User, error)

	GetByCPF(cpf string) (*entities.User, error)
	Update(user *entities.User) error
	Delete(id uint) error

	// Listagem e filtros
	List(limit, offset int, filters map[string]interface{}) ([]*entities.User, int64, error)
	GetPendingApprovals(limit, offset int) ([]*entities.User, int64, error)
	GetByRole(role string, limit, offset int) ([]*entities.User, int64, error)
	GetByStatus(status string, limit, offset int) ([]*entities.User, int64, error)

	// Operações específicas
	Approve(id uint, approvedBy uint) error
	Reject(id uint, rejectedBy uint, reason string) error
	ChangeRole(id uint, newRole string, changedBy uint) error
	ChangeStatus(id uint, newStatus string, changedBy uint) error
	UpdateLastLogin(id uint) error

	// Validações
	ExistsByEmail(email string) (bool, error)

	ExistsByCPF(cpf string) (bool, error)
	ExistsByPhone(phone string) (bool, error)

	// Estatísticas
	CountByRole(role string) (int64, error)
	CountByStatus(status string) (int64, error)
	CountTotal() (int64, error)
}
