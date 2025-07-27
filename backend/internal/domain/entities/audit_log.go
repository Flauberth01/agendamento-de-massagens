package entities

import (
	"time"
)

type AuditLog struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      *uint     `json:"user_id" gorm:"index"`
	Action      string    `json:"action" gorm:"size:100;not null" validate:"required"`
	Resource    string    `json:"resource" gorm:"size:100;not null" validate:"required"`
	ResourceID  *uint     `json:"resource_id"`
	OldValues   string    `json:"old_values" gorm:"type:text"`
	NewValues   string    `json:"new_values" gorm:"type:text"`
	IPAddress   string    `json:"ip_address" gorm:"size:45"`
	UserAgent   string    `json:"user_agent" gorm:"size:500"`
	Description string    `json:"description" gorm:"size:500"`
	CreatedAt   time.Time `json:"created_at"`

	// Relacionamentos
	User *User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// TableName especifica o nome da tabela
func (AuditLog) TableName() string {
	return "audit_logs"
}

// Constantes para ações de auditoria
const (
	ActionCreate = "CREATE"
	ActionUpdate = "UPDATE"
	ActionDelete = "DELETE"
	ActionLogin  = "LOGIN"
	ActionLogout = "LOGOUT"
	ActionApprove = "APPROVE"
	ActionReject  = "REJECT"
	ActionCancel  = "CANCEL"
	ActionConfirm = "CONFIRM"
)

// Constantes para recursos
const (
	ResourceUser        = "USER"
	ResourceChair       = "CHAIR"
	ResourceBooking     = "BOOKING"
	ResourceAvailability = "AVAILABILITY"
	ResourceAuth        = "AUTH"
)

// NewAuditLog cria um novo log de auditoria
func NewAuditLog(userID *uint, action, resource string, resourceID *uint) *AuditLog {
	return &AuditLog{
		UserID:     userID,
		Action:     action,
		Resource:   resource,
		ResourceID: resourceID,
		CreatedAt:  time.Now(),
	}
}

// SetValues define os valores antigos e novos
func (a *AuditLog) SetValues(oldValues, newValues string) {
	a.OldValues = oldValues
	a.NewValues = newValues
}

// SetRequestInfo define informações da requisição
func (a *AuditLog) SetRequestInfo(ipAddress, userAgent string) {
	a.IPAddress = ipAddress
	a.UserAgent = userAgent
}

// SetDescription define uma descrição para o log
func (a *AuditLog) SetDescription(description string) {
	a.Description = description
}

// IsUserAction verifica se a ação foi realizada por um usuário
func (a *AuditLog) IsUserAction() bool {
	return a.UserID != nil
}

// IsSystemAction verifica se a ação foi realizada pelo sistema
func (a *AuditLog) IsSystemAction() bool {
	return a.UserID == nil
}

// GetActionDescription retorna uma descrição da ação
func (a *AuditLog) GetActionDescription() string {
	switch a.Action {
	case ActionCreate:
		return "Criação"
	case ActionUpdate:
		return "Atualização"
	case ActionDelete:
		return "Exclusão"
	case ActionLogin:
		return "Login"
	case ActionLogout:
		return "Logout"
	case ActionApprove:
		return "Aprovação"
	case ActionReject:
		return "Rejeição"
	case ActionCancel:
		return "Cancelamento"
	case ActionConfirm:
		return "Confirmação"
	default:
		return a.Action
	}
}

// GetResourceDescription retorna uma descrição do recurso
func (a *AuditLog) GetResourceDescription() string {
	switch a.Resource {
	case ResourceUser:
		return "Usuário"
	case ResourceChair:
		return "Cadeira"
	case ResourceBooking:
		return "Agendamento"
	case ResourceAvailability:
		return "Disponibilidade"
	case ResourceAuth:
		return "Autenticação"
	default:
		return a.Resource
	}
}
