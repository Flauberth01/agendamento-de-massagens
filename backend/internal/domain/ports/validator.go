package ports

// Validator define a interface para validação de dados
type Validator interface {
	// ValidateStruct valida uma struct usando tags de validação
	ValidateStruct(interface{}) error

	// ValidateField valida um campo específico
	ValidateField(field interface{}, tag string) error
}
