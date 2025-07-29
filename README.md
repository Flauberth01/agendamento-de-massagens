# 🏥 Sistema de Agendamento de Massagem

Sistema completo para agendamento de sessões de massagem em cadeiras especializadas, desenvolvido com **Arquitetura Hexagonal** no backend e **React + TypeScript** no frontend.

## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
- [🏗️ Arquitetura e Estrutura](#️-arquitetura-e-estrutura)
- [🛠️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)
- [🚀 Como Executar](#-como-executar)
- [👥 Usuários Padrão para Teste](#-usuários-padrão-para-teste)
- [📚 Documentação Adicional](#-documentação-adicional)
- [🧪 Testes](#-testes)
- [📦 Build de Produção](#-build-de-produção)
- [🔧 Troubleshooting](#-troubleshooting)
- [📄 Licença](#-licença)

---

## 🎯 Sobre o Projeto

Sistema de agendamento desenvolvido para gerenciar sessões de massagem em cadeiras especializadas. Permite que clientes agendem sessões, atendentes gerenciem agendamentos e administradores configurem o sistema.

### **Funcionalidades Principais**
- ✅ **Agendamento de Sessões**: Clientes podem agendar sessões de massagem
- ✅ **Gestão de Cadeiras**: Administradores gerenciam cadeiras de massagem
- ✅ **Aprovação de Usuários**: Atendentes aprovam novos clientes
- ✅ **Dashboard Operacional**: Visão geral das sessões e ocupação
- ✅ **Notificações por Email**: Confirmações e cancelamentos
- ✅ **Relatórios**: Estatísticas de utilização

### **Regras de Negócio**
- **Sessões de 30 minutos** em horários fixos
- **Apenas 1 sessão ativa** por cliente
- **Cancelamento mínimo 3h** antes da sessão
- **Aprovação obrigatória** de novos usuários
- **Controle de disponibilidade** por administradores

---

## 🏗️ Arquitetura e Estrutura

### **Estrutura Geral**
```
agendamento/
├── backend/                    # API Backend (Go + Gin)
│   ├── cmd/server/            # Ponto de entrada da aplicação
│   ├── internal/              # Código interno da aplicação
│   │   ├── domain/           # Entidades e regras de negócio
│   │   ├── application/      # Casos de uso e DTOs
│   │   ├── infrastructure/   # Implementações externas
│   │   └── interfaces/       # Controllers e rotas
│   ├── pkg/                  # Pacotes compartilhados
│   ├── tests/                # Testes de integração
│   ├── docs/                 # Documentação Swagger
│   ├── API_DOCUMENTATION.md  # Documentação da API
│   └── DATABASE_MODELING.md  # Modelagem do banco
├── frontend/                  # Interface React + TypeScript
│   ├── src/                  # Código fonte
│   │   ├── components/       # Componentes React
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços de API
│   │   ├── hooks/           # Custom hooks
│   │   ├── stores/          # Gerenciamento de estado
│   │   ├── types/           # Tipos TypeScript
│   │   └── utils/           # Utilitários
│   ├── FRONTEND_DOCUMENTATION.md
│   └── package.json
├── docker-compose.yml        # Orquestração de containers
├── README.md                 # Documentação principal
├── TUTORIAL_PARA_RODAR.md   # Tutorial de execução
├── GUIA_DE_USO.md           # Guia de uso para usuários
└── .gitignore
```

### **Arquitetura Backend (Hexagonal)**

#### **Domain Layer** (`internal/domain/`)
- **Entities**: `user.go`, `booking.go`, `chair.go`, `availability.go`, `audit_log.go`
- **Ports**: `logger.go`, `notification_service.go`, `password_hasher.go`, `time_service.go`, `validator.go`
- **Repositories**: `user_repository.go`, `booking_repository.go`, `chair_repository.go`, `availability_repository.go`, `audit_log_repository.go`, `email_repository.go`

#### **Application Layer** (`internal/application/`)
- **Use Cases**: `user_usecase.go`, `booking_usecase.go`, `chair_usecase.go`, `availability_usecase.go`, `dashboard_usecase.go`, `notification_usecase.go`, `audit_log_usecase.go`
- **DTOs**: `user_dto.go`, `booking_dto.go`, `chair_dto.go`, `availability_dto.go`, `audit_log_dtos.go`
- **Mappers**: `user_mapper.go`, `booking_mapper.go`, `chair_mapper.go`, `availability_mapper.go`, `audit_log_mapper.go`

#### **Infrastructure Layer** (`internal/infrastructure/`)
- **Adapters**: `bcrypt_password_hasher.go`, `email_notification_service.go`, `logger_adapter.go`, `time_service_adapter.go`, `validator_adapter.go`
- **Database**: `database.go`, `models/user_model.go`
- **Repositories**: `user_repository_impl.go`, `booking_repository_impl.go`, `chair_repository_impl.go`, `availability_repository_impl.go`, `audit_log_repository_impl.go`
- **Email**: `config.go`, `email_service.go`, `templates.go`
- **Scheduler**: `scheduler.go`

#### **Interfaces Layer** (`internal/interfaces/`)
- **HTTP Handlers**: `user_handler.go`, `booking_handler.go`, `chair_handler.go`, `availability_handler.go`, `auth_handler.go`, `dashboard_handler.go`, `audit_log_handler.go`
- **Middleware**: `auth.go`, `cors.go`, `logging.go`, `security.go`
- **Routes**: `user_routes.go`, `booking_routes.go`, `chair_routes.go`, `availability_routes.go`, `audit_log_routes.go`, `dashboard_routes.go`

### **Arquitetura Frontend**

#### **Componentes** (`src/components/`)
- **Dashboard**: `AvailabilityCalendar.tsx`, `BookingList.tsx`, `BookingSummary.tsx`, `ChairList.tsx`, `StatsCard.tsx`, `UserList.tsx`
- **Forms**: `BookingForm.tsx`, `LoginForm.tsx`, `RegisterStep1Form.tsx`, `RegisterStep2Form.tsx`, `UserForm.tsx`
- **Layout**: `AuthLayout.tsx`, `DashboardLayout.tsx`, `Header.tsx`, `MinimalLayout.tsx`, `Sidebar.tsx`
- **UI**: `alert.tsx`, `avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `confirm-dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `label.tsx`, `notification.tsx`, `select.tsx`, `textarea.tsx`
- **Debug/Examples**: `AvailabilitySlotsExample.tsx`, `AvailabilityTest.tsx`

#### **Páginas** (`src/pages/`)
- **Auth**: `LoginPage.tsx`, `RegisterPage.tsx`, `RegisterStep2Page.tsx`
- **Availability**: `AvailabilityCreatePage.tsx`, `AvailabilityDetailPage.tsx`, `AvailabilityListPage.tsx`
- **Bookings**: `BookingCreatePage.tsx`, `BookingListPage.tsx`, `BookingReschedulePage.tsx`
- **Chairs**: `ChairCreatePage.tsx`, `ChairDetailPage.tsx`, `ChairEditPage.tsx`, `ChairListPage.tsx`
- **Dashboard**: `AdminDashboardPage.tsx`, `AttendantDashboardPage.tsx`, `OperationalDashboardPage.tsx`, `UserDashboardPage.tsx`
- **Users**: `UserBookingPage.tsx`, `UserCreatePage.tsx`, `UserDetailPage.tsx`, `UserEditPage.tsx`, `UserListPage.tsx`, `UserPendingPage.tsx`

#### **Serviços e Hooks** (`src/services/`, `src/hooks/`)
- **Services**: `api.ts`, `authService.ts`, `availabilityService.ts`, `bookingService.ts`, `chairService.ts`, `dashboardService.ts`, `userService.ts`
- **Hooks**: `useAuth.ts`, `useAvailability.ts`, `useBookingNotifications.ts`, `useBookings.ts`, `useChairs.ts`, `useUsers.ts`

#### **Utilitários** (`src/utils/`)
- **Utils**: `cn.ts`, `constants.ts`, `formatters.ts`, `validation.ts`

### **Design Patterns**

#### **Backend**
- **Hexagonal Architecture**: Separação clara entre domínio, aplicação e infraestrutura
- **Dependency Injection**: Inversão de dependências através de interfaces
- **Repository Pattern**: Abstração do acesso a dados
- **Use Case Pattern**: Orquestração de regras de negócio
- **DTO Pattern**: Transferência de dados entre camadas
- **Middleware Pattern**: Interceptação de requisições
- **Factory Pattern**: Criação de objetos complexos
- **Adapter Pattern**: Adaptação de serviços externos

#### **Frontend**
- **Component Composition**: Composição de componentes reutilizáveis
- **Custom Hooks**: Lógica reutilizável encapsulada
- **Service Layer**: Abstração de chamadas de API
- **State Management**: Gerenciamento centralizado de estado
- **Type Safety**: Tipagem forte com TypeScript
- **Form Management**: Gerenciamento de formulários com validação
- **Error Boundaries**: Tratamento de erros em componentes

### **Fluxo de Dados**

```
Frontend (React) → HTTP Request → Backend (Go/Gin)
                                    ↓
                              Middleware (Auth, CORS, Logging)
                                    ↓
                              Controller (Handler)
                                    ↓
                              Use Case (Business Logic)
                                    ↓
                              Repository (Data Access)
                                    ↓
                              Database (PostgreSQL)
```

### **Segurança**
- **JWT Authentication**: Autenticação baseada em tokens
- **Password Hashing**: Senhas criptografadas com bcrypt
- **CORS**: Política de origem cruzada configurada
- **Input Validation**: Validação de entrada em todas as camadas
- **Audit Logging**: Registro de todas as ações importantes
- **Role-based Access**: Controle de acesso por perfil
- **Token Storage**: Armazenamento seguro de tokens
- **Route Protection**: Proteção de rotas sensíveis
- **Input Sanitization**: Sanitização de dados de entrada
- **Error Handling**: Tratamento seguro de erros
- **HTTPS**: Suporte a conexões seguras

### **Estratégia de Testes**

#### **Backend**
- **Unit Tests**: Testes unitários para use cases e repositories
- **Integration Tests**: Testes de integração para handlers
- **Repository Tests**: Testes específicos para acesso a dados
- **Mock Tests**: Testes com mocks para serviços externos

#### **Frontend**
- **Component Tests**: Testes de componentes React
- **Hook Tests**: Testes de custom hooks
- **Service Tests**: Testes de serviços de API
- **E2E Tests**: Testes end-to-end (planejado)
- **ESLint**: Análise estática de código
- **TypeScript**: Verificação de tipos

---

## 🛠️ Tecnologias Utilizadas

### **Backend**
- **Go 1.23.0** - Linguagem principal
- **Gin v1.10.1** - Framework web
- **GORM v1.25.5** - ORM para PostgreSQL
- **PostgreSQL Driver v1.5.4** - Driver do banco
- **JWT v5.2.0** - Autenticação
- **Swagger v1.16.5** - Documentação da API
- **Zap v1.27.0** - Logging estruturado
- **Validator v10.27.0** - Validação de dados
- **Crypto v0.40.0** - Criptografia
- **Testify v1.10.0** - Framework de testes

### **Frontend**
- **React 19.1.0** - Biblioteca de UI
- **TypeScript 5.8.3** - Tipagem estática
- **Vite 7.0.4** - Build tool e dev server
- **Tailwind CSS 3.4.17** - Framework CSS
- **React Router DOM 7.7.1** - Roteamento
- **Zustand 5.0.6** - Gerenciamento de estado
- **Axios 1.11.0** - Cliente HTTP
- **React Hook Form 7.61.1** - Gerenciamento de formulários
- **TanStack React Query 5.83.0** - Cache e sincronização
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **Date-fns** - Manipulação de datas
- **Zod** - Validação de esquemas
- **Sonner** - Notificações
- **Class Variance Authority** - Variantes de componentes
- **Tailwind Merge** - Merge de classes CSS

### **Infraestrutura**
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **PostgreSQL 15** - Banco de dados
- **Redis** - Cache (opcional)

---

## 🚀 Como Executar

### **Opção 1: Docker (Recomendado)**
```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd agendamento

# Execute com Docker
docker-compose up -d

# Acesse o sistema
# API: http://localhost:8080
# Swagger: http://localhost:8080/swagger/index.html
```

### **Opção 2: Execução Local**
```bash
# Backend
cd backend
cp env.example .env
# Configure o arquivo .env com suas credenciais
go run cmd/server/main.go

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

### **Configuração do Banco**
```bash
# Criar banco PostgreSQL
CREATE DATABASE agendamento_db;
CREATE USER the_user WITH PASSWORD 'massagem2024@secure';
GRANT ALL PRIVILEGES ON DATABASE agendamento_db TO the_user;
```

### **Variáveis de Ambiente**
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agendamento
DB_HOST=localhost
DB_PORT=5432
DB_USER=the_user
DB_PASSWORD=massagem2024@secure
DB_NAME=agendamento_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASS=your-app-password
```

---

## 👥 Usuários Padrão para Teste

### **Administrador**
- **CPF**: 12345678909
- **Senha**: 123456
- **Perfil**: Administrador do sistema

### **Atendente**
- **CPF**: 98765432100
- **Senha**: 123456
- **Perfil**: Funcionário da recepção/atendimento

### **Cliente**
- **CPF**: 11144477735
- **Senha**: 123456
- **Perfil**: Cliente do sistema

---

## 📚 Documentação Adicional

- **[TUTORIAL_PARA_RODAR.md](TUTORIAL_PARA_RODAR.md)** - Tutorial detalhado para executar o projeto
- **[GUIA_DE_USO.md](GUIA_DE_USO.md)** - Guia completo de uso para Clientes, Atendentes e Administradores
- **[backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)** - Documentação completa da API
- **[backend/DATABASE_MODELING.md](backend/DATABASE_MODELING.md)** - Modelagem do banco de dados
- **[frontend/FRONTEND_DOCUMENTATION.md](frontend/FRONTEND_DOCUMENTATION.md)** - Documentação do frontend

---

## 🧪 Testes

### **Backend**
```bash
cd backend
go test ./...
go test -cover ./...
```

### **Frontend**
```bash
cd frontend
npm test
npm run test:coverage
```

---

## 📦 Build de Produção

### **Backend**
```bash
cd backend
go build -o bin/server cmd/server/main.go
```

### **Frontend**
```bash
cd frontend
npm run build
```

---

## 🔧 Troubleshooting

### **Problemas Comuns**
- **Container não inicia**: Verifique logs com `docker-compose logs`
- **Banco não conecta**: Verifique se PostgreSQL está rodando
- **API não responde**: Verifique se a porta 8080 está livre
- **Frontend não carrega**: Verifique se a porta 3000 está livre

### **Logs Úteis**
```bash
# Logs do Docker
docker-compose logs -f

# Logs específicos
docker-compose logs api
docker-compose logs postgres
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autores

- **[Flauberth Brito]** - Desenvolvedor Full Stack

---

## 🙏 Agradecimentos

- Comunidade Go e React
- Contribuidores do projeto
- Usuários que testaram o sistema

---

## 📞 Suporte

Para dúvidas, sugestões ou problemas:
- **Issues**: Abra uma issue no GitHub
- **Email**: contato@agendamento.com
- **Documentação**: Consulte os arquivos de documentação

---

**🎉 Sistema de Agendamento de Massagem - Versão 1.0.0**