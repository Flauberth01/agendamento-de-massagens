package usecases

import (
	"fmt"
	"log"
	"time"
	"agendamento-backend/internal/domain/repositories"
)

// NotificationUseCase gerencia o envio de notificações
type NotificationUseCase struct {
	emailRepo   repositories.EmailRepository
	bookingRepo repositories.BookingRepository
	userRepo    repositories.UserRepository
	chairRepo   repositories.ChairRepository
}

// NewNotificationUseCase cria uma nova instância do caso de uso de notificações
func NewNotificationUseCase(
	emailRepo repositories.EmailRepository,
	bookingRepo repositories.BookingRepository,
	userRepo repositories.UserRepository,
	chairRepo repositories.ChairRepository,
) *NotificationUseCase {
	return &NotificationUseCase{
		emailRepo:   emailRepo,
		bookingRepo: bookingRepo,
		userRepo:    userRepo,
		chairRepo:   chairRepo,
	}
}

// SendBookingConfirmation envia confirmação de agendamento
func (uc *NotificationUseCase) SendBookingConfirmation(bookingID uint) error {
	// Buscar agendamento com relacionamentos
	booking, err := uc.bookingRepo.GetByID(bookingID)
	if err != nil {
		return fmt.Errorf("erro ao buscar agendamento: %v", err)
	}

	// Buscar usuário
	user, err := uc.userRepo.GetByID(booking.UserID)
	if err != nil {
		return fmt.Errorf("erro ao buscar usuário: %v", err)
	}

	// Buscar cadeira
	chair, err := uc.chairRepo.GetByID(booking.ChairID)
	if err != nil {
		return fmt.Errorf("erro ao buscar cadeira: %v", err)
	}

	// Atualizar relacionamentos no booking
	booking.User = *user
	booking.Chair = *chair

	// Enviar email
	if err := uc.emailRepo.SendBookingConfirmation(user, booking); err != nil {
		log.Printf("Erro ao enviar email de confirmação para %s: %v", user.Email, err)
		return fmt.Errorf("erro ao enviar email de confirmação: %v", err)
	}

	log.Printf("Email de confirmação enviado para %s (Agendamento ID: %d)", user.Email, bookingID)
	return nil
}

// SendBookingCancellation envia notificação de cancelamento
func (uc *NotificationUseCase) SendBookingCancellation(bookingID uint, reason string) error {
	// Buscar agendamento
	booking, err := uc.bookingRepo.GetByID(bookingID)
	if err != nil {
		return fmt.Errorf("erro ao buscar agendamento: %v", err)
	}

	// Buscar usuário
	user, err := uc.userRepo.GetByID(booking.UserID)
	if err != nil {
		return fmt.Errorf("erro ao buscar usuário: %v", err)
	}

	// Buscar cadeira
	chair, err := uc.chairRepo.GetByID(booking.ChairID)
	if err != nil {
		return fmt.Errorf("erro ao buscar cadeira: %v", err)
	}

	// Atualizar relacionamentos
	booking.User = *user
	booking.Chair = *chair

	// Enviar email
	if err := uc.emailRepo.SendBookingCancellation(user, booking, reason); err != nil {
		log.Printf("Erro ao enviar email de cancelamento para %s: %v", user.Email, err)
		return fmt.Errorf("erro ao enviar email de cancelamento: %v", err)
	}

	log.Printf("Email de cancelamento enviado para %s (Agendamento ID: %d)", user.Email, bookingID)
	return nil
}

