package adapters

import (
	"log"
	"agendamento-backend/internal/domain/ports"
)

// LoggerAdapter implementa Logger usando o logger padrão do Go
type LoggerAdapter struct{}

// NewLoggerAdapter cria uma nova instância do LoggerAdapter
func NewLoggerAdapter() ports.Logger {
	return &LoggerAdapter{}
}

// Debug registra uma mensagem de debug
func (l *LoggerAdapter) Debug(message string, fields ...map[string]interface{}) {
	log.Printf("[DEBUG] %s", message)
}

// Info registra uma mensagem informativa
func (l *LoggerAdapter) Info(message string, fields ...map[string]interface{}) {
	log.Printf("[INFO] %s", message)
}

// Warn registra uma mensagem de aviso
func (l *LoggerAdapter) Warn(message string, fields ...map[string]interface{}) {
	log.Printf("[WARN] %s", message)
}

// Error registra uma mensagem de erro
func (l *LoggerAdapter) Error(message string, err error, fields ...map[string]interface{}) {
	if err != nil {
		log.Printf("[ERROR] %s: %v", message, err)
	} else {
		log.Printf("[ERROR] %s", message)
	}
}

// Fatal registra uma mensagem fatal e encerra a aplicação
func (l *LoggerAdapter) Fatal(message string, err error, fields ...map[string]interface{}) {
	if err != nil {
		log.Fatalf("[FATAL] %s: %v", message, err)
	} else {
		log.Fatalf("[FATAL] %s", message)
	}
}
