package usecases

import (
	"errors"
	"fmt"

	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/ports"
	"agendamento-backend/internal/domain/repositories"
)

type UserUseCase struct {
	userRepo         repositories.UserRepository
	auditRepo        repositories.AuditLogRepository
	notificationRepo ports.NotificationService
	passwordHasher   ports.PasswordHasher
	validator        ports.Validator
	logger           ports.Logger
	timeService      ports.TimeService
}

func NewUserUseCase(
	userRepo repositories.UserRepository,
	auditRepo repositories.AuditLogRepository,
	notificationRepo ports.NotificationService,
	passwordHasher ports.PasswordHasher,
	validator ports.Validator,
	logger ports.Logger,
	timeService ports.TimeService,
) *UserUseCase {
	return &UserUseCase{
		userRepo:         userRepo,
		auditRepo:        auditRepo,
		notificationRepo: notificationRepo,
		passwordHasher:   passwordHasher,
		validator:        validator,
		logger:           logger,
		timeService:      timeService,
	}
}

// CreateUser cria um novo usuário
func (uc *UserUseCase) CreateUser(user *entities.User, createdBy *uint) error {
	uc.logger.Info("Iniciando criação de usuário", map[string]interface{}{
		"email": user.Email,
		"name":  user.Name,
	})

	// Validar dados
	if err := uc.validator.ValidateStruct(user); err != nil {
		uc.logger.Error("Dados inválidos para criação de usuário", err, map[string]interface{}{
			"email": user.Email,
		})
		return fmt.Errorf("dados inválidos: %w", err)
	}

	// Verificar se email já existe
	if exists, err := uc.userRepo.ExistsByEmail(user.Email); err != nil {
		uc.logger.Error("Erro ao verificar email existente", err, map[string]interface{}{
			"email": user.Email,
		})
		return fmt.Errorf("erro ao verificar email: %w", err)
	} else if exists {
		uc.logger.Warn("Tentativa de criar usuário com email já existente", map[string]interface{}{
			"email": user.Email,
		})
		return errors.New("email já está em uso")
	}

	// Verificar se CPF já existe
	if exists, err := uc.userRepo.ExistsByCPF(user.CPF); err != nil {
		uc.logger.Error("Erro ao verificar CPF existente", err, map[string]interface{}{
			"cpf": user.CPF,
		})
		return fmt.Errorf("erro ao verificar CPF: %w", err)
	} else if exists {
		uc.logger.Warn("Tentativa de criar usuário com CPF já existente", map[string]interface{}{
			"cpf": user.CPF,
		})
		return errors.New("CPF já está em uso")
	}

	// Hash da senha
	hashedPassword, err := uc.passwordHasher.Hash(user.Password)
	if err != nil {
		uc.logger.Error("Erro ao criptografar senha", err, map[string]interface{}{
			"email": user.Email,
		})
		return fmt.Errorf("erro ao criptografar senha: %w", err)
	}
	user.Password = hashedPassword

	// Criar usuário
	if err := uc.userRepo.Create(user); err != nil {
		uc.logger.Error("Erro ao criar usuário no repositório", err, map[string]interface{}{
			"email": user.Email,
		})
		return fmt.Errorf("erro ao criar usuário: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(createdBy, entities.ActionCreate, entities.ResourceUser, &user.ID)
	auditLog.SetDescription(fmt.Sprintf("Usuário %s criado", user.Name))
	uc.auditRepo.Create(auditLog)

	uc.logger.Info("Usuário criado com sucesso", map[string]interface{}{
		"user_id": user.ID,
		"email":   user.Email,
		"name":    user.Name,
	})

	return nil
}

// GetUserByID busca usuário por ID
func (uc *UserUseCase) GetUserByID(id uint) (*entities.User, error) {
	return uc.userRepo.GetByID(id)
}

// GetUserByEmail busca usuário por email
func (uc *UserUseCase) GetUserByEmail(email string) (*entities.User, error) {
	return uc.userRepo.GetByEmail(email)
}

// GetUserByCPF busca usuário por CPF
func (uc *UserUseCase) GetUserByCPF(cpf string) (*entities.User, error) {
	return uc.userRepo.GetByCPF(cpf)
}

// UpdateUser atualiza um usuário
func (uc *UserUseCase) UpdateUser(user *entities.User, updatedBy uint) error {
	// Validar dados
	if err := uc.validator.ValidateStruct(user); err != nil {
		return fmt.Errorf("dados inválidos: %w", err)
	}

	// Buscar usuário atual para comparação
	currentUser, err := uc.userRepo.GetByID(user.ID)
	if err != nil {
		return fmt.Errorf("usuário não encontrado: %w", err)
	}

	// Verificar se email mudou e se já existe
	if user.Email != currentUser.Email {
		if exists, err := uc.userRepo.ExistsByEmail(user.Email); err != nil {
			return fmt.Errorf("erro ao verificar email: %w", err)
		} else if exists {
			return errors.New("email já está em uso")
		}
	}

	// Se senha foi alterada, fazer hash
	if user.Password != "" && user.Password != currentUser.Password {
		hashedPassword, err := uc.passwordHasher.Hash(user.Password)
		if err != nil {
			return fmt.Errorf("erro ao criptografar senha: %w", err)
		}
		user.Password = hashedPassword
	} else {
		user.Password = currentUser.Password
	}

	// Atualizar usuário
	if err := uc.userRepo.Update(user); err != nil {
		return fmt.Errorf("erro ao atualizar usuário: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&updatedBy, entities.ActionUpdate, entities.ResourceUser, &user.ID)
	auditLog.SetDescription(fmt.Sprintf("Usuário %s atualizado", user.Name))
	uc.auditRepo.Create(auditLog)

	return nil
}

// ApproveUser aprova um usuário
func (uc *UserUseCase) ApproveUser(userID, approvedBy uint) error {
	user, err := uc.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("usuário não encontrado: %w", err)
	}

	if user.Status != "pendente" {
		return errors.New("usuário não está pendente de aprovação")
	}

	if err := uc.userRepo.Approve(userID, approvedBy); err != nil {
		return fmt.Errorf("erro ao aprovar usuário: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&approvedBy, entities.ActionApprove, entities.ResourceUser, &userID)
	auditLog.SetDescription(fmt.Sprintf("Usuário %s aprovado", user.Name))
	uc.auditRepo.Create(auditLog)

	// Enviar email de aprovação (não bloquear se falhar)
	go func() {
		if err := uc.notificationRepo.SendUserApproval(user); err != nil {
			// Log do erro mas não falha a operação
			uc.logger.Error("Erro ao enviar email de aprovação", err, map[string]interface{}{
				"user_id": user.ID,
				"email":   user.Email,
			})
		}
	}()

	return nil
}

// RejectUser rejeita um usuário
func (uc *UserUseCase) RejectUser(userID, rejectedBy uint, reason string) error {
	user, err := uc.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("usuário não encontrado: %w", err)
	}

	if user.Status != "pendente" {
		return errors.New("usuário não está pendente de aprovação")
	}

	if err := uc.userRepo.Reject(userID, rejectedBy, reason); err != nil {
		return fmt.Errorf("erro ao rejeitar usuário: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&rejectedBy, entities.ActionReject, entities.ResourceUser, &userID)
	auditLog.SetDescription(fmt.Sprintf("Usuário %s rejeitado: %s", user.Name, reason))
	uc.auditRepo.Create(auditLog)

	// Enviar email de rejeição (não bloquear se falhar)
	go func() {
		if err := uc.notificationRepo.SendUserRejection(user, reason); err != nil {
			// Log do erro mas não falha a operação
			uc.logger.Error("Erro ao enviar email de rejeição", err, map[string]interface{}{
				"user_id": user.ID,
				"email":   user.Email,
				"reason":  reason,
			})
		}
	}()

	return nil
}

// ListUsers lista usuários com paginação
func (uc *UserUseCase) ListUsers(limit, offset int, filters map[string]interface{}) ([]*entities.User, int64, error) {
	return uc.userRepo.List(limit, offset, filters)
}

// GetPendingApprovals busca usuários pendentes de aprovação
func (uc *UserUseCase) GetPendingApprovals(limit, offset int) ([]*entities.User, int64, error) {
	return uc.userRepo.GetByStatus("pendente", limit, offset)
}

// GetPendingUsers busca todos os usuários pendentes de aprovação
func (uc *UserUseCase) GetPendingUsers() ([]*entities.User, error) {
	users, _, err := uc.userRepo.GetByStatus("pendente", 100, 0) // Limite alto para pegar todos
	return users, err
}

// GetPendingUsersByRole busca usuários pendentes de aprovação por role específico
func (uc *UserUseCase) GetPendingUsersByRole(role string) ([]*entities.User, error) {
	// Filtrar usuários pendentes por role
	users, _, err := uc.userRepo.GetByStatus("pendente", 100, 0)
	if err != nil {
		return nil, err
	}

	// Filtrar por role
	var filteredUsers []*entities.User
	for _, user := range users {
		if user.Role == role {
			filteredUsers = append(filteredUsers, user)
		}
	}

	return filteredUsers, nil
}

// UpdateLastLogin atualiza o último login do usuário
func (uc *UserUseCase) UpdateLastLogin(userID uint) error {
	return uc.userRepo.UpdateLastLogin(userID)
}

// DeleteUser exclui um usuário
func (uc *UserUseCase) DeleteUser(userID, deletedBy uint) error {
	user, err := uc.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("usuário não encontrado: %w", err)
	}

	if err := uc.userRepo.Delete(userID); err != nil {
		return fmt.Errorf("erro ao excluir usuário: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&deletedBy, entities.ActionDelete, entities.ResourceUser, &userID)
	auditLog.SetDescription(fmt.Sprintf("Usuário %s excluído", user.Name))
	uc.auditRepo.Create(auditLog)

	return nil
}

// CheckCPFExists verifica se um CPF já está cadastrado
func (uc *UserUseCase) CheckCPFExists(cpf string) (bool, error) {
	uc.logger.Info("Verificando se CPF já existe", map[string]interface{}{
		"cpf": cpf,
	})

	exists, err := uc.userRepo.ExistsByCPF(cpf)
	if err != nil {
		uc.logger.Error("Erro ao verificar CPF existente", err, map[string]interface{}{
			"cpf": cpf,
		})
		return false, fmt.Errorf("erro ao verificar CPF: %w", err)
	}

	uc.logger.Info("Verificação de CPF concluída", map[string]interface{}{
		"cpf":    cpf,
		"exists": exists,
	})

	return exists, nil
}

// ChangeUserRole altera o role de um usuário (apenas admin pode fazer isso)
func (uc *UserUseCase) ChangeUserRole(userID, changedBy uint, newRole string) error {
	uc.logger.Info("Iniciando alteração de role de usuário", map[string]interface{}{
		"user_id":    userID,
		"new_role":   newRole,
		"changed_by": changedBy,
	})

	// Validar role
	validRoles := []string{"usuario", "atendente", "admin"}
	isValidRole := false
	for _, role := range validRoles {
		if role == newRole {
			isValidRole = true
			break
		}
	}
	if !isValidRole {
		uc.logger.Error("Role inválido", errors.New("role inválido"), map[string]interface{}{
			"user_id":  userID,
			"new_role": newRole,
		})
		return errors.New("role inválido. Use: usuario, atendente ou admin")
	}

	// Buscar usuário que está sendo alterado
	user, err := uc.userRepo.GetByID(userID)
	if err != nil {
		uc.logger.Error("Usuário não encontrado", err, map[string]interface{}{
			"user_id": userID,
		})
		return fmt.Errorf("usuário não encontrado: %w", err)
	}

	// Verificar se o usuário está aprovado
	if !user.IsApproved() {
		uc.logger.Warn("Tentativa de alterar role de usuário não aprovado", map[string]interface{}{
			"user_id": userID,
			"status":  user.Status,
		})
		return errors.New("não é possível alterar role de usuário não aprovado")
	}

	// Verificar se não está tentando alterar o próprio role
	if userID == changedBy {
		uc.logger.Warn("Tentativa de alterar próprio role", map[string]interface{}{
			"user_id": userID,
		})
		return errors.New("não é possível alterar o próprio role")
	}

	// Buscar usuário que está fazendo a alteração
	changer, err := uc.userRepo.GetByID(changedBy)
	if err != nil {
		uc.logger.Error("Usuário que está alterando não encontrado", err, map[string]interface{}{
			"changed_by": changedBy,
		})
		return fmt.Errorf("usuário que está alterando não encontrado: %w", err)
	}

	// Verificar se quem está alterando é admin
	if !changer.IsAdmin() {
		uc.logger.Warn("Tentativa de alterar role sem permissão", map[string]interface{}{
			"changed_by":   changedBy,
			"changer_role": changer.Role,
		})
		return errors.New("apenas administradores podem alterar roles de usuários")
	}

	// Verificar se não está tentando alterar outro admin
	if user.IsAdmin() && !changer.IsAdmin() {
		uc.logger.Warn("Tentativa de alterar role de admin sem permissão", map[string]interface{}{
			"user_id":    userID,
			"changed_by": changedBy,
		})
		return errors.New("não é possível alterar role de outro administrador")
	}

	// Alterar role
	if err := uc.userRepo.ChangeRole(userID, newRole, changedBy); err != nil {
		uc.logger.Error("Erro ao alterar role no repositório", err, map[string]interface{}{
			"user_id":  userID,
			"new_role": newRole,
		})
		return fmt.Errorf("erro ao alterar role: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&changedBy, entities.ActionUpdate, entities.ResourceUser, &userID)
	auditLog.SetDescription(fmt.Sprintf("Role do usuário %s alterado de %s para %s por %s",
		user.Name, user.Role, newRole, changer.Name))
	uc.auditRepo.Create(auditLog)

	// Enviar notificação por email (não bloquear se falhar)
	go func() {
		if err := uc.notificationRepo.SendRoleChangeNotification(user, newRole); err != nil {
			uc.logger.Error("Erro ao enviar notificação de alteração de role", err, map[string]interface{}{
				"user_id":  user.ID,
				"email":    user.Email,
				"new_role": newRole,
			})
		}
	}()

	uc.logger.Info("Role de usuário alterado com sucesso", map[string]interface{}{
		"user_id":    userID,
		"old_role":   user.Role,
		"new_role":   newRole,
		"changed_by": changedBy,
	})

	return nil
}
