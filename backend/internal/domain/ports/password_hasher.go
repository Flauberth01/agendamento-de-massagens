package ports

// PasswordHasher define a interface para criptografia de senhas
type PasswordHasher interface {
	// Hash criptografa uma senha em texto plano
	Hash(password string) (string, error)

	// Compare verifica se uma senha em texto plano corresponde ao hash
	Compare(hashedPassword, password string) error
}
