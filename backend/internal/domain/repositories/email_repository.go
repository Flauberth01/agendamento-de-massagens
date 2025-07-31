package repositories

import "agendamento-backend/internal/domain/entities"

// EmailRepository define a interface para envio de emails
type EmailRepository interface {
	// SendBookingConfirmation envia email de confirmação de agendamento
	SendBookingConfirmation(user *entities.User, booking *entities.Booking) error

	// SendBookingCancellation envia email de cancelamento de agendamento
	SendBookingCancellation(user *entities.User, booking *entities.Booking, reason string) error

	// SendBookingReminder envia lembrete de agendamento
	SendBookingReminder(user *entities.User, booking *entities.Booking) error

	// SendUserApproval envia notificação de aprovação de cadastro
	SendUserApproval(user *entities.User) error

	// SendUserRejection envia notificação de rejeição de cadastro
	SendUserRejection(user *entities.User, reason string) error

	// SendRoleChangeNotification envia notificação de alteração de role
	SendRoleChangeNotification(user *entities.User, newRole string) error
}
