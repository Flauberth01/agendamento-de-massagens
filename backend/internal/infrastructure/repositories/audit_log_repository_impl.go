package repositories

import (
	"time"

	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/repositories"
	"gorm.io/gorm"
)

type auditLogRepositoryImpl struct {
	db *gorm.DB
}

func NewAuditLogRepository(db *gorm.DB) repositories.AuditLogRepository {
	return &auditLogRepositoryImpl{
		db: db,
	}
}

// Create cria um novo log de auditoria
func (r *auditLogRepositoryImpl) Create(auditLog *entities.AuditLog) error {
	return r.db.Create(auditLog).Error
}

// GetByID busca log de auditoria por ID
func (r *auditLogRepositoryImpl) GetByID(id uint) (*entities.AuditLog, error) {
	var auditLog entities.AuditLog
	err := r.db.Preload("User").First(&auditLog, id).Error
	if err != nil {
		return nil, err
	}
	return &auditLog, nil
}

// List lista logs de auditoria com paginação e filtros
func (r *auditLogRepositoryImpl) List(limit, offset int, filters map[string]interface{}) ([]*entities.AuditLog, int64, error) {
	var auditLogs []*entities.AuditLog
	var total int64

	query := r.db.Model(&entities.AuditLog{}).Preload("User")

	// Aplicar filtros
	for key, value := range filters {
		switch key {
		case "user_id":
			query = query.Where("user_id = ?", value)
		case "action":
			query = query.Where("action = ?", value)
		case "resource":
			query = query.Where("resource = ?", value)
		case "resource_id":
			query = query.Where("resource_id = ?", value)
		case "ip_address":
			query = query.Where("ip_address = ?", value)
		case "start_date":
			if date, ok := value.(time.Time); ok {
				query = query.Where("created_at >= ?", date)
			}
		case "end_date":
			if date, ok := value.(time.Time); ok {
				query = query.Where("created_at <= ?", date)
			}
		}
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&auditLogs).Error
	return auditLogs, total, err
}

// GetByUser busca logs de auditoria de um usuário
func (r *auditLogRepositoryImpl) GetByUser(userID uint, limit, offset int) ([]*entities.AuditLog, int64, error) {
	var auditLogs []*entities.AuditLog
	var total int64

	query := r.db.Model(&entities.AuditLog{}).Where("user_id = ?", userID)

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&auditLogs).Error
	return auditLogs, total, err
}

// GetByAction busca logs de auditoria por ação
func (r *auditLogRepositoryImpl) GetByAction(action string, limit, offset int) ([]*entities.AuditLog, int64, error) {
	var auditLogs []*entities.AuditLog
	var total int64

	query := r.db.Model(&entities.AuditLog{}).Preload("User").Where("action = ?", action)

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&auditLogs).Error
	return auditLogs, total, err
}

// GetByResource busca logs de auditoria por recurso
func (r *auditLogRepositoryImpl) GetByResource(resource string, limit, offset int) ([]*entities.AuditLog, int64, error) {
	var auditLogs []*entities.AuditLog
	var total int64

	query := r.db.Model(&entities.AuditLog{}).Preload("User").Where("resource = ?", resource)

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&auditLogs).Error
	return auditLogs, total, err
}

// GetByResourceID busca logs de auditoria por recurso e ID
func (r *auditLogRepositoryImpl) GetByResourceID(resource string, resourceID uint, limit, offset int) ([]*entities.AuditLog, int64, error) {
	var auditLogs []*entities.AuditLog
	var total int64

	query := r.db.Model(&entities.AuditLog{}).Preload("User").Where("resource = ? AND resource_id = ?", resource, resourceID)

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&auditLogs).Error
	return auditLogs, total, err
}

// GetByDateRange busca logs de auditoria por período
func (r *auditLogRepositoryImpl) GetByDateRange(startDate, endDate time.Time, limit, offset int) ([]*entities.AuditLog, int64, error) {
	var auditLogs []*entities.AuditLog
	var total int64

	query := r.db.Model(&entities.AuditLog{}).Preload("User").
		Where("created_at >= ? AND created_at <= ?", startDate, endDate)

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Buscar com paginação
	err := query.Limit(limit).Offset(offset).Order("created_at DESC").Find(&auditLogs).Error
	return auditLogs, total, err
}

