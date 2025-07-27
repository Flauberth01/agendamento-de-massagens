package ports

// Logger define a interface para logging
type Logger interface {
	// Debug registra uma mensagem de debug
	Debug(message string, fields ...map[string]interface{})

	// Info registra uma mensagem informativa
	Info(message string, fields ...map[string]interface{})

	// Warn registra uma mensagem de aviso
	Warn(message string, fields ...map[string]interface{})

	// Error registra uma mensagem de erro
	Error(message string, err error, fields ...map[string]interface{})

	// Fatal registra uma mensagem fatal e encerra a aplicação
	Fatal(message string, err error, fields ...map[string]interface{})
}
