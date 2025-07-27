package errors

import (
	"fmt"
	"net/http"
)

// ErrorType define o tipo de erro
type ErrorType string

const (
	// ErrorTypeValidation erro de validação
	ErrorTypeValidation ErrorType = "VALIDATION_ERROR"
	// ErrorTypeNotFound erro de recurso não encontrado
	ErrorTypeNotFound ErrorType = "NOT_FOUND"
	// ErrorTypeUnauthorized erro de não autorizado
	ErrorTypeUnauthorized ErrorType = "UNAUTHORIZED"
	// ErrorTypeForbidden erro de acesso negado
	ErrorTypeForbidden ErrorType = "FORBIDDEN"
	// ErrorTypeConflict erro de conflito
	ErrorTypeConflict ErrorType = "CONFLICT"
	// ErrorTypeInternal erro interno do servidor
	ErrorTypeInternal ErrorType = "INTERNAL_ERROR"
	// ErrorTypeBadRequest erro de requisição inválida
	ErrorTypeBadRequest ErrorType = "BAD_REQUEST"
)

// AppError representa um erro da aplicação
type AppError struct {
	Type       ErrorType `json:"type"`
	Message    string    `json:"message"`
	Details    string    `json:"details,omitempty"`
	StatusCode int       `json:"-"`
	Err        error     `json:"-"`
}

// Error implementa a interface error
func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s (%s)", e.Type, e.Message, e.Err.Error())
	}
	return fmt.Sprintf("%s: %s", e.Type, e.Message)
}

// Unwrap retorna o erro interno
func (e *AppError) Unwrap() error {
	return e.Err
}

// NewValidationError cria um erro de validação
func NewValidationError(message string, err error) *AppError {
	return &AppError{
		Type:       ErrorTypeValidation,
		Message:    message,
		Details:    "Dados fornecidos não são válidos",
		StatusCode: http.StatusBadRequest,
		Err:        err,
	}
}

// NewNotFoundError cria um erro de recurso não encontrado
func NewNotFoundError(resource string, id interface{}) *AppError {
	return &AppError{
		Type:       ErrorTypeNotFound,
		Message:    fmt.Sprintf("%s não encontrado", resource),
		Details:    fmt.Sprintf("ID: %v", id),
		StatusCode: http.StatusNotFound,
	}
}

// NewUnauthorizedError cria um erro de não autorizado
func NewUnauthorizedError(message string) *AppError {
	return &AppError{
		Type:       ErrorTypeUnauthorized,
		Message:    message,
		Details:    "Token de autenticação inválido ou expirado",
		StatusCode: http.StatusUnauthorized,
	}
}

// NewForbiddenError cria um erro de acesso negado
func NewForbiddenError(message string) *AppError {
	return &AppError{
		Type:       ErrorTypeForbidden,
		Message:    message,
		Details:    "Usuário não tem permissão para realizar esta operação",
		StatusCode: http.StatusForbidden,
	}
}

// NewConflictError cria um erro de conflito
func NewConflictError(message string, err error) *AppError {
	return &AppError{
		Type:       ErrorTypeConflict,
		Message:    message,
		Details:    "Recurso já existe ou está em conflito",
		StatusCode: http.StatusConflict,
		Err:        err,
	}
}

// NewInternalError cria um erro interno
func NewInternalError(message string, err error) *AppError {
	return &AppError{
		Type:       ErrorTypeInternal,
		Message:    message,
		Details:    "Erro interno do servidor",
		StatusCode: http.StatusInternalServerError,
		Err:        err,
	}
}

// NewBadRequestError cria um erro de requisição inválida
func NewBadRequestError(message string, err error) *AppError {
	return &AppError{
		Type:       ErrorTypeBadRequest,
		Message:    message,
		Details:    "Requisição malformada",
		StatusCode: http.StatusBadRequest,
		Err:        err,
	}
}

// IsAppError verifica se um erro é do tipo AppError
func IsAppError(err error) bool {
	_, ok := err.(*AppError)
	return ok
}

// GetAppError converte um erro para AppError se possível
func GetAppError(err error) *AppError {
	if appErr, ok := err.(*AppError); ok {
		return appErr
	}
	return NewInternalError("Erro inesperado", err)
}
