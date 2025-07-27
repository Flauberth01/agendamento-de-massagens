package mappers

import (
	"agendamento-backend/internal/application/dtos"
	"agendamento-backend/internal/domain/entities"
)

// ToAuditLogEntity converte CreateAuditLogRequest para entidade AuditLog
func ToAuditLogEntity(req *dtos.CreateAuditLogRequest) *entities.AuditLog {
	return &entities.AuditLog{
		UserID:      req.UserID,
		Action:      req.Action,
		Resource:    req.Resource,
		ResourceID:  req.ResourceID,
		Description: req.Description,
		IPAddress:   req.IPAddress,
		UserAgent:   req.UserAgent,
	}
}

// ToAuditLogResponse converte entidade AuditLog para AuditLogResponse
func ToAuditLogResponse(auditLog *entities.AuditLog) *dtos.AuditLogResponse {
	return &dtos.AuditLogResponse{
		ID:          auditLog.ID,
		UserID:      auditLog.UserID,
		Action:      auditLog.Action,
		Resource:    auditLog.Resource,
		ResourceID:  auditLog.ResourceID,
		Description: auditLog.Description,
		IPAddress:   auditLog.IPAddress,
		UserAgent:   auditLog.UserAgent,
		CreatedAt:   auditLog.CreatedAt,
	}
}

// ToCreateAuditLogResponse converte entidade AuditLog para CreateAuditLogResponse
func ToCreateAuditLogResponse(auditLog *entities.AuditLog) *dtos.CreateAuditLogResponse {
	return &dtos.CreateAuditLogResponse{
		ID:          auditLog.ID,
		UserID:      auditLog.UserID,
		Action:      auditLog.Action,
		Resource:    auditLog.Resource,
		ResourceID:  auditLog.ResourceID,
		Description: auditLog.Description,
		IPAddress:   auditLog.IPAddress,
		UserAgent:   auditLog.UserAgent,
		CreatedAt:   auditLog.CreatedAt,
	}
}

// ToAuditLogWithUserResponse converte entidade AuditLog com relacionamento User
func ToAuditLogWithUserResponse(auditLog *entities.AuditLog, user *entities.User) *dtos.AuditLogWithUserResponse {
	response := &dtos.AuditLogWithUserResponse{
		ID:          auditLog.ID,
		UserID:      auditLog.UserID,
		Action:      auditLog.Action,
		Resource:    auditLog.Resource,
		ResourceID:  auditLog.ResourceID,
		Description: auditLog.Description,
		IPAddress:   auditLog.IPAddress,
		UserAgent:   auditLog.UserAgent,
		CreatedAt:   auditLog.CreatedAt,
	}

	if user != nil {
		userResponse := ToResponse(user)
		response.User = userResponse
	}

	return response
}

// ToAuditLogResponseList converte slice de entidades AuditLog para slice de AuditLogResponse
func ToAuditLogResponseList(auditLogs []*entities.AuditLog) []dtos.AuditLogResponse {
	responses := make([]dtos.AuditLogResponse, len(auditLogs))
	for i, auditLog := range auditLogs {
		responses[i] = *ToAuditLogResponse(auditLog)
	}
	return responses
}

// ToAuditLogWithUserResponseList converte slice de entidades AuditLog com relacionamentos para slice de AuditLogWithUserResponse
func ToAuditLogWithUserResponseList(auditLogs []*entities.AuditLog, users map[uint]*entities.User) []*dtos.AuditLogWithUserResponse {
	var responses []*dtos.AuditLogWithUserResponse
	for _, auditLog := range auditLogs {
		var user *entities.User
		if auditLog.UserID != nil {
			user = users[*auditLog.UserID]
		}
		responses = append(responses, ToAuditLogWithUserResponse(auditLog, user))
	}
	return responses
}

// ToListAuditLogsResponse converte dados para ListAuditLogsResponse
func ToListAuditLogsResponse(auditLogs []*entities.AuditLog, total int64, page, limit int) *dtos.ListAuditLogsResponse {
	return &dtos.ListAuditLogsResponse{
		Logs:       ToAuditLogResponseList(auditLogs),
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: int((total + int64(limit) - 1) / int64(limit)),
	}
}

// ToAuditLogStatsResponse converte dados para AuditLogStatsResponse
func ToAuditLogStatsResponse(totalLogs int64, logsByAction, logsByResource, logsByUser map[string]int64, recentLogs []dtos.AuditLogResponse) *dtos.AuditLogStatsResponse {
	return &dtos.AuditLogStatsResponse{
		TotalLogs:      totalLogs,
		LogsByAction:   logsByAction,
		LogsByResource: logsByResource,
		LogsByUser:     logsByUser,
		RecentLogs:     recentLogs,
	}
}

// ToUserActivityResponse converte dados para UserActivityResponse
func ToUserActivityResponse(userID uint, userName string, totalLogs int64, actions, resources map[string]int64, logs []dtos.AuditLogResponse) *dtos.UserActivityResponse {
	return &dtos.UserActivityResponse{
		UserID:    userID,
		UserName:  userName,
		TotalLogs: totalLogs,
		Actions:   actions,
		Resources: resources,
		Logs:      logs,
	}
}

// ToSystemActivityResponse converte dados para SystemActivityResponse
func ToSystemActivityResponse(totalLogs, uniqueUsers int64, actions, resources, activityByDay map[string]int64) *dtos.SystemActivityResponse {
	return &dtos.SystemActivityResponse{
		TotalLogs:     totalLogs,
		UniqueUsers:   uniqueUsers,
		Actions:       actions,
		Resources:     resources,
		ActivityByDay: activityByDay,
	}
}

// ToActivityByPeriodResponse converte dados para ActivityByPeriodResponse
func ToActivityByPeriodResponse(period string, totalLogs int64, logs []dtos.AuditLogResponse, dailyStats map[string]int64) *dtos.ActivityByPeriodResponse {
	return &dtos.ActivityByPeriodResponse{
		Period:     period,
		TotalLogs:  totalLogs,
		Logs:       logs,
		DailyStats: dailyStats,
	}
}
