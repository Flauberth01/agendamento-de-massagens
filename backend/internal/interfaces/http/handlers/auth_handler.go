package handlers

import (
	"net/http"
	"strings"
	"time"

	"agendamento-backend/internal/application/usecases"
	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/ports"
	"agendamento-backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userUseCase     *usecases.UserUseCase
	auditLogUseCase *usecases.AuditLogUseCase
	passwordHasher  ports.PasswordHasher
}

func NewAuthHandler(
	userUseCase *usecases.UserUseCase,
	auditLogUseCase *usecases.AuditLogUseCase,
	passwordHasher ports.PasswordHasher,
) *AuthHandler {
	return &AuthHandler{
		userUseCase:     userUseCase,
		auditLogUseCase: auditLogUseCase,
		passwordHasher:  passwordHasher,
	}
}

// LoginRequest representa os dados de login
// swagger:model LoginRequest
type LoginRequest struct {
	// CPF do usuário (apenas números, pontos e hífen serão removidos automaticamente)
	// required: true
	// example: "123.456.789-09"
	CPF string `json:"cpf" binding:"required" validate:"required,cpf"`

	// Senha do usuário (mínimo 6 caracteres)
	// required: true
	// example: "minhasenha123"
	Password string `json:"password" binding:"required" validate:"required,min=6"`
}

// LoginResponse representa a resposta do login
// swagger:model LoginResponse
type LoginResponse struct {
	// Token JWT para autenticação (válido por 24 horas)
	// example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	Token string `json:"token"`

	// Refresh token para renovar o token principal (válido por 7 dias)
	// example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	RefreshToken string `json:"refresh_token"`

	// Dados do usuário autenticado
	User map[string]interface{} `json:"user"`

	// Data e hora de expiração do token
	// example: "2024-01-15T10:30:00Z"
	ExpiresAt time.Time `json:"expires_at"`
}

