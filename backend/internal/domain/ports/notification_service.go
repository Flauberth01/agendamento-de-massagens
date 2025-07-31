package ports

// NotificationService define a interface para serviços de notificação
type NotificationService interface {
	// SendEmail envia um email
	SendEmail(to, subject, body string) error

	// SendUserApproval envia email de aprovação de usuário
	SendUserApproval(user interface{}) error

	// SendUserRejection envia email de rejeição de usuário
	SendUserRejection(user interface{}, reason string) error

	// SendBookingConfirmation envia confirmação de agendamento
	SendBookingConfirmation(booking interface{}) error

	// SendBookingCancellation envia cancelamento de agendamento
	SendBookingCancellation(booking interface{}) error

	// SendBookingReminder envia lembrete de agendamento
	SendBookingReminder(booking interface{}) error

	// SendRoleChangeNotification envia notificação de alteração de role
	SendRoleChangeNotification(user interface{}, newRole string) error
}
