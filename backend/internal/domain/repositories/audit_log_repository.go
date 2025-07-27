package repositories

import (
	"time"
	"agendamento-backend/internal/domain/entities"
)

type AuditLogRepository interface {
	// CRUD básico
	Create(auditLog *entities.AuditLog) error
	GetByID(id uint) (*entities.AuditLog, error)

	// Listagem e filtros
	List(limit, offset int, filters map[string]interface{}) ([]*entities.AuditLog, int64, error)
	GetByUser(userID uint, limit, offset int) ([]*entities.AuditLog, int64, error)
	GetByAction(action string, limit, offset int) ([]*entities.AuditLog, int64, error)
	GetByResource(resource string, limit, offset int) ([]*entities.AuditLog, int64, error)
	GetByResourceID(resource string, resourceID uint, limit, offset int) ([]*entities.AuditLog, int64, error)
	GetByDateRange(startDate, endDate time.Time, limit, offset int) ([]*entities.AuditLog, int64, error)

	// Operações específicas
	GetRecentActivity(limit int) ([]*entities.AuditLog, error)
	GetUserActivity(userID uint, limit int) ([]*entities.AuditLog, error)
	GetSystemActivity(limit int) ([]*entities.AuditLog, error)

	// Relatórios
	GetActivityByPeriod(startDate, endDate time.Time) ([]*entities.AuditLog, error)
	GetMostActiveUsers(limit int, startDate, endDate time.Time) ([]map[string]interface{}, error)
	GetMostCommonActions(limit int, startDate, endDate time.Time) ([]map[string]interface{}, error)

	// Estatísticas
	CountByAction(action string) (int64, error)
	CountByResource(resource string) (int64, error)
	CountByUser(userID uint) (int64, error)
	CountByDateRange(startDate, endDate time.Time) (int64, error)
	CountTotal() (int64, error)

	// Limpeza
	DeleteOlderThan(date time.Time) error
	CleanupOldLogs(retentionDays int) error
}
