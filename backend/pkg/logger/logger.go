package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var log *zap.Logger

// InitLogger inicializa o logger estruturado
func InitLogger() {
	config := zap.NewProductionConfig()

	// Configurar nível de log baseado em variável de ambiente
	logLevel := os.Getenv("LOG_LEVEL")
	switch logLevel {
	case "debug":
		config.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
	case "info":
		config.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	case "warn":
		config.Level = zap.NewAtomicLevelAt(zap.WarnLevel)
	case "error":
		config.Level = zap.NewAtomicLevelAt(zap.ErrorLevel)
	default:
		config.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	}

	// Configurar formato de timestamp
	config.EncoderConfig.TimeKey = "timestamp"
	config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	config.EncoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder

	// Configurar saída
	if os.Getenv("LOG_FORMAT") == "console" {
		config.Encoding = "console"
	} else {
		config.Encoding = "json"
	}

	var err error
	log, err = config.Build()
	if err != nil {
		panic("failed to initialize logger: " + err.Error())
	}
}

// GetLogger retorna a instância do logger
func GetLogger() *zap.Logger {
	if log == nil {
		InitLogger()
	}
	return log
}

// Info loga uma mensagem de informação
func Info(msg string, fields ...zap.Field) {
	GetLogger().Info(msg, fields...)
}

// Debug loga uma mensagem de debug
func Debug(msg string, fields ...zap.Field) {
	GetLogger().Debug(msg, fields...)
}

// Warn loga uma mensagem de aviso
func Warn(msg string, fields ...zap.Field) {
	GetLogger().Warn(msg, fields...)
}

// Error loga uma mensagem de erro
func Error(msg string, fields ...zap.Field) {
	GetLogger().Error(msg, fields...)
}

// Fatal loga uma mensagem fatal e termina a aplicação
func Fatal(msg string, fields ...zap.Field) {
	GetLogger().Fatal(msg, fields...)
}

// WithContext cria um logger com contexto adicional
func WithContext(fields ...zap.Field) *zap.Logger {
	return GetLogger().With(fields...)
}

// WithRequest cria um logger com contexto de requisição HTTP
func WithRequest(method, path, userAgent string, userID uint) *zap.Logger {
	return GetLogger().With(
		zap.String("method", method),
		zap.String("path", path),
		zap.String("user_agent", userAgent),
		zap.Uint("user_id", userID),
	)
}

// WithUser cria um logger com contexto de usuário
func WithUser(userID uint, userRole string) *zap.Logger {
	return GetLogger().With(
		zap.Uint("user_id", userID),
		zap.String("user_role", userRole),
	)
}

// WithError cria um logger com contexto de erro
func WithError(err error) *zap.Logger {
	return GetLogger().With(zap.Error(err))
}

// Sync sincroniza o logger (deve ser chamado antes de sair da aplicação)
func Sync() {
	if log != nil {
		log.Sync()
	}
}
