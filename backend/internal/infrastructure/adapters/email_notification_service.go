package adapters

import (
	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/ports"
	"agendamento-backend/internal/domain/repositories"
)

// EmailNotificationService implementa NotificationService usando EmailRepository
type EmailNotificationService struct {
	emailRepo repositories.EmailRepository
}

// NewEmailNotificationService cria uma nova instância do EmailNotificationService
func NewEmailNotificationService(emailRepo repositories.EmailRepository) ports.NotificationService {
	return &EmailNotificationService{
		emailRepo: emailRepo,
	}
}

// SendEmail envia um email
func (e *EmailNotificationService) SendEmail(to, subject, body string) error {
	// Implementação básica - pode ser expandida conforme necessário
	return nil
}

// SendUserApproval envia email de aprovação de usuário
func (e *EmailNotificationService) SendUserApproval(user interface{}) error {
	if u, ok := user.(*entities.User); ok {
		return e.emailRepo.SendUserApproval(u)
	}
	return nil
}

// SendUserRejection envia email de rejeição de usuário
func (e *EmailNotificationService) SendUserRejection(user interface{}, reason string) error {
	if u, ok := user.(*entities.User); ok {
		return e.emailRepo.SendUserRejection(u, reason)
	}
	return nil
}

// SendBookingConfirmation envia confirmação de agendamento
func (e *EmailNotificationService) SendBookingConfirmation(booking interface{}) error {
	if _, ok := booking.(*entities.Booking); ok {
		// Buscar usuário e cadeira para enviar o email
		// Esta implementação pode ser expandida conforme necessário
		return nil
	}
	return nil
}

// SendBookingCancellation envia cancelamento de agendamento
func (e *EmailNotificationService) SendBookingCancellation(booking interface{}) error {
	if _, ok := booking.(*entities.Booking); ok {
		// Buscar usuário e cadeira para enviar o email
		// Esta implementação pode ser expandida conforme necessário
		return nil
	}
	return nil
}

// SendBookingReminder envia lembrete de agendamento
func (e *EmailNotificationService) SendBookingReminder(booking interface{}) error {
	if _, ok := booking.(*entities.Booking); ok {
		// Buscar usuário e cadeira para enviar o email
		// Esta implementação pode ser expandida conforme necessário
		return nil
	}
	return nil
}

// SendRoleChangeNotification envia notificação de alteração de role
func (e *EmailNotificationService) SendRoleChangeNotification(user interface{}, newRole string) error {
	if u, ok := user.(*entities.User); ok {
		return e.emailRepo.SendRoleChangeNotification(u, newRole)
	}
	return nil
}
