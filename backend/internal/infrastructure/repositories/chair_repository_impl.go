package repositories

import (
	"fmt"

	"gorm.io/gorm"
	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/repositories"
)

type chairRepositoryImpl struct {
	db *gorm.DB
}

func NewChairRepository(db *gorm.DB) repositories.ChairRepository {
	return &chairRepositoryImpl{
		db: db,
	}
}

// Create cria uma nova cadeira
func (r *chairRepositoryImpl) Create(chair *entities.Chair) error {
	return r.db.Create(chair).Error
}

// GetByID busca cadeira por ID
func (r *chairRepositoryImpl) GetByID(id uint) (*entities.Chair, error) {
	var chair entities.Chair
	err := r.db.First(&chair, id).Error
	if err != nil {
		return nil, err
	}
	return &chair, nil
}

// GetByName busca cadeira por nome
func (r *chairRepositoryImpl) GetByName(name string) (*entities.Chair, error) {
	var chair entities.Chair
	err := r.db.Where("name = ?", name).First(&chair).Error
	if err != nil {
		return nil, err
	}
	return &chair, nil
}

// Update atualiza uma cadeira
func (r *chairRepositoryImpl) Update(chair *entities.Chair) error {
	return r.db.Save(chair).Error
}

// Delete exclui uma cadeira (soft delete)
func (r *chairRepositoryImpl) Delete(id uint) error {
	return r.db.Delete(&entities.Chair{}, id).Error
}

// List lista cadeiras com paginação e filtros
func (r *chairRepositoryImpl) List(limit, offset int, filters map[string]interface{}) ([]*entities.Chair, int64, error) {
	var chairs []*entities.Chair
	var total int64

	query := r.db.Model(&entities.Chair{})

	// Aplicar filtros
	for key, value := range filters {
		switch key {
		case "name":
			query = query.Where("name ILIKE ?", fmt.Sprintf("%%%s%%", value))
		case "location":
			query = query.Where("location ILIKE ?", fmt.Sprintf("%%%s%%", value))
		case "status":
			query = query.Where("status = ?", value)
		}
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("name ASC").Find(&chairs).Error
	return chairs, total, err
}

// GetActive busca cadeiras ativas
func (r *chairRepositoryImpl) GetActive(limit, offset int) ([]*entities.Chair, int64, error) {
	var chairs []*entities.Chair
	var total int64

	query := r.db.Model(&entities.Chair{}).Where("status = ?", "ativa")

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("name ASC").Find(&chairs).Error
	return chairs, total, err
}

// GetByStatus busca cadeiras por status
func (r *chairRepositoryImpl) GetByStatus(status string, limit, offset int) ([]*entities.Chair, int64, error) {
	var chairs []*entities.Chair
	var total int64

	query := r.db.Model(&entities.Chair{}).Where("status = ?", status)

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("name ASC").Find(&chairs).Error
	return chairs, total, err
}

// GetByLocation busca cadeiras por localização
func (r *chairRepositoryImpl) GetByLocation(location string, limit, offset int) ([]*entities.Chair, int64, error) {
	var chairs []*entities.Chair
	var total int64

	query := r.db.Model(&entities.Chair{}).Where("location ILIKE ?", fmt.Sprintf("%%%s%%", location))

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("name ASC").Find(&chairs).Error
	return chairs, total, err
}

// ChangeStatus altera o status de uma cadeira
func (r *chairRepositoryImpl) ChangeStatus(id uint, newStatus string, changedBy uint) error {
	return r.db.Model(&entities.Chair{}).Where("id = ?", id).Update("status", newStatus).Error
}

// GetAvailableChairs busca cadeiras disponíveis para agendamento
func (r *chairRepositoryImpl) GetAvailableChairs() ([]*entities.Chair, error) {
	var chairs []*entities.Chair
	err := r.db.Where("status = ?", "ativa").Order("name ASC").Find(&chairs).Error
	return chairs, err
}

// ExistsByName verifica se nome já existe
func (r *chairRepositoryImpl) ExistsByName(name string) (bool, error) {
	var count int64
	err := r.db.Model(&entities.Chair{}).Where("name = ?", name).Count(&count).Error
	return count > 0, err
}

// ExistsByLocation verifica se localização já existe
func (r *chairRepositoryImpl) ExistsByLocation(location string) (bool, error) {
	var count int64
	err := r.db.Model(&entities.Chair{}).Where("location = ?", location).Count(&count).Error
	return count > 0, err
}

// CountByStatus conta cadeiras por status
func (r *chairRepositoryImpl) CountByStatus(status string) (int64, error) {
	var count int64
	err := r.db.Model(&entities.Chair{}).Where("status = ?", status).Count(&count).Error
	return count, err
}

// CountTotal conta total de cadeiras
func (r *chairRepositoryImpl) CountTotal() (int64, error) {
	var count int64
	err := r.db.Model(&entities.Chair{}).Count(&count).Error
	return count, err
}

// CountActive conta cadeiras ativas
func (r *chairRepositoryImpl) CountActive() (int64, error) {
	var count int64
	err := r.db.Model(&entities.Chair{}).Where("status = ?", "ativa").Count(&count).Error
	return count, err
}
