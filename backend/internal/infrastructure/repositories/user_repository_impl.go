package repositories

import (
	"fmt"
	"time"

	"gorm.io/gorm"
	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/repositories"
)

type userRepositoryImpl struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) repositories.UserRepository {
	return &userRepositoryImpl{
		db: db,
	}
}

// Create cria um novo usuário
func (r *userRepositoryImpl) Create(user *entities.User) error {
	return r.db.Create(user).Error
}

// GetByID busca usuário por ID
func (r *userRepositoryImpl) GetByID(id uint) (*entities.User, error) {
	var user entities.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetByEmail busca usuário por email
func (r *userRepositoryImpl) GetByEmail(email string) (*entities.User, error) {
	var user entities.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}



// GetByCPF busca usuário por CPF
func (r *userRepositoryImpl) GetByCPF(cpf string) (*entities.User, error) {
	var user entities.User
	err := r.db.Where("cpf = ?", cpf).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Update atualiza um usuário
func (r *userRepositoryImpl) Update(user *entities.User) error {
	return r.db.Save(user).Error
}

// Delete exclui um usuário (soft delete)
func (r *userRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&entities.User{}, id).Error
}

// List lista usuários com paginação e filtros
func (r *userRepositoryImpl) List(limit, offset int, filters map[string]interface{}) ([]*entities.User, int64, error) {
	var users []*entities.User
	var total int64

	query := r.db.Model(&entities.User{})

	// Aplicar filtros
	for key, value := range filters {
		switch key {
		case "name":
			query = query.Where("name ILIKE ?", fmt.Sprintf("%%%s%%", value))
		case "email":
			query = query.Where("email ILIKE ?", fmt.Sprintf("%%%s%%", value))
		case "role":
			query = query.Where("role = ?", value)
		case "status":
			query = query.Where("status = ?", value)
		case "sector":
			query = query.Where("sector ILIKE ?", fmt.Sprintf("%%%s%%", value))
		}
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&users).Error
	return users, total, err
}

// GetPendingApprovals busca usuários pendentes de aprovação
func (r *userRepositoryImpl) GetPendingApprovals(limit, offset int) ([]*entities.User, int64, error) {
	var users []*entities.User
	var total int64

	query := r.db.Model(&entities.User{}).Where("status = ?", "pendente")

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("created_at ASC").Find(&users).Error
	return users, total, err
}

// GetByRole busca usuários por role
func (r *userRepositoryImpl) GetByRole(role string, limit, offset int) ([]*entities.User, int64, error) {
	var users []*entities.User
	var total int64

	query := r.db.Model(&entities.User{}).Where("role = ?", role)

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("name ASC").Find(&users).Error
	return users, total, err
}

// GetByStatus busca usuários por status
func (r *userRepositoryImpl) GetByStatus(status string, limit, offset int) ([]*entities.User, int64, error) {
	var users []*entities.User
	var total int64

	query := r.db.Model(&entities.User{}).Where("status = ?", status)

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&users).Error
	return users, total, err
}

// Approve aprova um usuário
func (r *userRepositoryImpl) Approve(id uint, approvedBy uint) error {
	return r.db.Model(&entities.User{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status": "aprovado",
		"role":   r.db.Raw("requested_role"),
	}).Error
}

// Reject rejeita um usuário
func (r *userRepositoryImpl) Reject(id uint, rejectedBy uint, reason string) error {
	return r.db.Model(&entities.User{}).Where("id = ?", id).Update("status", "reprovado").Error
}

// ChangeRole altera o role de um usuário
func (r *userRepositoryImpl) ChangeRole(id uint, newRole string, changedBy uint) error {
	return r.db.Model(&entities.User{}).Where("id = ?", id).Update("role", newRole).Error
}

// ChangeStatus altera o status de um usuário
func (r *userRepositoryImpl) ChangeStatus(id uint, newStatus string, changedBy uint) error {
	return r.db.Model(&entities.User{}).Where("id = ?", id).Update("status", newStatus).Error
}

// UpdateLastLogin atualiza o último login
func (r *userRepositoryImpl) UpdateLastLogin(id uint) error {
	now := time.Now()
	return r.db.Model(&entities.User{}).Where("id = ?", id).Update("last_login", &now).Error
}

// ExistsByEmail verifica se email já existe
func (r *userRepositoryImpl) ExistsByEmail(email string) (bool, error) {
	var count int64
	err := r.db.Model(&entities.User{}).Where("email = ?", email).Count(&count).Error
	return count > 0, err
}

// ExistsByLogin verifica se login já existe


// ExistsByCPF verifica se CPF já existe
func (r *userRepositoryImpl) ExistsByCPF(cpf string) (bool, error) {
	var count int64
	err := r.db.Model(&entities.User{}).Where("cpf = ?", cpf).Count(&count).Error
	return count > 0, err
}

// ExistsByPhone verifica se telefone já existe
func (r *userRepositoryImpl) ExistsByPhone(phone string) (bool, error) {
	var count int64
	err := r.db.Model(&entities.User{}).Where("phone = ?", phone).Count(&count).Error
	return count > 0, err
}

// CountByRole conta usuários por role
func (r *userRepositoryImpl) CountByRole(role string) (int64, error) {
	var count int64
	err := r.db.Model(&entities.User{}).Where("role = ?", role).Count(&count).Error
	return count, err
}

// CountByStatus conta usuários por status
func (r *userRepositoryImpl) CountByStatus(status string) (int64, error) {
	var count int64
	err := r.db.Model(&entities.User{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

// CountTotal conta total de usuários
func (r *userRepositoryImpl) CountTotal() (int64, error) {
	var count int64
	err := r.db.Model(&entities.User{}).Count(&count).Error
	return count, err
}