// RefreshRequest representa a requisição de refresh
// swagger:model RefreshRequest
type RefreshRequest struct {
	// Refresh token obtido no login
	// required: true
	// example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// RefreshResponse representa a resposta do refresh
// swagger:model RefreshResponse
type RefreshResponse struct {
	// Novo token JWT para autenticação
	// example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	Token string `json:"token"`

	// Novo refresh token
	// example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	RefreshToken string `json:"refresh_token"`

	// Nova data e hora de expiração
	// example: "2024-01-15T10:30:00Z"
	ExpiresAt time.Time `json:"expires_at"`
}

// RegisterRequest representa os dados de registro
// swagger:model RegisterRequest
type RegisterRequest struct {
	// Nome completo do usuário
	// required: true
	// example: "João Silva"
	Name string `json:"name" binding:"required" validate:"required,min=2"`

	// CPF do usuário (apenas números, pontos e hífen serão removidos automaticamente)
	// required: true
	// example: "123.456.789-09"
	CPF string `json:"cpf" binding:"required" validate:"required,cpf"`

	// Email do usuário
	// required: true
	// example: "joao@example.com"
	Email string `json:"email" binding:"required" validate:"required,email"`

	// Telefone do usuário
	// required: true
	// example: "11999999999"
	Phone string `json:"phone" binding:"required" validate:"required,min=10"`

	// Senha do usuário (mínimo 6 caracteres)
	// required: true
	// example: "minhasenha123"
	Password string `json:"password" binding:"required" validate:"required,min=6"`

	// Gênero do usuário
	// required: true
	// enum: masculino,feminino,outro
	// example: "masculino"
	Gender string `json:"gender" binding:"required" validate:"required,oneof=masculino feminino outro"`

	// Função/cargo do usuário
	// required: true
	// example: "Desenvolvedor"
	Function string `json:"function" binding:"required" validate:"required"`

	// Posição hierárquica
	// required: true
	// example: "Junior"
	Position string `json:"position" binding:"required" validate:"required"`

	// Matrícula do usuário
	// required: true
	// example: "12345"
	Registration string `json:"registration" binding:"required" validate:"required"`

	// Setor de trabalho
	// required: true
	// example: "TI"
	Sector string `json:"sector" binding:"required" validate:"required"`

	// Data de nascimento
	// required: true
	// example: "1990-01-15T00:00:00Z"
	BirthDate *time.Time `json:"birth_date" binding:"required" validate:"required"`

	// Role solicitado pelo usuário
	// required: true
	// enum: usuario,atendente,admin
	// example: "usuario"
	RequestedRole string `json:"requested_role" binding:"required" validate:"required,oneof=usuario atendente admin"`
}

// RegisterResponse representa a resposta do registro
// swagger:model RegisterResponse
type RegisterResponse struct {
	// ID do usuário criado
	// example: 1
	ID uint `json:"id"`

	// Nome do usuário
	// example: "João Silva"
	Name string `json:"name"`

	// Email do usuário
	// example: "joao@example.com"
	Email string `json:"email"`

	// Status do usuário (sempre "pendente" para novos registros)
	// example: "pendente"
	Status string `json:"status"`

	// Role atribuído (sempre "usuario" para novos registros)
	// example: "usuario"
	Role string `json:"role"`

	// Mensagem informativa
	// example: "Usuário registrado com sucesso. Aguarde aprovação."
	Message string `json:"message"`
}

// Login autentica um usuário usando CPF e senha
// @Summary Autenticar usuário
// @Description Autentica um usuário usando CPF e senha e retorna um token JWT
// @Tags auth
// @Accept json
// @Produce json
// @Param login body LoginRequest true "Dados de login"
// @Success 200 {object} LoginResponse "Login realizado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "CPF ou senha inválidos ou usuário não aprovado"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var loginRequest struct {
		CPF      string `json:"cpf" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + err.Error()})
		return
	}

	// Normalizar CPF (remover pontos e hífen)
	cpf := normalizeCPF(loginRequest.CPF)

	// Buscar usuário por CPF
	user, err := h.userUseCase.GetUserByCPF(cpf)
	if err != nil {
		// Log de tentativa de login com CPF inválido
		h.auditLogUseCase.LogSystemAction(entities.ActionLogin, entities.ResourceAuth, 0, "Tentativa de login com CPF inválido: "+cpf)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "CPF ou senha inválidos"})
		return
	}

	// Verificar senha
	if err := h.passwordHasher.Compare(user.Password, loginRequest.Password); err != nil {
		// Log de tentativa de login com senha inválida
		h.auditLogUseCase.LogUserAction(user.ID, entities.ActionLogin, entities.ResourceAuth, user.ID, "Tentativa de login com senha inválida", c.ClientIP(), c.GetHeader("User-Agent"))
		c.JSON(http.StatusUnauthorized, gin.H{"error": "CPF ou senha inválidos"})
		return
	}

	// Verificar se o usuário está aprovado
	if user.Status != "aprovado" {
		// Log de tentativa de login com usuário não aprovado
		h.auditLogUseCase.LogUserAction(user.ID, entities.ActionLogin, entities.ResourceAuth, user.ID, "Tentativa de login com usuário não aprovado. Status: "+user.Status, c.ClientIP(), c.GetHeader("User-Agent"))

		// Mensagem amigável baseada no status
		var message string
		switch user.Status {
		case "pendente":
			message = "Seu cadastro ainda não foi aprovado. Por favor, aguarde a aprovação de um administrador ou atendente."
		case "rejeitado":
			message = "Seu cadastro foi rejeitado. Entre em contato com o administrador para mais informações."
		case "suspenso":
			message = "Sua conta está suspensa. Entre em contato com o administrador para mais informações."
		default:
			message = "Seu cadastro ainda não foi aprovado. Por favor, aguarde a aprovação."
		}

		c.JSON(http.StatusUnauthorized, gin.H{"error": message})
		return
	}

	// Atualizar último login
	if err := h.userUseCase.UpdateLastLogin(user.ID); err != nil {
		// Log do erro, mas não falha o login
		h.auditLogUseCase.LogSystemAction(entities.ActionUpdate, entities.ResourceUser, user.ID, "Erro ao atualizar último login: "+err.Error())
	}

	// Log de login bem-sucedido
	h.auditLogUseCase.LogUserAction(user.ID, entities.ActionLogin, entities.ResourceAuth, user.ID, "Login realizado com sucesso", c.ClientIP(), c.GetHeader("User-Agent"))

	// Gerar tokens
	token, expiresAt, err := middleware.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token"})
		return
	}

	refreshToken, _, err := middleware.GenerateRefreshToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar refresh token"})
		return
	}

	// Preparar dados do usuário para resposta
	userData := map[string]interface{}{
		"id":             user.ID,
		"name":           user.Name,
		"email":          user.Email,
		"cpf":            user.CPF,
		"phone":          user.Phone,
		"role":           user.Role,
		"requested_role": user.RequestedRole,
		"status":         user.Status,
		"function":       user.Function,
		"position":       user.Position,
		"registration":   user.Registration,
		"sector":         user.Sector,
		"gender":         user.Gender,
		"created_at":     user.CreatedAt,
		"updated_at":     user.UpdatedAt,
		"last_login":     user.LastLogin,
	}

	response := LoginResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User:         userData,
		ExpiresAt:    expiresAt,
	}

	c.JSON(http.StatusOK, response)
}

// Register registra um novo usuário
// @Summary Registrar novo usuário
// @Description Registra um novo usuário no sistema. O usuário será criado com status "pendente" e aguardará aprovação.
// @Tags auth
// @Accept json
// @Produce json
// @Param register body RegisterRequest true "Dados do novo usuário"
// @Success 201 {object} RegisterResponse "Usuário registrado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 409 {object} map[string]string "CPF ou email já cadastrado"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var registerRequest RegisterRequest

	if err := c.ShouldBindJSON(&registerRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + err.Error()})
		return
	}

	// Normalizar CPF (remover pontos e hífen)
	cpf := normalizeCPF(registerRequest.CPF)

	// Verificar se CPF já existe
	if user, err := h.userUseCase.GetUserByCPF(cpf); err == nil && user != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "CPF já está cadastrado"})
		return
	}

	// Verificar se email já existe
	if user, err := h.userUseCase.GetUserByEmail(registerRequest.Email); err == nil && user != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email já está cadastrado"})
		return
	}

	// Criar entidade User
	user := &entities.User{
		Name:          registerRequest.Name,
		CPF:           cpf,
		Email:         registerRequest.Email,
		Phone:         registerRequest.Phone,
		Password:      registerRequest.Password,
		Gender:        registerRequest.Gender,
		Function:      registerRequest.Function,
		Position:      registerRequest.Position,
		Registration:  registerRequest.Registration,
		Sector:        registerRequest.Sector,
		BirthDate:     registerRequest.BirthDate,
		RequestedRole: registerRequest.RequestedRole,
	}

	// Definir valores padrão
	user.SetDefaultValues()

	// Criar usuário (0 = criado pelo sistema)
	createdBy := uint(0)
	if err := h.userUseCase.CreateUser(user, &createdBy); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log de auditoria
	h.auditLogUseCase.LogSystemAction(entities.ActionCreate, entities.ResourceUser, user.ID, "Novo usuário registrado via endpoint público")

	// Preparar resposta
	response := RegisterResponse{
		ID:      user.ID,
		Name:    user.Name,
		Email:   user.Email,
		Status:  user.Status,
		Role:    user.Role,
		Message: "Usuário registrado com sucesso. Aguarde aprovação de um administrador ou atendente.",
	}

	c.JSON(http.StatusCreated, response)
}

// Refresh renova o token JWT usando o refresh token
// @Summary Renovar token
// @Description Renova o token JWT usando o refresh token válido
// @Tags auth
// @Accept json
// @Produce json
// @Param refresh body RefreshRequest true "Refresh token"
// @Success 200 {object} RefreshResponse "Token renovado com sucesso"
// @Failure 400 {object} map[string]string "Refresh token inválido"
// @Failure 401 {object} map[string]string "Refresh token expirado ou inválido"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /auth/refresh [post]
func (h *AuthHandler) Refresh(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Refresh token é obrigatório"})
		return
	}

	// Validar refresh token
	claims, err := middleware.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token inválido ou expirado"})
		return
	}

	// Buscar usuário
	user, err := h.userUseCase.GetUserByID(claims.UserID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não encontrado"})
		return
	}

	// Verificar se o usuário está aprovado
	if user.Status != "aprovado" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não está aprovado"})
		return
	}

	// Gerar novos tokens
	token, expiresAt, err := middleware.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar token"})
		return
	}

	newRefreshToken, _, err := middleware.GenerateRefreshToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao gerar refresh token"})
		return
	}

	// Log da renovação do token
	h.auditLogUseCase.LogUserAction(user.ID, entities.ActionUpdate, entities.ResourceAuth, user.ID, "Token renovado com sucesso", c.ClientIP(), c.GetHeader("User-Agent"))

	response := RefreshResponse{
		Token:        token,
		RefreshToken: newRefreshToken,
		ExpiresAt:    expiresAt,
	}

	c.JSON(http.StatusOK, response)
}

// Logout faz logout do usuário
// @Summary Fazer logout
// @Description Invalida o token atual e registra o logout no sistema
// @Tags auth
// @Accept json
// @Produce json
// @Security Bearer
// @Success 200 {object} map[string]string "Logout realizado com sucesso"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 500 {object} map[string]string "Erro interno do servidor"
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	// Obter ID do usuário do contexto
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	// Log do logout
	h.auditLogUseCase.LogUserAction(userID, entities.ActionLogout, entities.ResourceAuth, userID, "Logout realizado com sucesso", c.ClientIP(), c.GetHeader("User-Agent"))

	c.JSON(http.StatusOK, gin.H{"message": "Logout realizado com sucesso"})
}

// normalizeCPF remove pontos, hífen e espaços em branco do CPF
func normalizeCPF(cpf string) string {
	cpf = strings.ReplaceAll(cpf, ".", "")
	cpf = strings.ReplaceAll(cpf, "-", "")
	cpf = strings.ReplaceAll(cpf, " ", "")
	return cpf
}
