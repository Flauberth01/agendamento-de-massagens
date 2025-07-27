package handlers

import (
	"net/http"
	"strconv"

	"agendamento-backend/internal/application/dtos"
	"agendamento-backend/internal/application/mappers"
	"agendamento-backend/internal/application/usecases"
	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/interfaces/http/middleware"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userUseCase     *usecases.UserUseCase
	auditLogUseCase *usecases.AuditLogUseCase
}

func NewUserHandler(userUseCase *usecases.UserUseCase, auditLogUseCase *usecases.AuditLogUseCase) *UserHandler {
	return &UserHandler{
		userUseCase:     userUseCase,
		auditLogUseCase: auditLogUseCase,
	}
}

// GetUser busca usuário por ID
// @Summary Buscar usuário por ID
// @Description Retorna os dados de um usuário específico pelo ID
// @Tags users
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID do usuário"
// @Success 200 {object} entities.User "Usuário encontrado"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 404 {object} map[string]string "Usuário não encontrado"
// @Router /users/{id} [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	user, err := h.userUseCase.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": user})
}

// UpdateUser atualiza um usuário
// @Summary Atualizar usuário
// @Description Atualiza os dados de um usuário específico (apenas admin)
// @Tags users
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID do usuário"
// @Param user body entities.User true "Dados do usuário"
// @Success 200 {object} map[string]interface{} "Usuário atualizado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Usuário não encontrado"
// @Router /users/{id} [put]
func (h *UserHandler) UpdateUser(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var user entities.User
	if bindErr := c.ShouldBindJSON(&user); bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + bindErr.Error()})
		return
	}

	user.ID = uint(id)

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	err = h.userUseCase.UpdateUser(&user, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar o usuário atualizado para retornar
	updatedUser, err := h.userUseCase.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuário atualizado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Usuário atualizado com sucesso",
		"data":    updatedUser,
	})
}

