package email

import (
	"agendamento-backend/internal/domain/entities"
	"bytes"
	"fmt"
	"html/template"
)

// EmailTemplate representa um template de email
type EmailTemplate struct {
	Subject string
	HTML    string
	Text    string
}

// TemplateData contém os dados para renderização dos templates
type TemplateData struct {
	User     *entities.User
	Booking  *entities.Booking
	Chair    *entities.Chair
	Reason   string
	DateTime string
	Date     string
	Time     string
}

// GetBookingConfirmationTemplate retorna o template de confirmação de agendamento
func GetBookingConfirmationTemplate() *EmailTemplate {
	return &EmailTemplate{
		Subject: "Confirmação de Agendamento - Sistema de agendamento de cadeiras de massagem",
		HTML: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Confirmação de Agendamento</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c5aa0;">Agendamento Confirmado!</h2>
        
        <p>Olá <strong>{{.User.Name}}</strong>,</p>
        
        <p>Seu agendamento foi confirmado com sucesso!</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2c5aa0;">Detalhes do Agendamento:</h3>
            <p><strong>Data:</strong> {{.Date}}</p>
            <p><strong>Horário:</strong> {{.Time}}</p>
            <p><strong>Cadeira:</strong> {{.Chair.Name}}</p>
            <p><strong>Local:</strong> {{.Chair.Location}}</p>
        </div>
        
        <p><strong>Importante:</strong> Chegue com 5 minutos de antecedência.</p>
        
        <p>Em caso de dúvidas, entre em contato conosco.</p>
        
        <p>Atenciosamente,<br>Equipe de agendamento!</p>
    </div>
</body>
</html>`,
		Text: `
Olá {{.User.Name}},

Seu agendamento foi confirmado com sucesso!

Detalhes do Agendamento:
- Data: {{.Date}}
- Horário: {{.Time}}
- Cadeira: {{.Chair.Name}}
- Local: {{.Chair.Location}}

Importante: Chegue com 5 minutos de antecedência.

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Equipe de agendamento
`,
	}
}

// GetBookingCancellationTemplate retorna o template de cancelamento de agendamento
func GetBookingCancellationTemplate() *EmailTemplate {
	return &EmailTemplate{
		Subject: "Agendamento Cancelado - Sistema de agendamento de cadeiras de massagem",
		HTML: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Agendamento Cancelado</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc3545;">Agendamento Cancelado</h2>
        
        <p>Olá <strong>{{.User.Name}}</strong>,</p>
        
        <p>Informamos que seu agendamento foi cancelado.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc3545;">Detalhes do Agendamento Cancelado:</h3>
            <p><strong>Data:</strong> {{.Date}}</p>
            <p><strong>Horário:</strong> {{.Time}}</p>
            <p><strong>Cadeira:</strong> {{.Chair.Name}}</p>
            {{if .Reason}}<p><strong>Motivo:</strong> {{.Reason}}</p>{{end}}
        </div>
        
        <p>Você pode fazer um novo agendamento a qualquer momento através do sistema.</p>
        
        <p>Em caso de dúvidas, entre em contato conosco.</p>
        
        <p>Atenciosamente,<br>Equipe de agendamento</p>
    </div>
</body>
</html>`,
		Text: `
Olá {{.User.Name}},

Informamos que seu agendamento foi cancelado.

Detalhes do Agendamento Cancelado:
- Data: {{.Date}}
- Horário: {{.Time}}
- Cadeira: {{.Chair.Name}}
{{if .Reason}}- Motivo: {{.Reason}}{{end}}

Você pode fazer um novo agendamento a qualquer momento através do sistema.

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Equipe de agendamento
`,
	}
}

