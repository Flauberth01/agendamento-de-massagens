package email

import (
	"fmt"
	"os"
	"strconv"
)

// Config contém as configurações do serviço de email
type Config struct {
	SMTPHost     string
	SMTPPort     int
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
	FromName     string
}

// NewConfig cria uma nova configuração de email a partir das variáveis de ambiente
func NewConfig() (*Config, error) {
	port, err := strconv.Atoi(getEnvOrDefault("SMTP_PORT", "587"))
	if err != nil {
		return nil, fmt.Errorf("porta SMTP inválida: %v", err)
	}

	config := &Config{
		SMTPHost:     getEnvOrDefault("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     port,
		SMTPUsername: os.Getenv("SMTP_USERNAME"),
		SMTPPassword: os.Getenv("SMTP_PASSWORD"),
		FromEmail:    getEnvOrDefault("FROM_EMAIL", os.Getenv("SMTP_USERNAME")),
		FromName:     getEnvOrDefault("FROM_NAME", "Sistema de Agendamento"),
	}

	if config.SMTPUsername == "" {
		return nil, fmt.Errorf("SMTP_USERNAME é obrigatório")
	}
	if config.SMTPPassword == "" {
		return nil, fmt.Errorf("SMTP_PASSWORD é obrigatório")
	}

	return config, nil
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
