// @title Sistema de Agendamento API
// @description API REST para sistema de agendamento de cadeiras de massagem
// @version 1.0
// @host localhost:8080
// @BasePath /api
// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description Digite 'Bearer' seguido de um espaço e o token JWT obtido no login
// Package main Sistema de Agendamento API
//
// # API REST para sistema de agendamento de cadeiras de massagem
//
// Esta API permite gerenciar usuários, cadeiras de massagem, agendamentos e disponibilidades
// em um sistema de agendamento completo com autenticação JWT e controle de acesso baseado em roles.
//
// ## Funcionalidades Principais:
// - **Autenticação**: Login com CPF e senha, refresh tokens
// - **Usuários**: CRUD completo com aprovação de novos usuários
// - **Cadeiras**: Gerenciamento de cadeiras de massagem
// - **Agendamentos**: Criação e gerenciamento de agendamentos
// - **Disponibilidade**: Controle de horários disponíveis
// - **Auditoria**: Log de todas as ações do sistema
// - **Dashboard**: Estatísticas e relatórios
//
// ## Roles de Usuário:
// - **usuario**: Usuário comum, pode fazer agendamentos
// - **atendente**: Pode aprovar usuários e gerenciar agendamentos
// - **admin**: Acesso total ao sistema
//
// Terms Of Service: http://swagger.io/terms/
//
// Schemes: http, https
// Host: localhost:8080
// Version: 1.0.0
// Contact: Sistema de Agendamento <admin@sistema.com>
// License: MIT
// LicenseUrl: https://opensource.org/licenses/MIT
//
// Consumes:
// - application/json
//
// Produces:
// - application/json
//