// DeleteUser exclui um usuário
// @Summary Excluir usuário
// @Description Exclui um usuário específico do sistema (apenas admin)
// @Tags users
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID do usuário"
// @Success 200 {object} map[string]string "Usuário excluído com sucesso"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Usuário não encontrado"
// @Router /users/{id} [delete]
func (h *UserHandler) DeleteUser(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	err = h.userUseCase.DeleteUser(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Usuário excluído com sucesso"})
}

// ListUsers lista usuários com paginação
// @Summary Listar usuários
// @Description Lista usuários com paginação e filtros opcionais
// @Tags users
// @Accept json
// @Produce json
// @Security Bearer
// @Param limit query int false "Limite de registros por página" default(10)
// @Param offset query int false "Offset para paginação" default(0)
// @Param name query string false "Filtrar por nome"
// @Param email query string false "Filtrar por email"
// @Param role query string false "Filtrar por role"
// @Param status query string false "Filtrar por status"
// @Success 200 {object} map[string]interface{} "Lista de usuários"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /users [get]
func (h *UserHandler) ListUsers(c *gin.Context) {
	// Parâmetros de paginação
	limitParam := c.DefaultQuery("limit", "10")
	offsetParam := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetParam)
	if err != nil {
		offset = 0
	}

	// Filtros
	filters := make(map[string]interface{})
	if name := c.Query("name"); name != "" {
		filters["name"] = name
	}
	if email := c.Query("email"); email != "" {
		filters["email"] = email
	}
	if role := c.Query("role"); role != "" {
		filters["role"] = role
	}
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}

	users, total, err := h.userUseCase.ListUsers(limit, offset, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": users,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// ApproveUser aprova um usuário
// @Summary Aprovar usuário
// @Description Aprova um usuário pendente (apenas atendentes e admins)
// @Tags users
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID do usuário"
// @Success 200 {object} map[string]string "Usuário aprovado com sucesso"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Usuário não encontrado"
// @Router /users/{id}/approve [post]
func (h *UserHandler) ApproveUser(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	// Obter usuário do contexto de autenticação
	currentUser, exists := middleware.GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	// Buscar dados do usuário a ser aprovado para log
	targetUser, err := h.userUseCase.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	err = h.userUseCase.ApproveUser(uint(id), currentUser.ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log de aprovação
	h.auditLogUseCase.LogUserAction(currentUser.ID, entities.ActionApprove, entities.ResourceUser, uint(id), "Usuário aprovado: "+targetUser.Name+" ("+targetUser.CPF+")", c.ClientIP(), c.GetHeader("User-Agent"))

	c.JSON(http.StatusOK, gin.H{"message": "Usuário aprovado com sucesso"})
}

// RejectUser rejeita um usuário
// @Summary Rejeitar usuário
// @Description Rejeita um usuário pendente (apenas atendentes e admins)
// @Tags users
// @Accept json
// @Produce json
// @Security Bearer
// @Param id path int true "ID do usuário"
// @Success 200 {object} map[string]string "Usuário rejeitado com sucesso"
// @Failure 400 {object} map[string]string "ID inválido"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Failure 404 {object} map[string]string "Usuário não encontrado"
// @Router /users/{id}/reject [post]
func (h *UserHandler) RejectUser(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	// Obter usuário do contexto de autenticação
	currentUser, exists := middleware.GetUserFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não autenticado"})
		return
	}

	// Buscar dados do usuário a ser rejeitado para log
	targetUser, err := h.userUseCase.GetUserByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	// Obter motivo da rejeição do body (opcional)
	var requestBody struct {
		Reason string `json:"reason"`
	}
	c.ShouldBindJSON(&requestBody)
	reason := requestBody.Reason
	if reason == "" {
		reason = "Rejeitado pelo administrador"
	}

	err = h.userUseCase.RejectUser(uint(id), currentUser.ID, reason)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Log de rejeição
	h.auditLogUseCase.LogUserAction(currentUser.ID, entities.ActionReject, entities.ResourceUser, uint(id), "Usuário rejeitado: "+targetUser.Name+" ("+targetUser.CPF+"). Motivo: "+reason, c.ClientIP(), c.GetHeader("User-Agent"))

	c.JSON(http.StatusOK, gin.H{"message": "Usuário rejeitado com sucesso"})
}

// CreateUser cria um novo usuário
// @Summary Criar usuário
// @Description Cria um novo usuário no sistema
// @Tags users
// @Accept json
// @Produce json
// @Security Bearer
// @Param user body dtos.CreateUserRequest true "Dados do usuário"
// @Success 201 {object} dtos.CreateUserResponse "Usuário criado com sucesso"
// @Failure 400 {object} map[string]string "Dados inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Router /users [post]
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req dtos.CreateUserRequest
	if bindErr := c.ShouldBindJSON(&req); bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + bindErr.Error()})
		return
	}

	// Obter userID do contexto de autenticação
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		// Se não há usuário autenticado, usar 0 (sistema)
		userID = 0
	}

	// Converter DTO para entidade
	user := mappers.ToEntity(&req)

	// Quando admin/atendente cria usuário, ele já fica aprovado
	user.Status = "aprovado"
	user.Role = user.RequestedRole

	err := h.userUseCase.CreateUser(user, &userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Buscar o usuário criado para retornar
	createdUser, err := h.userUseCase.GetUserByID(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuário criado"})
		return
	}

	// Converter entidade para DTO de resposta
	response := mappers.ToCreateResponse(createdUser)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Usuário criado com sucesso",
		"data":    response,
	})
}

// GetPendingApprovals busca usuários pendentes de aprovação
// @Summary Buscar usuários pendentes
// @Description Lista usuários pendentes de aprovação (apenas atendentes e admins)
// @Tags users
// @Accept json
// @Produce json
// @Security Bearer
// @Param limit query int false "Limite de registros por página" default(10)
// @Param offset query int false "Offset para paginação" default(0)
// @Success 200 {object} map[string]interface{} "Lista de usuários pendentes"
// @Failure 400 {object} map[string]string "Parâmetros inválidos"
// @Failure 401 {object} map[string]string "Token inválido"
// @Failure 403 {object} map[string]string "Sem permissão"
// @Router /users/pending [get]
func (h *UserHandler) GetPendingApprovals(c *gin.Context) {
	// Parâmetros de paginação
	limitParam := c.DefaultQuery("limit", "10")
	offsetParam := c.DefaultQuery("offset", "0")

	limit, err := strconv.Atoi(limitParam)
	if err != nil {
		limit = 10
	}

	offset, err := strconv.Atoi(offsetParam)
	if err != nil {
		offset = 0
	}

	users, total, err := h.userUseCase.GetPendingApprovals(limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": users,
		"pagination": gin.H{
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}
