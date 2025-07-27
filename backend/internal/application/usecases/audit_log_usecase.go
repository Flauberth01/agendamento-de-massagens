package usecases

import (
	"fmt"
	"time"

	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/ports"
	"agendamento-backend/internal/domain/repositories"
)

type AuditLogUseCase struct {
	auditLogRepo repositories.AuditLogRepository
	userRepo     repositories.UserRepository
	validator    ports.Validator
}

func NewAuditLogUseCase(
	auditLogRepo repositories.AuditLogRepository,
	userRepo repositories.UserRepository,
	validator ports.Validator,
) *AuditLogUseCase {
	return &AuditLogUseCase{
		auditLogRepo: auditLogRepo,
		userRepo:     userRepo,
		validator:    validator,
	}
}

// CreateAuditLog cria um novo log de auditoria
func (uc *AuditLogUseCase) CreateAuditLog(auditLog *entities.AuditLog) error {
	// Validar estrutura
	if err := uc.validator.ValidateStruct(auditLog); err != nil {
		return fmt.Errorf("dados inválidos: %w", err)
	}

	// Verificar se o usuário existe (se fornecido)
	if auditLog.UserID != nil {
		_, err := uc.userRepo.GetByID(*auditLog.UserID)
		if err != nil {
			return fmt.Errorf("usuário não encontrado: %w", err)
		}
	}

	// Criar log
	return uc.auditLogRepo.Create(auditLog)
}

// GetAuditLogByID busca log de auditoria por ID
func (uc *AuditLogUseCase) GetAuditLogByID(id uint) (*entities.AuditLog, error) {
	if id == 0 {
		return nil, fmt.Errorf("ID inválido")
	}

	return uc.auditLogRepo.GetByID(id)
}

// ListAuditLogs lista logs de auditoria com paginação e filtros
func (uc *AuditLogUseCase) ListAuditLogs(limit, offset int, filters map[string]interface{}) ([]*entities.AuditLog, int64, error) {
	// Validar parâmetros de paginação
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	return uc.auditLogRepo.List(limit, offset, filters)
}

// GetUserAuditLogs busca logs de auditoria de um usuário
func (uc *AuditLogUseCase) GetUserAuditLogs(userID uint, limit, offset int) ([]*entities.AuditLog, int64, error) {
	if userID == 0 {
		return nil, 0, fmt.Errorf("ID do usuário inválido")
	}

	// Verificar se o usuário existe
	_, err := uc.userRepo.GetByID(userID)
	if err != nil {
		return nil, 0, fmt.Errorf("usuário não encontrado: %w", err)
	}

	// Validar parâmetros de paginação
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	return uc.auditLogRepo.GetByUser(userID, limit, offset)
}

// GetAuditLogsByAction busca logs de auditoria por ação
func (uc *AuditLogUseCase) GetAuditLogsByAction(action string, limit, offset int) ([]*entities.AuditLog, int64, error) {
	if action == "" {
		return nil, 0, fmt.Errorf("ação não pode estar vazia")
	}

	// Validar parâmetros de paginação
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	return uc.auditLogRepo.GetByAction(action, limit, offset)
}

// GetAuditLogsByResource busca logs de auditoria por recurso
func (uc *AuditLogUseCase) GetAuditLogsByResource(resource string, limit, offset int) ([]*entities.AuditLog, int64, error) {
	if resource == "" {
		return nil, 0, fmt.Errorf("recurso não pode estar vazio")
	}

	// Validar parâmetros de paginação
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	return uc.auditLogRepo.GetByResource(resource, limit, offset)
}

// GetAuditLogsByResourceID busca logs de auditoria por recurso e ID
func (uc *AuditLogUseCase) GetAuditLogsByResourceID(resource string, resourceID uint, limit, offset int) ([]*entities.AuditLog, int64, error) {
	if resource == "" {
		return nil, 0, fmt.Errorf("recurso não pode estar vazio")
	}
	if resourceID == 0 {
		return nil, 0, fmt.Errorf("ID do recurso inválido")
	}

	// Validar parâmetros de paginação
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	return uc.auditLogRepo.GetByResourceID(resource, resourceID, limit, offset)
}

// GetAuditLogsByDateRange busca logs de auditoria por período
func (uc *AuditLogUseCase) GetAuditLogsByDateRange(startDate, endDate time.Time, limit, offset int) ([]*entities.AuditLog, int64, error) {
	// Validar datas
	if startDate.IsZero() || endDate.IsZero() {
		return nil, 0, fmt.Errorf("datas de início e fim são obrigatórias")
	}
	if startDate.After(endDate) {
		return nil, 0, fmt.Errorf("data de início deve ser anterior à data de fim")
	}

	// Validar parâmetros de paginação
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	if offset < 0 {
		offset = 0
	}

	return uc.auditLogRepo.GetByDateRange(startDate, endDate, limit, offset)
}

// GetRecentActivity busca atividade recente
func (uc *AuditLogUseCase) GetRecentActivity(limit int) ([]*entities.AuditLog, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	return uc.auditLogRepo.GetRecentActivity(limit)
}

