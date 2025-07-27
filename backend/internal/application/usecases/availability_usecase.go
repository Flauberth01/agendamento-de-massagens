package usecases

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"agendamento-backend/internal/domain/entities"
	"agendamento-backend/internal/domain/ports"
	"agendamento-backend/internal/domain/repositories"
)

type AvailabilityUseCase struct {
	availabilityRepo repositories.AvailabilityRepository
	chairRepo        repositories.ChairRepository
	auditRepo        repositories.AuditLogRepository
	validator        ports.Validator
}

func NewAvailabilityUseCase(
	availabilityRepo repositories.AvailabilityRepository,
	chairRepo repositories.ChairRepository,
	auditRepo repositories.AuditLogRepository,
	validator ports.Validator,
) *AvailabilityUseCase {
	return &AvailabilityUseCase{
		availabilityRepo: availabilityRepo,
		chairRepo:        chairRepo,
		auditRepo:        auditRepo,
		validator:        validator,
	}
}

// CreateAvailability cria uma nova disponibilidade
func (uc *AvailabilityUseCase) CreateAvailability(availability *entities.Availability, createdBy uint) error {
	// Validar dados
	if err := uc.validator.ValidateStruct(availability); err != nil {
		return fmt.Errorf("dados inválidos: %w", err)
	}

	// Verificar se cadeira existe
	chair, err := uc.chairRepo.GetByID(availability.ChairID)
	if err != nil {
		return fmt.Errorf("cadeira não encontrada: %w", err)
	}

	// Validar horários
	if timeRangeErr := uc.validateTimeRange(availability.StartTime, availability.EndTime); timeRangeErr != nil {
		return err
	}

	// Verificar conflitos de horário
	hasConflict, err := uc.availabilityRepo.HasConflict(
		availability.ChairID,
		availability.DayOfWeek,
		availability.StartTime,
		availability.EndTime,
		nil,
	)
	if err != nil {
		return fmt.Errorf("erro ao verificar conflitos: %w", err)
	}
	if hasConflict {
		return errors.New("já existe disponibilidade configurada para este horário")
	}

	// Criar disponibilidade
	if err := uc.availabilityRepo.Create(availability); err != nil {
		return fmt.Errorf("erro ao criar disponibilidade: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&createdBy, entities.ActionCreate, entities.ResourceAvailability, &availability.ID)
	auditLog.SetDescription(fmt.Sprintf("Disponibilidade criada para cadeira %s", chair.Name))
	uc.auditRepo.Create(auditLog)

	return nil
}

// GetAvailabilityByID busca disponibilidade por ID
func (uc *AvailabilityUseCase) GetAvailabilityByID(id uint) (*entities.Availability, error) {
	return uc.availabilityRepo.GetByID(id)
}

// UpdateAvailability atualiza uma disponibilidade
func (uc *AvailabilityUseCase) UpdateAvailability(availability *entities.Availability, updatedBy uint) error {
	// Validar dados
	if err := uc.validator.ValidateStruct(availability); err != nil {
		return fmt.Errorf("dados inválidos: %w", err)
	}

	// Verificar se disponibilidade existe
	currentAvailability, err := uc.availabilityRepo.GetByID(availability.ID)
	if err != nil {
		return fmt.Errorf("disponibilidade não encontrada: %w", err)
	}

	// Validar horários
	if err := uc.validateTimeRange(availability.StartTime, availability.EndTime); err != nil {
		return err
	}

	// Verificar conflitos (excluindo a própria disponibilidade)
	if availability.ChairID != currentAvailability.ChairID ||
		availability.DayOfWeek != currentAvailability.DayOfWeek ||
		availability.StartTime != currentAvailability.StartTime ||
		availability.EndTime != currentAvailability.EndTime {

		hasConflict, err := uc.availabilityRepo.HasConflict(
			availability.ChairID,
			availability.DayOfWeek,
			availability.StartTime,
			availability.EndTime,
			&availability.ID,
		)
		if err != nil {
			return fmt.Errorf("erro ao verificar conflitos: %w", err)
		}
		if hasConflict {
			return errors.New("já existe disponibilidade configurada para este horário")
		}
	}

	// Atualizar disponibilidade
	if err := uc.availabilityRepo.Update(availability); err != nil {
		return fmt.Errorf("erro ao atualizar disponibilidade: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&updatedBy, entities.ActionUpdate, entities.ResourceAvailability, &availability.ID)
	auditLog.SetDescription("Disponibilidade atualizada")
	uc.auditRepo.Create(auditLog)

	return nil
}

// DeleteAvailability exclui uma disponibilidade
func (uc *AvailabilityUseCase) DeleteAvailability(availabilityID, deletedBy uint) error {
	_, err := uc.availabilityRepo.GetByID(availabilityID)
	if err != nil {
		return fmt.Errorf("disponibilidade não encontrada: %w", err)
	}

	if err := uc.availabilityRepo.Delete(availabilityID); err != nil {
		return fmt.Errorf("erro ao excluir disponibilidade: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&deletedBy, entities.ActionDelete, entities.ResourceAvailability, &availabilityID)
	auditLog.SetDescription("Disponibilidade excluída")
	uc.auditRepo.Create(auditLog)

	return nil
}

// ListAvailabilities lista disponibilidades com paginação
func (uc *AvailabilityUseCase) ListAvailabilities(limit, offset int, filters map[string]interface{}) ([]*entities.Availability, int64, error) {
	return uc.availabilityRepo.List(limit, offset, filters)
}

// GetChairAvailabilities busca disponibilidades de uma cadeira
func (uc *AvailabilityUseCase) GetChairAvailabilities(chairID uint) ([]*entities.Availability, error) {
	return uc.availabilityRepo.GetByChair(chairID)
}

// GetAvailableTimeSlots retorna os horários disponíveis para uma data específica
func (uc *AvailabilityUseCase) GetAvailableTimeSlots(chairID uint, date time.Time) ([]string, error) {
	// Verificar se cadeira existe e está ativa
	chair, err := uc.chairRepo.GetByID(chairID)
	if err != nil {
		return nil, fmt.Errorf("cadeira não encontrada: %w", err)
	}
	if !chair.IsAvailable() {
		return nil, errors.New("cadeira não está disponível")
	}

	// Buscar disponibilidades da cadeira para o dia da semana
	availabilities, err := uc.availabilityRepo.GetChairAvailabilityForDate(chairID, date)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar disponibilidades: %w", err)
	}

	var allSlots []string
	for _, availability := range availabilities {
		if availability.IsValidForDate(date) {
			slots, err := availability.GetTimeSlots()
			if err != nil {
				continue
			}
			allSlots = append(allSlots, slots...)
		}
	}

	return allSlots, nil
}

// ActivateAvailability ativa uma disponibilidade
func (uc *AvailabilityUseCase) ActivateAvailability(availabilityID, activatedBy uint) error {
	_, err := uc.availabilityRepo.GetByID(availabilityID)
	if err != nil {
		return fmt.Errorf("disponibilidade não encontrada: %w", err)
	}

	if err := uc.availabilityRepo.Activate(availabilityID); err != nil {
		return fmt.Errorf("erro ao ativar disponibilidade: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&activatedBy, entities.ActionUpdate, entities.ResourceAvailability, &availabilityID)
	auditLog.SetDescription("Disponibilidade ativada")
	uc.auditRepo.Create(auditLog)

	return nil
}

// DeactivateAvailability desativa uma disponibilidade
func (uc *AvailabilityUseCase) DeactivateAvailability(availabilityID, deactivatedBy uint) error {
	_, err := uc.availabilityRepo.GetByID(availabilityID)
	if err != nil {
		return fmt.Errorf("disponibilidade não encontrada: %w", err)
	}

	if err := uc.availabilityRepo.Deactivate(availabilityID); err != nil {
		return fmt.Errorf("erro ao desativar disponibilidade: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&deactivatedBy, entities.ActionUpdate, entities.ResourceAvailability, &availabilityID)
	auditLog.SetDescription("Disponibilidade desativada")
	uc.auditRepo.Create(auditLog)

	return nil
}

// SetValidityPeriod define período de validade de uma disponibilidade
func (uc *AvailabilityUseCase) SetValidityPeriod(availabilityID uint, validFrom, validTo *time.Time, setBy uint) error {
	_, err := uc.availabilityRepo.GetByID(availabilityID)
	if err != nil {
		return fmt.Errorf("disponibilidade não encontrada: %w", err)
	}

	// Validar período
	if validFrom != nil && validTo != nil && validFrom.After(*validTo) {
		return errors.New("data de início deve ser anterior à data de fim")
	}

	if err := uc.availabilityRepo.SetValidityPeriod(availabilityID, validFrom, validTo); err != nil {
		return fmt.Errorf("erro ao definir período de validade: %w", err)
	}

	// Log de auditoria
	auditLog := entities.NewAuditLog(&setBy, entities.ActionUpdate, entities.ResourceAvailability, &availabilityID)
	auditLog.SetDescription("Período de validade da disponibilidade alterado")
	uc.auditRepo.Create(auditLog)

	return nil
}

// GetAvailabilityStats retorna estatísticas das disponibilidades
func (uc *AvailabilityUseCase) GetAvailabilityStats() (map[string]int64, error) {
	stats := make(map[string]int64)

	total, err := uc.availabilityRepo.CountTotal()
	if err != nil {
		return nil, fmt.Errorf("erro ao contar total de disponibilidades: %w", err)
	}
	stats["total"] = total

	active, err := uc.availabilityRepo.CountActive()
	if err != nil {
		return nil, fmt.Errorf("erro ao contar disponibilidades ativas: %w", err)
	}
	stats["ativas"] = active

	stats["inativas"] = total - active

	return stats, nil
}

// validateTimeRange valida se o horário está no formato correto e é válido
func (uc *AvailabilityUseCase) validateTimeRange(startTime, endTime string) error {
	// Validar formato
	startParsed, err := time.Parse("15:04", startTime)
	if err != nil {
		return errors.New("horário de início inválido (use formato HH:MM)")
	}

	endParsed, err := time.Parse("15:04", endTime)
	if err != nil {
		return errors.New("horário de fim inválido (use formato HH:MM)")
	}

	// Verificar se horário de fim é posterior ao de início
	if !endParsed.After(startParsed) {
		return errors.New("horário de fim deve ser posterior ao horário de início")
	}

	// Verificar se a duração é múltipla de 30 minutos
	duration := endParsed.Sub(startParsed)
	if duration.Minutes() < 30 || int(duration.Minutes())%30 != 0 {
		return errors.New("a duração deve ser múltipla de 30 minutos")
	}

	return nil
}

// CreateMultipleAvailabilities cria múltiplas disponibilidades usando loops aninhados
func (uc *AvailabilityUseCase) CreateMultipleAvailabilities(chairID uint, selectedDays []int, startTimes []string, endTimes []string, validTo *string, isActive bool, createdBy uint) ([]*entities.Availability, error) {
	// Verificar se cadeira existe
	chair, err := uc.chairRepo.GetByID(chairID)
	if err != nil {
		return nil, fmt.Errorf("cadeira não encontrada: %w", err)
	}

	// Validar dias da semana
	for _, day := range selectedDays {
		if day < 0 || day > 6 {
			return nil, errors.New("dia da semana inválido (deve ser entre 0 e 6)")
		}
	}

	// Validar arrays de horários
	if len(startTimes) != len(endTimes) {
		return nil, errors.New("arrays de horários devem ter o mesmo tamanho")
	}

	// Validar horários
	for i, startTime := range startTimes {
		endTime := endTimes[i]
		if err := uc.validateTimeRange(startTime, endTime); err != nil {
			return nil, fmt.Errorf("horário inválido %s-%s: %w", startTime, endTime, err)
		}
	}

	// Converter validTo de string para *time.Time se fornecido
	var validToTime *time.Time
	if validTo != nil && *validTo != "" {
		parsedTime, err := time.Parse("2006-01-02", *validTo)
		if err != nil {
			return nil, fmt.Errorf("data de validade inválida: %w", err)
		}
		validToTime = &parsedTime
	}

	var createdAvailabilities []*entities.Availability
	var errors []string

	// Loop principal: para cada dia da semana
	for _, dayOfWeek := range selectedDays {
		// Loop aninhado: para cada horário
		for i, startTime := range startTimes {
			endTime := endTimes[i]

			// Criar nova disponibilidade
			availability := &entities.Availability{
				ChairID:   chairID,
				DayOfWeek: dayOfWeek,
				StartTime: startTime,
				EndTime:   endTime,
				ValidTo:   validToTime,
				IsActive:  isActive,
			}

			// Verificar conflitos de horário
			hasConflict, err := uc.availabilityRepo.HasConflict(
				availability.ChairID,
				availability.DayOfWeek,
				availability.StartTime,
				availability.EndTime,
				nil,
			)
			if err != nil {
				errors = append(errors, fmt.Sprintf("erro ao verificar conflitos para %s - %s-%s: %v",
					availability.GetDayOfWeekName(), startTime, endTime, err))
				continue
			}
			if hasConflict {
				errors = append(errors, fmt.Sprintf("já existe disponibilidade para %s - %s-%s",
					availability.GetDayOfWeekName(), startTime, endTime))
				continue
			}

			// Criar disponibilidade no banco
			if err := uc.availabilityRepo.Create(availability); err != nil {
				errors = append(errors, fmt.Sprintf("erro ao criar disponibilidade para %s - %s-%s: %v",
					availability.GetDayOfWeekName(), startTime, endTime, err))
				continue
			}

			// Buscar a disponibilidade criada para retornar
			createdAvailability, err := uc.availabilityRepo.GetByID(availability.ID)
			if err != nil {
				errors = append(errors, fmt.Sprintf("erro ao buscar disponibilidade criada para %s - %s-%s: %v",
					availability.GetDayOfWeekName(), startTime, endTime, err))
				continue
			}

			createdAvailabilities = append(createdAvailabilities, createdAvailability)

			// Log de auditoria
			auditLog := entities.NewAuditLog(&createdBy, entities.ActionCreate, entities.ResourceAvailability, &availability.ID)
			auditLog.SetDescription(fmt.Sprintf("Disponibilidade criada para cadeira %s - %s - %s-%s",
				chair.Name, availability.GetDayOfWeekName(), startTime, endTime))
			uc.auditRepo.Create(auditLog)
		}
	}

	// Se houve erros, retornar junto com as disponibilidades criadas
	if len(errors) > 0 {
		return createdAvailabilities, fmt.Errorf("algumas disponibilidades não puderam ser criadas: %s", strings.Join(errors, "; "))
	}

	return createdAvailabilities, nil
}
