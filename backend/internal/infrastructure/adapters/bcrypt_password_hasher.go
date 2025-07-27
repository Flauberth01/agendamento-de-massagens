package adapters

import (
	"agendamento-backend/internal/domain/ports"

	"golang.org/x/crypto/bcrypt"
)

// BcryptPasswordHasher implementa PasswordHasher usando bcrypt
type BcryptPasswordHasher struct{}

// NewBcryptPasswordHasher cria uma nova instância do BcryptPasswordHasher
func NewBcryptPasswordHasher() ports.PasswordHasher {
	return &BcryptPasswordHasher{}
}

// Hash criptografa uma senha usando bcrypt
func (h *BcryptPasswordHasher) Hash(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}

// Compare verifica se uma senha corresponde ao hash
func (h *BcryptPasswordHasher) Compare(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
