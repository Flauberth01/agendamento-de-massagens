package dtos

import "time"

// CreateAuditLogRequest representa os dados para criar um log de auditoria
type CreateAuditLogRequest struct {
	UserID      *uint  `json:"user_id"`
	Action      string `json:"action" validate:"required"`
	Resource    string `json:"resource" validate:"required"`
	ResourceID  *uint  `json:"resource_id"`
	Description string `json:"description" validate:"max=1000"`
	IPAddress   string `json:"ip_address" validate:"max=45"`
	UserAgent   string `json:"user_agent" validate:"max=500"`
}

// CreateAuditLogResponse representa a resposta da criação de log de auditoria
type CreateAuditLogResponse struct {
	ID          uint      `json:"id"`
	UserID      *uint     `json:"user_id"`
	Action      string    `json:"action"`
	Resource    string    `json:"resource"`
	ResourceID  *uint     `json:"resource_id"`
	Description string    `json:"description"`
	IPAddress   string    `json:"ip_address"`
	UserAgent   string    `json:"user_agent"`
	CreatedAt   time.Time `json:"created_at"`
}

// AuditLogResponse representa um log de auditoria
type AuditLogResponse struct {
	ID          uint      `json:"id"`
	UserID      *uint     `json:"user_id"`
	Action      string    `json:"action"`
	Resource    string    `json:"resource"`
	ResourceID  *uint     `json:"resource_id"`
	Description string    `json:"description"`
	IPAddress   string    `json:"ip_address"`
	UserAgent   string    `json:"user_agent"`
	CreatedAt   time.Time `json:"created_at"`
}

// AuditLogWithUserResponse representa um log de auditoria com dados do usuário
type AuditLogWithUserResponse struct {
	ID          uint          `json:"id"`
	UserID      *uint         `json:"user_id"`
	Action      string        `json:"action"`
	Resource    string        `json:"resource"`
	ResourceID  *uint         `json:"resource_id"`
	Description string        `json:"description"`
	IPAddress   string        `json:"ip_address"`
	UserAgent   string        `json:"user_agent"`
	CreatedAt   time.Time     `json:"created_at"`
	User        *UserResponse `json:"user,omitempty"`
}

// ListAuditLogsRequest representa os parâmetros para listar logs de auditoria
type ListAuditLogsRequest struct {
	Page       int    `json:"page" validate:"min=1"`
	Limit      int    `json:"limit" validate:"min=1,max=100"`
	UserID     *uint  `json:"user_id"`
	Action     string `json:"action"`
	Resource   string `json:"resource"`
	ResourceID *uint  `json:"resource_id"`
	StartDate  string `json:"start_date"`
	EndDate    string `json:"end_date"`
}

// ListAuditLogsResponse representa a resposta da listagem de logs de auditoria
type ListAuditLogsResponse struct {
	Logs       []AuditLogResponse `json:"logs"`
	Total      int64              `json:"total"`
	Page       int                `json:"page"`
	Limit      int                `json:"limit"`
	TotalPages int                `json:"total_pages"`
}

// AuditLogStatsResponse representa estatísticas dos logs de auditoria
type AuditLogStatsResponse struct {
	TotalLogs      int64              `json:"total_logs"`
	LogsByAction   map[string]int64   `json:"logs_by_action"`
	LogsByResource map[string]int64   `json:"logs_by_resource"`
	LogsByUser     map[string]int64   `json:"logs_by_user"`
	RecentLogs     []AuditLogResponse `json:"recent_logs"`
}

// UserActivityResponse representa atividade de um usuário específico
type UserActivityResponse struct {
	UserID    uint               `json:"user_id"`
	UserName  string             `json:"user_name"`
	TotalLogs int64              `json:"total_logs"`
	Actions   map[string]int64   `json:"actions"`
	Resources map[string]int64   `json:"resources"`
	Logs      []AuditLogResponse `json:"logs"`
}

// SystemActivityResponse representa atividade geral do sistema
type SystemActivityResponse struct {
	TotalLogs     int64            `json:"total_logs"`
	UniqueUsers   int64            `json:"unique_users"`
	Actions       map[string]int64 `json:"actions"`
	Resources     map[string]int64 `json:"resources"`
	ActivityByDay map[string]int64 `json:"activity_by_day"`
}

// ActivityByPeriodRequest representa parâmetros para buscar atividade por período
type ActivityByPeriodRequest struct {
	StartDate string `json:"start_date" validate:"required"`
	EndDate   string `json:"end_date" validate:"required"`
	UserID    *uint  `json:"user_id"`
	Action    string `json:"action"`
	Resource  string `json:"resource"`
}

// ActivityByPeriodResponse representa atividade por período
type ActivityByPeriodResponse struct {
	Period     string             `json:"period"`
	TotalLogs  int64              `json:"total_logs"`
	Logs       []AuditLogResponse `json:"logs"`
	DailyStats map[string]int64   `json:"daily_stats"`
}
