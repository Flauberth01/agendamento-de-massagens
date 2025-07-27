package usecases

import (
	"errors"
	"fmt"

	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/ports"
	"agendamento-backend/internal/domain/repositories"
)

type ChairUseCase struct {
	chairRepo repositories.ChairRepository
	auditRepo repositories.AuditLogRepository
	validator ports.Validator
}

func NewChairUseCase(
	chairRepo repositories.ChairRepository,
	auditRepo repositories.AuditLogRepository,
	validator ports.Validator,
) *ChairUseCase {
	return &ChairUseCase{
		chairRepo: chairRepo,
		auditRepo: auditRepo,
		validator: validator,
	}
}

// CreateChair cria uma nova cadeira
func (uc *ChairUseCase) CreateChair(chair *entities.Chair, createdBy uint) error {
	// Validar dados
	if err := uc.validator.ValidateStruct(chair); err != nil {
		return fmt.Errorf("dados inválidos: %w", err)
	}

	// Verificar se nome já existe
	if exists, err := uc.chairRepo.ExistsByName(chair.Name); err != nil {
		return fmt.Errorf("erro ao verificar nome: %w", err)
	} else if exists {
		return errors.New("já existe uma cadeira com este nome")
	}

	// Criar cadeira
	if err := uc.chairRepo.Create(chair); err != nil {
		return fmt.Errorf("erro ao criar cadeira: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&createdBy, entities.ActionCreate, entities.ResourceChair, &chair.ID)
	auditLog.SetDescription(fmt.Sprintf("Cadeira %s criada", chair.Name))
	uc.auditRepo.Create(auditLog)

	return nil
}

// GetChairByID busca cadeira por ID
func (uc *ChairUseCase) GetChairByID(id uint) (*entities.Chair, error) {
	return uc.chairRepo.GetByID(id)
}

// UpdateChair atualiza uma cadeira
func (uc *ChairUseCase) UpdateChair(chair *entities.Chair, updatedBy uint) error {
	// Validar dados
	if err := uc.validator.ValidateStruct(chair); err != nil {
		return fmt.Errorf("dados inválidos: %w", err)
	}

	// Buscar cadeira atual para comparação
	currentChair, err := uc.chairRepo.GetByID(chair.ID)
	if err != nil {
		return fmt.Errorf("cadeira não encontrada: %w", err)
	}

	// Verificar se nome mudou e se já existe
	if chair.Name != currentChair.Name {
		if exists, err := uc.chairRepo.ExistsByName(chair.Name); err != nil {
			return fmt.Errorf("erro ao verificar nome: %w", err)
		} else if exists {
			return errors.New("já existe uma cadeira com este nome")
		}
	}

	// Atualizar cadeira
	if err := uc.chairRepo.Update(chair); err != nil {
		return fmt.Errorf("erro ao atualizar cadeira: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&updatedBy, entities.ActionUpdate, entities.ResourceChair, &chair.ID)
	auditLog.SetDescription(fmt.Sprintf("Cadeira %s atualizada", chair.Name))
	uc.auditRepo.Create(auditLog)

	return nil
}

// DeleteChair exclui uma cadeira
func (uc *ChairUseCase) DeleteChair(chairID, deletedBy uint) error {
	chair, err := uc.chairRepo.GetByID(chairID)
	if err != nil {
		return fmt.Errorf("cadeira não encontrada: %w", err)
	}

	if err := uc.chairRepo.Delete(chairID); err != nil {
		return fmt.Errorf("erro ao excluir cadeira: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&deletedBy, entities.ActionDelete, entities.ResourceChair, &chairID)
	auditLog.SetDescription(fmt.Sprintf("Cadeira %s excluída", chair.Name))
	uc.auditRepo.Create(auditLog)

	return nil
}

// ListChairs lista cadeiras com paginação
func (uc *ChairUseCase) ListChairs(limit, offset int, filters map[string]interface{}) ([]*entities.Chair, int64, error) {
	return uc.chairRepo.List(limit, offset, filters)
}

// GetActiveChairs busca cadeiras ativas
func (uc *ChairUseCase) GetActiveChairs(limit, offset int) ([]*entities.Chair, int64, error) {
	return uc.chairRepo.GetActive(limit, offset)
}

// GetAvailableChairs busca cadeiras disponíveis para agendamento
func (uc *ChairUseCase) GetAvailableChairs() ([]*entities.Chair, error) {
	return uc.chairRepo.GetAvailableChairs()
}

// ChangeChairStatus altera o status de uma cadeira
func (uc *ChairUseCase) ChangeChairStatus(chairID uint, newStatus string, changedBy uint) error {
	chair, err := uc.chairRepo.GetByID(chairID)
	if err != nil {
		return fmt.Errorf("cadeira não encontrada: %w", err)
	}

	// Validar status
	validStatuses := []string{"ativa", "inativa"}
	validStatus := false
	for _, status := range validStatuses {
		if newStatus == status {
			validStatus = true
			break
		}
	}

	if !validStatus {
		return errors.New("status inválido")
	}

	oldStatus := chair.Status

	if err := uc.chairRepo.ChangeStatus(chairID, newStatus, changedBy); err != nil {
		return fmt.Errorf("erro ao alterar status da cadeira: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&changedBy, entities.ActionUpdate, entities.ResourceChair, &chairID)
	auditLog.SetDescription(fmt.Sprintf("Status da cadeira %s alterado de %s para %s", chair.Name, oldStatus, newStatus))
	uc.auditRepo.Create(auditLog)

	return nil
}

// ActivateChair ativa uma cadeira
func (uc *ChairUseCase) ActivateChair(chairID, activatedBy uint) error {
	return uc.ChangeChairStatus(chairID, "ativa", activatedBy)
}

// DeactivateChair desativa uma cadeira
func (uc *ChairUseCase) DeactivateChair(chairID, deactivatedBy uint) error {
	return uc.ChangeChairStatus(chairID, "inativa", deactivatedBy)
}

// GetChairStats retorna estatísticas das cadeiras
func (uc *ChairUseCase) GetChairStats() (map[string]int64, error) {
	stats := make(map[string]int64)

	total, err := uc.chairRepo.CountTotal()
	if err != nil {
		return nil, fmt.Errorf("erro ao contar total de cadeiras: %w", err)
	}
	stats["total"] = total

	active, err := uc.chairRepo.CountActive()
	if err != nil {
		return nil, fmt.Errorf("erro ao contar cadeiras ativas: %w", err)
	}
	stats["ativas"] = active

	inactive, err := uc.chairRepo.CountByStatus("inativa")
	if err != nil {
		return nil, fmt.Errorf("erro ao contar cadeiras inativas: %w", err)
	}
	stats["inativas"] = inactive

	return stats, nil
}
