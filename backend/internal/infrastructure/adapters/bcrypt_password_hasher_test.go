package adapters

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewBcryptPasswordHasher(t *testing.T) {
	hasher := NewBcryptPasswordHasher()
	assert.NotNil(t, hasher)
}

func TestBcryptPasswordHasher_Hash(t *testing.T) {
	hasher := NewBcryptPasswordHasher()

	password := "minhasenha123"
	hashedPassword, err := hasher.Hash(password)

	assert.NoError(t, err)
	assert.NotEmpty(t, hashedPassword)
	assert.NotEqual(t, password, hashedPassword)
	assert.Len(t, hashedPassword, 60) // bcrypt sempre gera hash de 60 caracteres
}

func TestBcryptPasswordHasher_Compare_Success(t *testing.T) {
	hasher := NewBcryptPasswordHasher()

	password := "minhasenha123"
	hashedPassword, err := hasher.Hash(password)
	assert.NoError(t, err)

	// Comparar senha correta
	err = hasher.Compare(hashedPassword, password)
	assert.NoError(t, err)
}

func TestBcryptPasswordHasher_Compare_Failure(t *testing.T) {
	hasher := NewBcryptPasswordHasher()

	password := "minhasenha123"
	hashedPassword, err := hasher.Hash(password)
	assert.NoError(t, err)

	// Comparar senha incorreta
	wrongPassword := "senhaincorreta"
	err = hasher.Compare(hashedPassword, wrongPassword)
	assert.Error(t, err)
}

func TestBcryptPasswordHasher_Compare_EmptyPassword(t *testing.T) {
	hasher := NewBcryptPasswordHasher()

	password := "minhasenha123"
	hashedPassword, err := hasher.Hash(password)
	assert.NoError(t, err)

	// Comparar com senha vazia
	err = hasher.Compare(hashedPassword, "")
	assert.Error(t, err)
}

func TestBcryptPasswordHasher_Hash_EmptyPassword(t *testing.T) {
	hasher := NewBcryptPasswordHasher()

	// Hash de senha vazia
	hashedPassword, err := hasher.Hash("")
	assert.NoError(t, err)
	assert.NotEmpty(t, hashedPassword)
}

func TestBcryptPasswordHasher_MultipleHashes(t *testing.T) {
	hasher := NewBcryptPasswordHasher()

	password := "minhasenha123"

	// Gerar múltiplos hashes da mesma senha
	hash1, err1 := hasher.Hash(password)
	hash2, err2 := hasher.Hash(password)

	assert.NoError(t, err1)
	assert.NoError(t, err2)

	// Os hashes devem ser diferentes (salt diferente)
	assert.NotEqual(t, hash1, hash2)

	// Mas ambos devem validar a senha original
	err1 = hasher.Compare(hash1, password)
	err2 = hasher.Compare(hash2, password)

	assert.NoError(t, err1)
	assert.NoError(t, err2)
}