// GetBookingReminderTemplate retorna o template de lembrete de agendamento
func GetBookingReminderTemplate() *EmailTemplate {
	return &EmailTemplate{
		Subject: "Lembrete: Seu agendamento é amanhã - Sistema de agendamento de cadeiras de massagem",
		HTML: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lembrete de Agendamento</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #28a745;">Lembrete de Agendamento</h2>
        
        <p>Olá <strong>{{.User.Name}}</strong>,</p>
        
        <p>Este é um lembrete de que você tem um agendamento amanhã!</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #28a745;">Detalhes do Agendamento:</h3>
            <p><strong>Data:</strong> {{.Date}}</p>
            <p><strong>Horário:</strong> {{.Time}}</p>
            <p><strong>Cadeira:</strong> {{.Chair.Name}}</p>
            <p><strong>Local:</strong> {{.Chair.Location}}</p>
        </div>
        
        <p><strong>Lembre-se:</strong> Chegue com 5 minutos de antecedência.</p>
        
        <p>Caso precise cancelar, faça-o com pelo menos 2 horas de antecedência.</p>
        
        <p>Atenciosamente,<br>Equipe de agendamento</p>
    </div>
</body>
</html>`,
		Text: `
Olá {{.User.Name}},

Este é um lembrete de que você tem um agendamento amanhã!

Detalhes do Agendamento:
- Data: {{.Date}}
- Horário: {{.Time}}
- Cadeira: {{.Chair.Name}}
- Local: {{.Chair.Location}}

Lembre-se: Chegue com 5 minutos de antecedência.

Caso precise cancelar, faça-o com pelo menos 2 horas de antecedência.

Atenciosamente,
Equipe de agendamento
`,
	}
}

// GetUserApprovalTemplate retorna o template de aprovação de usuário
func GetUserApprovalTemplate() *EmailTemplate {
	return &EmailTemplate{
		Subject: "Cadastro Aprovado - Sistema de agendamento de cadeiras de massagem",
		HTML: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cadastro Aprovado</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #28a745;">Cadastro Aprovado!</h2>
        
        <p>Olá <strong>{{.User.Name}}</strong>,</p>
        
        <p>Parabéns! Seu cadastro foi aprovado e você já pode utilizar o sistema.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #28a745;">Próximos Passos:</h3>
            <ul>
                <li>Acesse o sistema com seu CPF e senha</li>
                <li>Faça seu primeiro agendamento</li>
            </ul>
        </div>
        
        <p>Bem-vindo(a) ao Sistema de agendamento de cadeiras de massagem!</p>
        
        <p>Atenciosamente,<br>Equipe de agendamento</p>
    </div>
</body>
</html>`,
		Text: `
Olá {{.User.Name}},

Parabéns! Seu cadastro foi aprovado e você já pode utilizar o sistema.

Próximos Passos:
- Acesse o sistema com seu CPF e senha
- Faça seu primeiro agendamento

Bem-vindo(a) ao Sistema de agendamento!

Atenciosamente,
Equipe de agendamento
`,
	}
}

// GetUserRejectionTemplate retorna o template de rejeição de usuário
func GetUserRejectionTemplate() *EmailTemplate {
	return &EmailTemplate{
		Subject: "Cadastro não aprovado - Sistema de agendamento de cadeiras de massagem",
		HTML: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cadastro não aprovado</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc3545;">Cadastro não aprovado</h2>
        
        <p>Olá <strong>{{.User.Name}}</strong>,</p>
        
        <p>Informamos que seu cadastro não foi aprovado neste momento.</p>
        
        {{if .Reason}}
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc3545;">Motivo:</h3>
            <p>{{.Reason}}</p>
        </div>
        {{end}}
        
        <p>Caso tenha dúvidas ou queira esclarecer alguma informação, entre em contato conosco.</p>
        
        <p>Atenciosamente,<br>Equipe de agendamento</p>
    </div>
</body>
</html>`,
		Text: `
Olá {{.User.Name}},

Informamos que seu cadastro não foi aprovado neste momento.

{{if .Reason}}Motivo: {{.Reason}}{{end}}

Caso tenha dúvidas ou queira esclarecer alguma informação, entre em contato conosco.

Atenciosamente,
Equipe de agendamento
`,
	}
}

// RenderTemplate renderiza um template com os dados fornecidos
func RenderTemplate(tmpl *EmailTemplate, data *TemplateData) (subject, htmlBody, textBody string, err error) {
	// Renderizar subject
	subjectTmpl, err := template.New("subject").Parse(tmpl.Subject)
	if err != nil {
		return "", "", "", fmt.Errorf("erro ao parsear template do subject: %v", err)
	}

	var subjectBuf bytes.Buffer
	if err := subjectTmpl.Execute(&subjectBuf, data); err != nil {
		return "", "", "", fmt.Errorf("erro ao renderizar subject: %v", err)
	}
	subject = subjectBuf.String()

	// Renderizar HTML
	htmlTmpl, err := template.New("html").Parse(tmpl.HTML)
	if err != nil {
		return "", "", "", fmt.Errorf("erro ao parsear template HTML: %v", err)
	}

	var htmlBuf bytes.Buffer
	if err := htmlTmpl.Execute(&htmlBuf, data); err != nil {
		return "", "", "", fmt.Errorf("erro ao renderizar HTML: %v", err)
	}
	htmlBody = htmlBuf.String()

	// Renderizar Text
	textTmpl, err := template.New("text").Parse(tmpl.Text)
	if err != nil {
		return "", "", "", fmt.Errorf("erro ao parsear template de texto: %v", err)
	}

	var textBuf bytes.Buffer
	if err := textTmpl.Execute(&textBuf, data); err != nil {
		return "", "", "", fmt.Errorf("erro ao renderizar texto: %v", err)
	}
	textBody = textBuf.String()

	return subject, htmlBody, textBody, nil
}

// PrepareTemplateData prepara os dados para renderização do template
func PrepareTemplateData(user *entities.User, booking *entities.Booking, chair *entities.Chair, reason string) *TemplateData {
	data := &TemplateData{
		User:    user,
		Booking: booking,
		Chair:   chair,
		Reason:  reason,
	}

	if booking != nil {
		// Formatação de data e hora
		data.DateTime = booking.StartTime.Format("02/01/2006 15:04")
		data.Date = booking.StartTime.Format("02/01/2006")
		data.Time = booking.StartTime.Format("15:04")

		// Se não temos chair separado, usar o relacionamento do booking
		if chair == nil && booking.Chair.ID != 0 {
			data.Chair = &booking.Chair
		}
	}

	return data
}
