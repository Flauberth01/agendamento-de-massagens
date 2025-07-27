package email

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"strings"
	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/repositories"
)

// EmailService implementa o repositório de email
type EmailService struct {
	config *Config
}

// NewEmailService cria uma nova instância do serviço de email
func NewEmailService(config *Config) repositories.EmailRepository {
	return &EmailService{
		config: config,
	}
}

// SendBookingConfirmation envia email de confirmação de agendamento
func (s *EmailService) SendBookingConfirmation(user *entities.User, booking *entities.Booking) error {
	template := GetBookingConfirmationTemplate()
	data := PrepareTemplateData(user, booking, &booking.Chair, "")
	
	subject, htmlBody, textBody, err := RenderTemplate(template, data)
	if err != nil {
		return fmt.Errorf("erro ao renderizar template: %v", err)
	}
	
	return s.sendEmail(user.Email, subject, htmlBody, textBody)
}

// SendBookingCancellation envia email de cancelamento de agendamento
func (s *EmailService) SendBookingCancellation(user *entities.User, booking *entities.Booking, reason string) error {
	template := GetBookingCancellationTemplate()
	data := PrepareTemplateData(user, booking, &booking.Chair, reason)
	
	subject, htmlBody, textBody, err := RenderTemplate(template, data)
	if err != nil {
		return fmt.Errorf("erro ao renderizar template: %v", err)
	}
	
	return s.sendEmail(user.Email, subject, htmlBody, textBody)
}

// SendBookingReminder envia lembrete de agendamento
func (s *EmailService) SendBookingReminder(user *entities.User, booking *entities.Booking) error {
	template := GetBookingReminderTemplate()
	data := PrepareTemplateData(user, booking, &booking.Chair, "")
	
	subject, htmlBody, textBody, err := RenderTemplate(template, data)
	if err != nil {
		return fmt.Errorf("erro ao renderizar template: %v", err)
	}
	
	return s.sendEmail(user.Email, subject, htmlBody, textBody)
}

// SendUserApproval envia notificação de aprovação de cadastro
func (s *EmailService) SendUserApproval(user *entities.User) error {
	template := GetUserApprovalTemplate()
	data := PrepareTemplateData(user, nil, nil, "")
	
	subject, htmlBody, textBody, err := RenderTemplate(template, data)
	if err != nil {
		return fmt.Errorf("erro ao renderizar template: %v", err)
	}
	
	return s.sendEmail(user.Email, subject, htmlBody, textBody)
}

// SendUserRejection envia notificação de rejeição de cadastro
func (s *EmailService) SendUserRejection(user *entities.User, reason string) error {
	template := GetUserRejectionTemplate()
	data := PrepareTemplateData(user, nil, nil, reason)
	
	subject, htmlBody, textBody, err := RenderTemplate(template, data)
	if err != nil {
		return fmt.Errorf("erro ao renderizar template: %v", err)
	}
	
	return s.sendEmail(user.Email, subject, htmlBody, textBody)
}

// sendEmail envia um email usando SMTP
func (s *EmailService) sendEmail(to, subject, htmlBody, textBody string) error {
	// Configurar autenticação SMTP
	auth := smtp.PlainAuth("", s.config.SMTPUsername, s.config.SMTPPassword, s.config.SMTPHost)
	
	// Preparar cabeçalhos do email
	headers := make(map[string]string)
	headers["From"] = fmt.Sprintf("%s <%s>", s.config.FromName, s.config.FromEmail)
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "multipart/alternative; boundary=\"boundary123\""
	
	// Construir mensagem
	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n"
	
	// Adicionar corpo multipart (texto e HTML)
	message += "--boundary123\r\n"
	message += "Content-Type: text/plain; charset=UTF-8\r\n"
	message += "\r\n"
	message += textBody + "\r\n"
	
	message += "--boundary123\r\n"
	message += "Content-Type: text/html; charset=UTF-8\r\n"
	message += "\r\n"
	message += htmlBody + "\r\n"
	
	message += "--boundary123--\r\n"
	
	// Enviar email
	addr := fmt.Sprintf("%s:%d", s.config.SMTPHost, s.config.SMTPPort)
	
	// Para Gmail e outros provedores que requerem TLS
	if s.config.SMTPPort == 587 {
		return s.sendEmailWithTLS(addr, auth, s.config.FromEmail, []string{to}, []byte(message))
	}
	
	// Para outros provedores
	return smtp.SendMail(addr, auth, s.config.FromEmail, []string{to}, []byte(message))
}

// sendEmailWithTLS envia email usando TLS (necessário para Gmail)
func (s *EmailService) sendEmailWithTLS(addr string, auth smtp.Auth, from string, to []string, msg []byte) error {
	// Conectar ao servidor
	client, err := smtp.Dial(addr)
	if err != nil {
		return fmt.Errorf("erro ao conectar ao servidor SMTP: %v", err)
	}
	defer client.Close()
	
	// Iniciar TLS
	tlsConfig := &tls.Config{
		ServerName: s.config.SMTPHost,
	}
	
	if err = client.StartTLS(tlsConfig); err != nil {
		return fmt.Errorf("erro ao iniciar TLS: %v", err)
	}
	
	// Autenticar
	if err = client.Auth(auth); err != nil {
		return fmt.Errorf("erro na autenticação SMTP: %v", err)
	}
	
	// Definir remetente
	if err = client.Mail(from); err != nil {
		return fmt.Errorf("erro ao definir remetente: %v", err)
	}
	
	// Definir destinatários
	for _, recipient := range to {
		if err = client.Rcpt(recipient); err != nil {
			return fmt.Errorf("erro ao definir destinatário %s: %v", recipient, err)
		}
	}
	
	// Enviar dados
	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("erro ao iniciar envio de dados: %v", err)
	}
	
	_, err = w.Write(msg)
	if err != nil {
		return fmt.Errorf("erro ao escrever mensagem: %v", err)
	}
	
	err = w.Close()
	if err != nil {
		return fmt.Errorf("erro ao finalizar envio: %v", err)
	}
	
	// Finalizar
	return client.Quit()
}

// IsValidEmail verifica se um email é válido
func IsValidEmail(email string) bool {
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}
