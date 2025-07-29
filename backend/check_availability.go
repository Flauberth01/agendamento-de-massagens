package main

import (
	"fmt"
	"log"

	"agendamento-backend/internal/infrastructure/database"
	"agendamento-backend/internal/infrastructure/repositories"
)

func main() {
	// Conectar ao banco
	config := database.GetConfigFromEnv()
	db, err := database.NewDatabase(config)
	if err != nil {
		log.Fatal("Erro ao conectar ao banco:", err)
	}

	// Criar repositório
	availabilityRepo := repositories.NewAvailabilityRepository(db.DB)

	// Buscar todas as disponibilidades
	availabilities, _, err := availabilityRepo.List(100, 0, nil)
	if err != nil {
		log.Fatal("Erro ao buscar disponibilidades:", err)
	}

	fmt.Printf("Total de disponibilidades encontradas: %d\n", len(availabilities))

	for _, availability := range availabilities {
		fmt.Printf("ID: %d, Cadeira: %d, Dia: %d, Horário: %s-%s, Ativa: %t\n", 
			availability.ID, availability.ChairID, availability.DayOfWeek, 
			availability.StartTime, availability.EndTime, availability.IsActive)
	}

	// Verificar cadeiras
	chairRepo := repositories.NewChairRepository(db.DB)
	chairs, _, err := chairRepo.List(10, 0, nil)
	if err != nil {
		log.Fatal("Erro ao buscar cadeiras:", err)
	}

	fmt.Printf("\nTotal de cadeiras encontradas: %d\n", len(chairs))
	for _, chair := range chairs {
		fmt.Printf("Cadeira ID: %d, Nome: %s, Status: %s\n", chair.ID, chair.Name, chair.Status)
	}
}