// GetUserActivity busca atividade de um usuário
func (uc *AuditLogUseCase) GetUserActivity(userID uint, limit int) ([]*entities.AuditLog, error) {
	if userID == 0 {
		return nil, fmt.Errorf("ID do usuário inválido")
	}

	// Verificar se o usuário existe
	_, err := uc.userRepo.GetByID(userID)
	if err != nil {
		return nil, fmt.Errorf("usuário não encontrado: %w", err)
	}

	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	return uc.auditLogRepo.GetUserActivity(userID, limit)
}

// GetSystemActivity busca atividade do sistema
func (uc *AuditLogUseCase) GetSystemActivity(limit int) ([]*entities.AuditLog, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	return uc.auditLogRepo.GetSystemActivity(limit)
}

// GetActivityByPeriod busca atividade por período
func (uc *AuditLogUseCase) GetActivityByPeriod(startDate, endDate time.Time) ([]*entities.AuditLog, error) {
	// Validar datas
	if startDate.IsZero() || endDate.IsZero() {
		return nil, fmt.Errorf("datas de início e fim são obrigatórias")
	}
	if startDate.After(endDate) {
		return nil, fmt.Errorf("data de início deve ser anterior à data de fim")
	}

	// Limitar período máximo a 1 ano
	if endDate.Sub(startDate) > 365*24*time.Hour {
		return nil, fmt.Errorf("período máximo permitido é de 1 ano")
	}

	return uc.auditLogRepo.GetActivityByPeriod(startDate, endDate)
}

// GetMostActiveUsers busca usuários mais ativos
func (uc *AuditLogUseCase) GetMostActiveUsers(limit int, startDate, endDate time.Time) ([]map[string]interface{}, error) {
	// Validar datas
	if startDate.IsZero() || endDate.IsZero() {
		return nil, fmt.Errorf("datas de início e fim são obrigatórias")
	}
	if startDate.After(endDate) {
		return nil, fmt.Errorf("data de início deve ser anterior à data de fim")
	}

	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	return uc.auditLogRepo.GetMostActiveUsers(limit, startDate, endDate)
}

// GetMostCommonActions busca ações mais comuns
func (uc *AuditLogUseCase) GetMostCommonActions(limit int, startDate, endDate time.Time) ([]map[string]interface{}, error) {
	// Validar datas
	if startDate.IsZero() || endDate.IsZero() {
		return nil, fmt.Errorf("datas de início e fim são obrigatórias")
	}
	if startDate.After(endDate) {
		return nil, fmt.Errorf("data de início deve ser anterior à data de fim")
	}

	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	return uc.auditLogRepo.GetMostCommonActions(limit, startDate, endDate)
}

// GetAuditStats retorna estatísticas de auditoria
func (uc *AuditLogUseCase) GetAuditStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total de logs
	total, err := uc.auditLogRepo.CountTotal()
	if err != nil {
		return nil, fmt.Errorf("erro ao contar total de logs: %w", err)
	}
	stats["total_logs"] = total

	// Logs de hoje
	startOfDay := time.Now().Truncate(24 * time.Hour)
	endOfDay := startOfDay.Add(24 * time.Hour)
	todayCount, err := uc.auditLogRepo.CountByDateRange(startOfDay, endOfDay)
	if err != nil {
		return nil, fmt.Errorf("erro ao contar logs de hoje: %w", err)
	}
	stats["today_logs"] = todayCount

	// Logs da semana
	startOfWeek := startOfDay.AddDate(0, 0, -int(startOfDay.Weekday()))
	weekCount, err := uc.auditLogRepo.CountByDateRange(startOfWeek, endOfDay)
	if err != nil {
		return nil, fmt.Errorf("erro ao contar logs da semana: %w", err)
	}
	stats["week_logs"] = weekCount

	// Logs do mês
	startOfMonth := time.Date(startOfDay.Year(), startOfDay.Month(), 1, 0, 0, 0, 0, startOfDay.Location())
	monthCount, err := uc.auditLogRepo.CountByDateRange(startOfMonth, endOfDay)
	if err != nil {
		return nil, fmt.Errorf("erro ao contar logs do mês: %w", err)
	}
	stats["month_logs"] = monthCount

	return stats, nil
}

// CleanupOldLogs limpa logs antigos
func (uc *AuditLogUseCase) CleanupOldLogs(retentionDays int) error {
	if retentionDays <= 0 {
		return fmt.Errorf("dias de retenção deve ser maior que zero")
	}

	// Mínimo de 30 dias de retenção
	if retentionDays < 30 {
		retentionDays = 30
	}

	return uc.auditLogRepo.CleanupOldLogs(retentionDays)
}

// LogUserAction registra uma ação do usuário
func (uc *AuditLogUseCase) LogUserAction(userID uint, action, resource string, resourceID uint, description string, ipAddress, userAgent string) error {
	auditLog := entities.NewAuditLog(&userID, action, resource, &resourceID)
	auditLog.SetDescription(description)
	auditLog.SetRequestInfo(ipAddress, userAgent)

	return uc.CreateAuditLog(auditLog)
}

// LogSystemAction registra uma ação do sistema
func (uc *AuditLogUseCase) LogSystemAction(action, resource string, resourceID uint, description string) error {
	auditLog := entities.NewAuditLog(nil, action, resource, &resourceID) // userID = nil para ações do sistema
	auditLog.SetDescription(description)

	return uc.CreateAuditLog(auditLog)
}
