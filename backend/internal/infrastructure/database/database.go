package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"agendamento-backend/internal/application/usecases"
	"agendamento-backend/internal/domain/entities"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Database struct {
	DB *gorm.DB
}

type Config struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
	TimeZone string
}

// NewDatabase cria uma nova conexão com o banco de dados
func NewDatabase(config *Config) (*Database, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=%s",
		config.Host,
		config.User,
		config.Password,
		config.DBName,
		config.Port,
		config.SSLMode,
		config.TimeZone,
	)

	// Configurar logger do GORM
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Info,
			IgnoreRecordNotFoundError: true,
			ParameterizedQueries:      true,
			Colorful:                  false,
		},
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		return nil, fmt.Errorf("falha ao conectar com o banco de dados: %w", err)
	}

	// Configurar pool de conexões
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("falha ao obter instância SQL DB: %w", err)
	}

	// Configurações do pool
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return &Database{DB: db}, nil
}

// GetConfigFromEnv obtém configuração do banco a partir de variáveis de ambiente
func GetConfigFromEnv() *Config {
	return &Config{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     getEnv("DB_PORT", "5432"),
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASSWORD", "postgres"),
		DBName:   getEnv("DB_NAME", "agendamento_db"),
		SSLMode:  getEnv("DB_SSLMODE", "disable"),
		TimeZone: getEnv("DB_TIMEZONE", "America/Sao_Paulo"),
	}
}

// AutoMigrate executa as migrações automáticas
func (d *Database) AutoMigrate() error {
	err := d.DB.AutoMigrate(
		&entities.User{},
		&entities.Chair{},
		&entities.Availability{},
		&entities.Booking{},
		&entities.AuditLog{},
	)
	if err != nil {
		return fmt.Errorf("falha ao executar migrações: %w", err)
	}

	log.Println("Migrações executadas com sucesso")
	return nil
}

// Close fecha a conexão com o banco de dados
func (d *Database) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// Ping verifica se a conexão com o banco está ativa
func (d *Database) Ping() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

// SeedData insere dados iniciais no banco
func (d *Database) SeedData(userUseCase *usecases.UserUseCase) error {
	// Verificar se já existem dados
	var userCount int64
	d.DB.Model(&entities.User{}).Count(&userCount)
	if userCount > 0 {
		log.Println("Dados já existem, pulando seed")
		return nil
	}

	// Criar usuários padrão (já aprovados para uso inicial do sistema)
	users := []entities.User{
		{
			Name:     "Administrador",
			CPF:      "12345678909",
			Email:    "admin@sistema.com",
			Phone:    "(11) 99999-0000",
			Password: "123456",
			Role:     "admin",
			Status:   "aprovado", // Admin já aprovado para gerenciar o sistema
			Gender:   "masculino",
		},
		{
			Name:     "Atendente",
			CPF:      "98765432100",
			Email:    "atendente@sistema.com",
			Phone:    "(11) 99999-1111",
			Password: "123456",
			Role:     "atendente",
			Status:   "aprovado", // Atendente já aprovado para atender
			Gender:   "feminino",
		},
		{
			Name:     "Cliente",
			CPF:      "11144477735",
			Email:    "cliente@sistema.com",
			Phone:    "(11) 99999-2222",
			Password: "123456",
			Role:     "usuario",
			Status:   "aprovado", // Cliente já aprovado para usar o sistema
			Gender:   "outro",
		},
	}

	createdBy := uint(1)
	for _, user := range users {
		user.SetDefaultValues()
		if err := userUseCase.CreateUser(&user, &createdBy); err != nil {
			return fmt.Errorf("erro ao criar usuário %s: %w", user.Email, err)
		}
	}

	// Criar cadeiras padrão
	chairs := []entities.Chair{
		{
			Name:        "Cadeira 01",
			Description: "Cadeira de massagem localizada no térreo",
			Location:    "Térreo - Sala 1",
			Status:      "ativa",
		},
		{
			Name:        "Cadeira 02",
			Description: "Cadeira de massagem localizada no térreo",
			Location:    "Térreo - Sala 2",
			Status:      "ativa",
		},
		{
			Name:        "Cadeira 03",
			Description: "Cadeira de massagem localizada no primeiro andar",
			Location:    "1º Andar - Sala 1",
			Status:      "ativa",
		},
	}

	// Criar cadeiras e armazenar os IDs
	var createdChairs []entities.Chair
	for _, chair := range chairs {
		if err := d.DB.Create(&chair).Error; err != nil {
			return fmt.Errorf("erro ao criar cadeira %s: %w", chair.Name, err)
		}
		createdChairs = append(createdChairs, chair)
	}



	log.Println("Dados iniciais inseridos com sucesso")
	return nil
}

// getEnv obtém variável de ambiente com valor padrão
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
