package adapters

import (
	"agendamento-backend/internal/domain/ports"
	"agendamento-backend/pkg/validator"
)

// ValidatorAdapter implementa Validator usando o validator existente
type ValidatorAdapter struct {
	validator *validator.Validator
}

// NewValidatorAdapter cria uma nova instância do ValidatorAdapter
func NewValidatorAdapter() ports.Validator {
	return &ValidatorAdapter{
		validator: validator.New(),
	}
}

// ValidateStruct valida uma struct usando tags de validação
func (v *ValidatorAdapter) ValidateStruct(s interface{}) error {
	return v.validator.ValidateStruct(s)
}

// ValidateField valida um campo específico
func (v *ValidatorAdapter) ValidateField(field interface{}, tag string) error {
	// Implementação básica - pode ser expandida conforme necessário
	return v.validator.ValidateStruct(field)
}