// SendBookingReminder envia lembrete de agendamento
func (uc *NotificationUseCase) SendBookingReminder(bookingID uint) error {
	// Buscar agendamento
	booking, err := uc.bookingRepo.GetByID(bookingID)
	if err != nil {
		return fmt.Errorf("erro ao buscar agendamento: %v", err)
	}

	// Verificar se o agendamento é para amanhã
	tomorrow := time.Now().AddDate(0, 0, 1)
	if !isSameDay(booking.StartTime, tomorrow) {
		return fmt.Errorf("agendamento não é para amanhã")
	}

	// Buscar usuário
	user, err := uc.userRepo.GetByID(booking.UserID)
	if err != nil {
		return fmt.Errorf("erro ao buscar usuário: %v", err)
	}

	// Buscar cadeira
	chair, err := uc.chairRepo.GetByID(booking.ChairID)
	if err != nil {
		return fmt.Errorf("erro ao buscar cadeira: %v", err)
	}

	// Atualizar relacionamentos
	booking.User = *user
	booking.Chair = *chair

	// Enviar email
	if err := uc.emailRepo.SendBookingReminder(user, booking); err != nil {
		log.Printf("Erro ao enviar lembrete para %s: %v", user.Email, err)
		return fmt.Errorf("erro ao enviar lembrete: %v", err)
	}

	log.Printf("Lembrete enviado para %s (Agendamento ID: %d)", user.Email, bookingID)
	return nil
}

// SendUserApproval envia notificação de aprovação de usuário
func (uc *NotificationUseCase) SendUserApproval(userID uint) error {
	// Buscar usuário
	user, err := uc.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("erro ao buscar usuário: %v", err)
	}

	// Enviar email
	if err := uc.emailRepo.SendUserApproval(user); err != nil {
		log.Printf("Erro ao enviar email de aprovação para %s: %v", user.Email, err)
		return fmt.Errorf("erro ao enviar email de aprovação: %v", err)
	}

	log.Printf("Email de aprovação enviado para %s (Usuário ID: %d)", user.Email, userID)
	return nil
}

// SendUserRejection envia notificação de rejeição de usuário
func (uc *NotificationUseCase) SendUserRejection(userID uint, reason string) error {
	// Buscar usuário
	user, err := uc.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("erro ao buscar usuário: %v", err)
	}

	// Enviar email
	if err := uc.emailRepo.SendUserRejection(user, reason); err != nil {
		log.Printf("Erro ao enviar email de rejeição para %s: %v", user.Email, err)
		return fmt.Errorf("erro ao enviar email de rejeição: %v", err)
	}

	log.Printf("Email de rejeição enviado para %s (Usuário ID: %d)", user.Email, userID)
	return nil
}

// SendDailyReminders envia lembretes para todos os agendamentos de amanhã
func (uc *NotificationUseCase) SendDailyReminders() error {
	// Calcular data de amanhã
	tomorrow := time.Now().AddDate(0, 0, 1)
	startOfDay := time.Date(tomorrow.Year(), tomorrow.Month(), tomorrow.Day(), 0, 0, 0, 0, tomorrow.Location())
	endOfDay := startOfDay.AddDate(0, 0, 1).Add(-time.Nanosecond)

	// Buscar agendamentos de amanhã
	bookings, err := uc.bookingRepo.GetBookingsByDateRange(startOfDay, endOfDay)
	if err != nil {
		return fmt.Errorf("erro ao buscar agendamentos de amanhã: %v", err)
	}

	successCount := 0
	errorCount := 0

	// Enviar lembrete para cada agendamento
	for _, booking := range bookings {
		// Apenas para agendamentos confirmados
		if booking.Status == "confirmado" {
			if err := uc.SendBookingReminder(booking.ID); err != nil {
				log.Printf("Erro ao enviar lembrete para agendamento %d: %v", booking.ID, err)
				errorCount++
			} else {
				successCount++
			}
		}
	}

	log.Printf("Lembretes diários enviados: %d sucessos, %d erros", successCount, errorCount)
	return nil
}

// isSameDay verifica se duas datas são do mesmo dia
func isSameDay(date1, date2 time.Time) bool {
	y1, m1, d1 := date1.Date()
	y2, m2, d2 := date2.Date()
	return y1 == y2 && m1 == m2 && d1 == d2
}
