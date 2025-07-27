package scheduler

import (
	"fmt"
	"time"

	"agendamento-backend/internal/application/usecases"
)

// Scheduler gerencia tarefas agendadas
type Scheduler struct {
	notificationUC *usecases.NotificationUseCase
	stopChan       chan bool
}

// NewScheduler cria uma nova instância do scheduler
func NewScheduler(notificationUC *usecases.NotificationUseCase) *Scheduler {
	return &Scheduler{
		notificationUC: notificationUC,
		stopChan:       make(chan bool),
	}
}

// Start inicia o scheduler
func (s *Scheduler) Start() {
	go s.runDailyReminders()
	fmt.Println("Scheduler iniciado - lembretes diários ativados")
}

// Stop para o scheduler
func (s *Scheduler) Stop() {
	s.stopChan <- true
	fmt.Println("Scheduler parado")
}

// runDailyReminders executa lembretes diários às 9:00
func (s *Scheduler) runDailyReminders() {
	ticker := time.NewTicker(1 * time.Hour) // Verifica a cada hora
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			now := time.Now()
			// Executa às 9:00 da manhã
			if now.Hour() == 9 && now.Minute() < 60 {
				go func() {
					if err := s.notificationUC.SendDailyReminders(); err != nil {
						fmt.Printf("Erro ao enviar lembretes diários: %v\n", err)
					} else {
						fmt.Println("Lembretes diários enviados com sucesso")
					}
				}()
			}
		case <-s.stopChan:
			return
		}
	}
}

// SendImmediateReminders envia lembretes imediatamente (para testes)
func (s *Scheduler) SendImmediateReminders() error {
	return s.notificationUC.SendDailyReminders()
}
