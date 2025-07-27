package validator

import (
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/go-playground/validator/v10"
)

type Validator struct {
	validator *validator.Validate
}

func New() *Validator {
	v := validator.New()
	
	// Registrar validações customizadas
	v.RegisterValidation("cpf", validateCPF)
	
	return &Validator{
		validator: v,
	}
}

func (v *Validator) ValidateStruct(s interface{}) error {
	err := v.validator.Struct(s)
	if err != nil {
		return v.formatValidationErrors(err)
	}
	return nil
}

func (v *Validator) formatValidationErrors(err error) error {
	var validationErrors validator.ValidationErrors
	if errors.As(err, &validationErrors) {
		var messages []string
		for _, e := range validationErrors {
			messages = append(messages, v.getErrorMessage(e))
		}
		return errors.New(strings.Join(messages, ", "))
	}
	return err
}

func (v *Validator) getErrorMessage(e validator.FieldError) string {
	field := e.Field()
	tag := e.Tag()
	param := e.Param()

	switch tag {
	case "required":
		return fmt.Sprintf("%s é obrigatório", field)
	case "email":
		return fmt.Sprintf("%s deve ser um email válido", field)
	case "min":
		return fmt.Sprintf("%s deve ter pelo menos %s caracteres", field, param)
	case "max":
		return fmt.Sprintf("%s deve ter no máximo %s caracteres", field, param)
	case "cpf":
		return fmt.Sprintf("%s deve ser um CPF válido", field)
	case "oneof":
		return fmt.Sprintf("%s deve ser um dos valores: %s", field, param)
	default:
		return fmt.Sprintf("%s é inválido", field)
	}
}

// validateCPF valida se o CPF é válido
func validateCPF(fl validator.FieldLevel) bool {
	cpf := fl.Field().String()
	return isValidCPF(cpf)
}

// isValidCPF verifica se o CPF é válido
func isValidCPF(cpf string) bool {
	// Remove caracteres não numéricos
	re := regexp.MustCompile(`[^0-9]`)
	cpf = re.ReplaceAllString(cpf, "")

	// Verifica se tem 11 dígitos
	if len(cpf) != 11 {
		return false
	}

	// Verifica se todos os dígitos são iguais
	if cpf == "00000000000" || cpf == "11111111111" || cpf == "22222222222" ||
		cpf == "33333333333" || cpf == "44444444444" || cpf == "55555555555" ||
		cpf == "66666666666" || cpf == "77777777777" || cpf == "88888888888" ||
		cpf == "99999999999" {
		return false
	}

	// Calcula o primeiro dígito verificador
	sum := 0
	for i := 0; i < 9; i++ {
		digit, _ := strconv.Atoi(string(cpf[i]))
		sum += digit * (10 - i)
	}
	remainder := sum % 11
	firstDigit := 0
	if remainder >= 2 {
		firstDigit = 11 - remainder
	}

	// Verifica o primeiro dígito
	if firstDigit != int(cpf[9]-'0') {
		return false
	}

	// Calcula o segundo dígito verificador
	sum = 0
	for i := 0; i < 10; i++ {
		digit, _ := strconv.Atoi(string(cpf[i]))
		sum += digit * (11 - i)
	}
	remainder = sum % 11
	secondDigit := 0
	if remainder >= 2 {
		secondDigit = 11 - remainder
	}

	// Verifica o segundo dígito
	return secondDigit == int(cpf[10]-'0')
}

// FormatCPF formata o CPF com pontos e traço
func FormatCPF(cpf string) string {
	re := regexp.MustCompile(`[^0-9]`)
	cpf = re.ReplaceAllString(cpf, "")
	
	if len(cpf) != 11 {
		return cpf
	}
	
	return fmt.Sprintf("%s.%s.%s-%s", cpf[0:3], cpf[3:6], cpf[6:9], cpf[9:11])
}

// CleanCPF remove formatação do CPF
func CleanCPF(cpf string) string {
	re := regexp.MustCompile(`[^0-9]`)
	return re.ReplaceAllString(cpf, "")
}