// swagger:meta
package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	_ "agendamento-backend/docs" // Importar docs gerados pelo Swagger
	"agendamento-backend/internal/application/usecases"
	"agendamento-backend/internal/infrastructure/adapters"
	"agendamento-backend/internal/infrastructure/database"
	"agendamento-backend/internal/infrastructure/email"
	"agendamento-backend/internal/infrastructure/repositories"
	"agendamento-backend/internal/infrastructure/scheduler"
	"agendamento-backend/internal/interfaces/http/handlers"
	"agendamento-backend/internal/interfaces/http/middleware"
	"agendamento-backend/internal/interfaces/http/routes"
	dashboardRoutes "agendamento-backend/internal/interfaces/routes"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func main() {
	// Configurar modo do Gin
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Conectar ao banco de dados
	dbConfig := database.GetConfigFromEnv()
	db, err := database.NewDatabase(dbConfig)
	if err != nil {
		log.Fatal("Falha ao conectar com o banco de dados:", err)
	}
	defer db.Close()

	// Verificar conexão
	if err := db.Ping(); err != nil {
		log.Fatal("Falha ao verificar conexão com o banco:", err)
	}

	// Executar migrações
	if err := db.AutoMigrate(); err != nil {
		log.Fatal("Falha ao executar migrações:", err)
	}

	// Inicializar adapters (ports)
	passwordHasher := adapters.NewBcryptPasswordHasher()
	validatorAdapter := adapters.NewValidatorAdapter()
	loggerAdapter := adapters.NewLoggerAdapter()
	timeServiceAdapter := adapters.NewTimeServiceAdapter()

	// Inicializar repositórios
	userRepo := repositories.NewUserRepository(db.DB)
	chairRepo := repositories.NewChairRepository(db.DB)
	bookingRepo := repositories.NewBookingRepository(db.DB)
	availabilityRepo := repositories.NewAvailabilityRepository(db.DB)
	auditLogRepo := repositories.NewAuditLogRepository(db.DB)

	// Inicializar serviço de email
	emailConfig, err := email.NewConfig()
	if err != nil {
		log.Printf("Aviso: Falha ao configurar email: %v", err)
		log.Println("Sistema continuará sem notificações por email")
	}
	emailService := email.NewEmailService(emailConfig)
	notificationService := adapters.NewEmailNotificationService(emailService)

	// Inicializar casos de uso
	userUseCase := usecases.NewUserUseCase(
		userRepo,
		auditLogRepo,
		notificationService,
		passwordHasher,
		validatorAdapter,
		loggerAdapter,
		timeServiceAdapter,
	)
	chairUseCase := usecases.NewChairUseCase(chairRepo, auditLogRepo, validatorAdapter)
	bookingUseCase := usecases.NewBookingUseCase(bookingRepo, chairRepo, userRepo, availabilityRepo, auditLogRepo, emailService, validatorAdapter)
	availabilityUseCase := usecases.NewAvailabilityUseCase(availabilityRepo, bookingRepo, chairRepo, auditLogRepo, validatorAdapter)
	auditLogUseCase := usecases.NewAuditLogUseCase(auditLogRepo, userRepo, validatorAdapter)
	notificationUseCase := usecases.NewNotificationUseCase(emailService, bookingRepo, userRepo, chairRepo)

	// Inserir dados iniciais
	if err := db.SeedData(userUseCase); err != nil {
		log.Printf("Aviso: Falha ao inserir dados iniciais: %v", err)
		log.Println("Sistema continuará sem dados padrão")
	}

	// Inicializar handlers
	userHandler := handlers.NewUserHandler(userUseCase, auditLogUseCase)
	chairHandler := handlers.NewChairHandler(chairUseCase)
	bookingHandler := handlers.NewBookingHandler(bookingUseCase)
	availabilityHandler := handlers.NewAvailabilityHandler(availabilityUseCase)
	auditLogHandler := handlers.NewAuditLogHandler(auditLogUseCase)
	authHandler := handlers.NewAuthHandler(userUseCase, auditLogUseCase, passwordHasher)
	dashboardHandler := handlers.NewDashboardHandler(bookingUseCase, userUseCase, chairUseCase, notificationUseCase)

	// Configurar router
	router := gin.New()

	// Middlewares globais
	router.Use(middleware.CORS()) // CORS deve ser o primeiro middleware
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.SecurityHeaders())

	// Configurar rotas
	api := router.Group("/api")
	{
		// Rotas de autenticação
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/register", authHandler.Register)
			auth.POST("/refresh", authHandler.Refresh)
			auth.POST("/logout", authHandler.Logout)
		}

		// Rotas protegidas
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(userUseCase))
		{
			// Rotas de usuários
			routes.SetupUserRoutes(protected, userHandler)

			// Rotas de cadeiras
			routes.SetupChairRoutes(protected, chairHandler)

			// Rotas de agendamentos
			routes.SetupBookingRoutes(protected, bookingHandler)

			// Rotas de disponibilidade
			routes.SetupAvailabilityRoutes(protected, availabilityHandler)

			// Rotas de auditoria
			routes.SetupAuditLogRoutes(protected, auditLogHandler)
		}

		// Rotas de dashboard
		dashboardRoutes.SetupDashboardRoutes(api, dashboardHandler, userUseCase)
	}

	// Rota de health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "Sistema de agendamento funcionando",
		})
	})

	// Rota do Swagger
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	// Inicializar scheduler para lembretes
	schedulerInstance := scheduler.NewScheduler(notificationUseCase)
	schedulerInstance.Start()

	// Canal para capturar sinais de interrupção
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Iniciar servidor em goroutine
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Servidor iniciando na porta %s", port)
	log.Println("Sistema de notificações por email ativado")
	log.Println("Lembretes diários configurados para 9:00")

	go func() {
		if err := router.Run(":" + port); err != nil {
			log.Fatal("Falha ao iniciar servidor:", err)
		}
	}()

	// Aguardar sinal de interrupção
	<-sigChan
	log.Println("Recebido sinal de interrupção, parando scheduler...")
	schedulerInstance.Stop()
	log.Println("Servidor finalizado")
}