// GetRecentActivity busca atividade recente
func (r *auditLogRepositoryImpl) GetRecentActivity(limit int) ([]*entities.AuditLog, error) {
	var auditLogs []*entities.AuditLog
	err := r.db.Preload("User").Limit(limit).Order("created_at DESC").Find(&auditLogs).Error
	return auditLogs, err
}

// GetUserActivity busca atividade de um usuário
func (r *auditLogRepositoryImpl) GetUserActivity(userID uint, limit int) ([]*entities.AuditLog, error) {
	var auditLogs []*entities.AuditLog
	err := r.db.Where("user_id = ?", userID).Limit(limit).Order("created_at DESC").Find(&auditLogs).Error
	return auditLogs, err
}

// GetSystemActivity busca atividade do sistema (sem usuário)
func (r *auditLogRepositoryImpl) GetSystemActivity(limit int) ([]*entities.AuditLog, error) {
	var auditLogs []*entities.AuditLog
	err := r.db.Where("user_id IS NULL").Limit(limit).Order("created_at DESC").Find(&auditLogs).Error
	return auditLogs, err
}

// GetActivityByPeriod busca atividade por período
func (r *auditLogRepositoryImpl) GetActivityByPeriod(startDate, endDate time.Time) ([]*entities.AuditLog, error) {
	var auditLogs []*entities.AuditLog
	err := r.db.Preload("User").
		Where("created_at >= ? AND created_at <= ?", startDate, endDate).
		Order("created_at DESC").Find(&auditLogs).Error
	return auditLogs, err
}

// GetMostActiveUsers busca usuários mais ativos
func (r *auditLogRepositoryImpl) GetMostActiveUsers(limit int, startDate, endDate time.Time) ([]map[string]interface{}, error) {
	var results []map[string]interface{}

	query := `
		SELECT 
			u.id,
			u.name,
			u.email,
			COUNT(al.id) as activity_count
		FROM users u
		INNER JOIN audit_logs al ON u.id = al.user_id
		WHERE al.created_at >= ? AND al.created_at <= ?
		GROUP BY u.id, u.name, u.email
		ORDER BY activity_count DESC
		LIMIT ?
	`

	err := r.db.Raw(query, startDate, endDate, limit).Scan(&results).Error
	return results, err
}

// GetMostCommonActions busca ações mais comuns
func (r *auditLogRepositoryImpl) GetMostCommonActions(limit int, startDate, endDate time.Time) ([]map[string]interface{}, error) {
	var results []map[string]interface{}

	query := `
		SELECT 
			action,
			resource,
			COUNT(*) as count
		FROM audit_logs
		WHERE created_at >= ? AND created_at <= ?
		GROUP BY action, resource
		ORDER BY count DESC
		LIMIT ?
	`

	err := r.db.Raw(query, startDate, endDate, limit).Scan(&results).Error
	return results, err
}

// CountByAction conta logs por ação
func (r *auditLogRepositoryImpl) CountByAction(action string) (int64, error) {
	var count int64
	err := r.db.Model(&entities.AuditLog{}).Where("action = ?", action).Count(&count).Error
	return count, err
}

// CountByResource conta logs por recurso
func (r *auditLogRepositoryImpl) CountByResource(resource string) (int64, error) {
	var count int64
	err := r.db.Model(&entities.AuditLog{}).Where("resource = ?", resource).Count(&count).Error
	return count, err
}

// CountByUser conta logs de um usuário
func (r *auditLogRepositoryImpl) CountByUser(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&entities.AuditLog{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

// CountByDateRange conta logs por período
func (r *auditLogRepositoryImpl) CountByDateRange(startDate, endDate time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&entities.AuditLog{}).Where("created_at >= ? AND created_at <= ?", startDate, endDate).Count(&count).Error
	return count, err
}

// CountTotal conta total de logs
func (r *auditLogRepositoryImpl) CountTotal() (int64, error) {
	var count int64
	err := r.db.Model(&entities.AuditLog{}).Count(&count).Error
	return count, err
}

// DeleteOlderThan exclui logs mais antigos que uma data
func (r *auditLogRepositoryImpl) DeleteOlderThan(date time.Time) error {
	return r.db.Where("created_at < ?", date).Delete(&entities.AuditLog{}).Error
}

// CleanupOldLogs limpa logs antigos baseado em dias de retenção
func (r *auditLogRepositoryImpl) CleanupOldLogs(retentionDays int) error {
	cutoffDate := time.Now().AddDate(0, 0, -retentionDays)
	return r.DeleteOlderThan(cutoffDate)
}
