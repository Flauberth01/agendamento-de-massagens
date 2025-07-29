# Sistema de Agendamento

Sistema completo de agendamento com backend em Go (Arquitetura Hexagonal) e frontend em React/TypeScript, desenvolvido para gerenciar consultas, pacientes e profissionais de saúde.

## 📋 Índice

- [📋 Descrição do Projeto](#-descrição-do-projeto)
- [🎯 Regras de Negócio](#-regras-de-negócio-e-funcionalidades)
- [🏗️ Arquitetura e Estrutura](#️-arquitetura-e-estrutura-do-projeto)
- [🚀 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [📋 Pré-requisitos](#-pré-requisitos)
- [🛠️ Como Executar](#️-como-executar-localmente)
- [🔧 Configuração de Ambiente](#-configuração-de-ambiente)
- [👥 Usuários Padrão](#-usuários-padrão-para-teste)
- [🧪 Testes](#-testes)
- [📦 Build de Produção](#-build-de-produção)
- [🔍 Troubleshooting](#-troubleshooting)
- [📄 Licença](#-licença)

## 📋 Descrição do Projeto

Sistema web completo de agendamento de sessões de massagem com controle de acesso por perfis hierárquicos (Usuário, Atendente e Administrador). Desenvolvido com backend em Go usando **Arquitetura Hexagonal** e frontend em React/TypeScript, o sistema permite gerenciar agendamentos, aprovar usuários, controlar cadeiras e horários disponíveis, com interface intuitiva e segura.

## 🎯 Regras de Negócio e Funcionalidades

### 👥 Perfis e Permissões

#### **Usuário**
- Pode agendar e cancelar sessões
- Apenas 1 sessão ativa por vez
- Acesso liberado somente após aprovação

#### **Atendente**
- Aprova ou reprova cadastros de usuários
- Visualiza agendamentos por data, cadeira ou usuário
- Cancela, remarca e marca presença em sessões
- Acompanha indicadores em dashboard (presença, cancelamento etc.)

#### **Administrador**
- Tem acesso total ao sistema
- Gerencia usuários, cadeiras, atendentes e agenda
- Define dias e horários disponíveis para agendamento
- Concede ou revoga permissões de atendente

### 📅 Agendamento de Sessões
- Sessões com duração fixa de 30 minutos
- Horários controlados por disponibilidade configurada pelo administrador
- Impede agendamentos em conflito para cadeira ou usuário
- Cancelamento permitido com antecedência mínima de 3h

### 🪑 Gestão de Cadeiras
- Cada cadeira possui: Nome/ID, localização e status (ativa/inativa)
- Apenas administradores podem cadastrar ou editar

### 📊 Dashboard Operacional
- Disponível para atendentes e administradores
- Mostra: Sessões do dia, ocupação por cadeira, pendências de aprovação de usuários, indicadores de presença e cancelamento

### 📢 Notificações por E-mail (Funcionalidade Extra)
- Confirmação de agendamento
- Cancelamento de sessão
- Lembrete de agendamento
- Aprovação de cadastro

## 🏗️ Arquitetura e Estrutura do Projeto

### 📁 Estrutura Geral
```
agendamento/
├── backend/                    # API REST em Go (Arquitetura Hexagonal)
│   ├── cmd/                   # Ponto de entrada da aplicação
│   │   └── server/
│   │       └── main.go        # Inicialização do servidor
│   ├── internal/              # Lógica de negócio (Arquitetura Hexagonal)
│   │   ├── application/       # Casos de uso e DTOs
│   │   ├── domain/           # Entidades e interfaces
│   │   ├── infrastructure/   # Implementações concretas
│   │   └── interfaces/       # Controllers e rotas HTTP
│   ├── pkg/                  # Pacotes compartilhados
│   │   ├── errors/           # Tratamento de erros
│   │   ├── logger/           # Sistema de logging
│   │   └── validator/        # Validações
│   ├── docs/                 # Documentação Swagger
│   │   ├── docs.go           # Código gerado do Swagger
│   │   ├── swagger.json      # Especificação JSON
│   │   ├── swagger.yaml      # Especificação YAML
│   │   └── swagger_update.yaml # Atualizações da API
│   ├── tests/                # Testes de integração
│   │   ├── integration/      # Testes de integração
│   │   └── fixtures/         # Dados de teste
│   ├── scripts/              # Scripts de automação
│   ├── bin/                  # Binários compilados
│   ├── API_DOCUMENTATION.md  # Documentação da API
│   ├── DATABASE_MODELING.md  # Modelagem do banco
│   ├── README.md             # Documentação do backend
│   ├── Dockerfile            # Container do backend
│   ├── env.example           # Exemplo de variáveis
│   ├── go.mod                # Dependências Go
│   ├── go.sum                # Checksums das dependências
│   ├── swagger_response.json # Respostas do Swagger
│   └── .dockerignore         # Arquivos ignorados no Docker
├── frontend/                  # Interface web em React/TypeScript
│   ├── src/                  # Código fonte
│   │   ├── components/       # Componentes React
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Serviços de API
│   │   ├── stores/          # Gerenciamento de estado
│   │   ├── types/           # Definições TypeScript
│   │   ├── utils/           # Utilitários
│   │   ├── assets/          # Recursos estáticos
│   │   ├── App.tsx          # Componente principal
│   │   ├── main.tsx         # Ponto de entrada
│   │   └── index.css        # Estilos globais
│   ├── public/              # Arquivos estáticos
│   ├── dist/                # Build de produção
│   ├── FRONTEND_DOCUMENTATION.md # Documentação do frontend
│   ├── package.json          # Dependências Node.js
│   ├── package-lock.json     # Lock das dependências
│   ├── vite.config.ts        # Configuração do Vite
│   ├── tailwind.config.js    # Configuração do Tailwind
│   ├── tsconfig.json         # Configuração TypeScript
│   ├── eslint.config.js      # Configuração ESLint
│   └── postcss.config.js     # Configuração PostCSS
├── docker-compose.yml        # Orquestração de containers
├── TUTORIAL_PARA_RODAR.md   # Tutorial detalhado de execução
└── README.md                # Documentação principal
```

### 🏛️ Arquitetura Hexagonal (Backend)

A arquitetura hexagonal (também conhecida como Clean Architecture) separa o sistema em três camadas principais:

#### **Domain Layer** (`internal/domain/`) - Núcleo da Aplicação
- **Entidades** (`entities/`): Modelos de negócio centrais
  - `user.go` - Usuário do sistema
  - `booking.go` - Agendamento de sessões
  - `chair.go` - Cadeiras disponíveis
  - `availability.go` - Horários disponíveis
  - `audit_log.go` - Log de auditoria
  - `user_test.go` - Testes da entidade usuário

- **Ports** (`ports/`): Interfaces (contratos) - Lado de Entrada
  - `logger.go` - Interface de logging
  - `notification_service.go` - Interface de notificações
  - `password_hasher.go` - Interface de hash de senhas
  - `time_service.go` - Interface de serviços de tempo
  - `validator.go` - Interface de validação

- **Repositories** (`repositories/`): Interfaces de repositórios - Lado de Saída
  - `user_repository.go` - Interface do repositório de usuários
  - `booking_repository.go` - Interface do repositório de agendamentos
  - `availability_repository.go` - Interface do repositório de disponibilidade
  - `chair_repository.go` - Interface do repositório de cadeiras
  - `audit_log_repository.go` - Interface do repositório de auditoria
  - `email_repository.go` - Interface do repositório de email

#### **Application Layer** (`internal/application/`) - Casos de Uso
- **Use Cases** (`usecases/`): Lógica de negócio
  - `user_usecase.go` - Operações de usuário
  - `booking_usecase.go` - Operações de agendamento
  - `availability_usecase.go` - Gestão de disponibilidade
  - `chair_usecase.go` - Gestão de cadeiras
  - `dashboard_usecase.go` - Dashboard operacional
  - `notification_usecase.go` - Notificações
  - `audit_log_usecase.go` - Auditoria
  - `user_usecase_test.go` - Testes dos casos de uso de usuário

- **DTOs** (`dtos/`): Objetos de transferência de dados
  - `user_dto.go` - DTOs de usuário
  - `booking_dto.go` - DTOs de agendamento
  - `availability_dto.go` - DTOs de disponibilidade
  - `chair_dto.go` - DTOs de cadeira
  - `audit_log_dtos.go` - DTOs de auditoria
  - `user_dto_test.go` - Testes dos DTOs de usuário

- **Mappers** (`mappers/`): Conversão entre entidades e DTOs
  - `user_mapper.go` - Mapeamento de usuários
  - `booking_mapper.go` - Mapeamento de agendamentos
  - `availability_mapper.go` - Mapeamento de disponibilidade
  - `chair_mapper.go` - Mapeamento de cadeiras
  - `audit_log_mapper.go` - Mapeamento de auditoria
  - `user_mapper_test.go` - Testes dos mappers de usuário

#### **Infrastructure Layer** (`internal/infrastructure/`) - Adaptadores
- **Adapters** (`adapters/`): Implementações concretas
  - `bcrypt_password_hasher.go` - Hash de senhas com bcrypt
  - `bcrypt_password_hasher_test.go` - Testes do hash de senhas
  - `email_notification_service.go` - Serviço de email
  - `logger_adapter.go` - Adaptador de logging
  - `time_service_adapter.go` - Serviço de tempo
  - `time_service_adapter_test.go` - Testes do serviço de tempo
  - `validator_adapter.go` - Validação de dados
  - `validator_adapter_test.go` - Testes da validação

- **Repositories** (`repositories/`): Implementações de repositórios
  - `user_repository_impl.go` - Repositório de usuários
  - `booking_repository_impl.go` - Repositório de agendamentos
  - `availability_repository_impl.go` - Repositório de disponibilidade
  - `chair_repository_impl.go` - Repositório de cadeiras
  - `audit_log_repository_impl.go` - Repositório de auditoria

- **Database** (`database/`): Configuração e modelos de banco
  - `database.go` - Configuração do GORM
  - `models/` - Modelos de banco de dados
    - `user_model.go` - Modelo de usuário no banco

- **Config** (`config/`): Configurações da aplicação
  - `config.go` - Estruturas de configuração

- **Email** (`email/`): Serviços de email
  - `email_service.go` - Serviço de envio de emails
  - `templates.go` - Templates de email
  - `config.go` - Configuração de email

- **Scheduler** (`scheduler/`): Agendamento de tarefas
  - `scheduler.go` - Configuração do scheduler

#### **Interface Layer** (`internal/interfaces/`) - Controllers
- **HTTP Handlers** (`http/handlers/`): Controllers HTTP
  - `user_handler.go` - Endpoints de usuário
  - `booking_handler.go` - Endpoints de agendamento
  - `availability_handler.go` - Endpoints de disponibilidade
  - `chair_handler.go` - Endpoints de cadeira
  - `auth_handler.go` - Autenticação
  - `dashboard_handler.go` - Dashboard
  - `audit_log_handler.go` - Auditoria

- **Middleware** (`http/middleware/`): Middlewares HTTP
  - `auth.go` - Autenticação JWT
  - `cors.go` - CORS
  - `logging.go` - Logging de requisições
  - `security.go` - Segurança

- **Routes** (`http/routes/`): Definição de rotas
  - `user_routes.go` - Rotas de usuário
  - `booking_routes.go` - Rotas de agendamento
  - `availability_routes.go` - Rotas de disponibilidade
  - `chair_routes.go` - Rotas de cadeira

- **Routes** (`routes/`): Rotas adicionais
  - `dashboard_routes.go` - Rotas do dashboard

### 🎨 Arquitetura Frontend (React/TypeScript)

#### **Componentes** (`src/components/`)
- **Dashboard** (`dashboard/`): Componentes do dashboard
  - `AvailabilityCalendar.tsx` - Calendário de disponibilidade
  - `BookingList.tsx` - Lista de agendamentos
  - `BookingSummary.tsx` - Resumo de agendamentos
  - `ChairList.tsx` - Lista de cadeiras
  - `StatsCard.tsx` - Cards de estatísticas
  - `UserList.tsx` - Lista de usuários
  - `index.ts` - Exportações dos componentes

- **Forms** (`forms/`): Formulários da aplicação
  - `LoginForm.tsx` - Formulário de login
  - `RegisterStep1Form.tsx` - Registro passo 1
  - `RegisterStep2Form.tsx` - Registro passo 2
  - `BookingForm.tsx` - Formulário de agendamento
  - `UserForm.tsx` - Formulário de usuário
  - `index.ts` - Exportações dos formulários

- **Layout** (`layout/`): Componentes de layout
  - `DashboardLayout.tsx` - Layout do dashboard
  - `AuthLayout.tsx` - Layout de autenticação
  - `Header.tsx` - Cabeçalho
  - `Sidebar.tsx` - Barra lateral
  - `MinimalLayout.tsx` - Layout minimalista
  - `index.ts` - Exportações dos layouts

- **UI** (`ui/`): Componentes de interface
  - `button.tsx` - Botões
  - `input.tsx` - Campos de entrada
  - `card.tsx` - Cards
  - `alert.tsx` - Alertas
  - `badge.tsx` - Badges
  - `avatar.tsx` - Avatares
  - `select.tsx` - Seletores
  - `dropdown-menu.tsx` - Menus dropdown
  - `notification.tsx` - Notificações
  - `label.tsx` - Labels
  - `textarea.tsx` - Áreas de texto
  - `confirm-dialog.tsx` - Diálogos de confirmação
  - `index.ts` - Exportações dos componentes UI

- **Debug** (`debug/`): Componentes de debug
- **Examples** (`examples/`): Componentes de exemplo
  - `AvailabilitySlotsExample.tsx` - Exemplo de slots de disponibilidade
  - `AvailabilityTest.tsx` - Teste de disponibilidade

#### **Páginas** (`src/pages/`)
- **Auth** (`auth/`): Páginas de autenticação
  - `LoginPage.tsx` - Página de login
  - `RegisterPage.tsx` - Página de registro
  - `RegisterStep2Page.tsx` - Segundo passo do registro

- **Dashboard** (`dashboard/`): Dashboards por perfil
  - `AdminDashboardPage.tsx` - Dashboard de administrador
  - `AttendantDashboardPage.tsx` - Dashboard de atendente
  - `OperationalDashboardPage.tsx` - Dashboard operacional
  - `UserDashboardPage.tsx` - Dashboard de usuário
  - `index.ts` - Exportações das páginas

- **Bookings** (`bookings/`): Gestão de agendamentos
  - `BookingListPage.tsx` - Lista de agendamentos
  - `BookingCreatePage.tsx` - Criar agendamento
  - `BookingReschedulePage.tsx` - Reagendar

- **Users** (`users/`): Gestão de usuários
  - `UserListPage.tsx` - Lista de usuários
  - `UserCreatePage.tsx` - Criar usuário
  - `UserEditPage.tsx` - Editar usuário
  - `UserDetailPage.tsx` - Detalhes do usuário
  - `UserBookingPage.tsx` - Agendamentos do usuário
  - `UserPendingPage.tsx` - Usuários pendentes

- **Chairs** (`chairs/`): Gestão de cadeiras
  - `ChairListPage.tsx` - Lista de cadeiras
  - `ChairCreatePage.tsx` - Criar cadeira
  - `ChairEditPage.tsx` - Editar cadeira
  - `ChairDetailPage.tsx` - Detalhes da cadeira

- **Availability** (`availability/`): Gestão de disponibilidade
  - `AvailabilityListPage.tsx` - Lista de disponibilidade
  - `AvailabilityCreatePage.tsx` - Criar disponibilidade
  - `AvailabilityDetailPage.tsx` - Detalhes da disponibilidade

#### **Serviços** (`src/services/`)
- `api.ts` - Cliente HTTP base
- `authService.ts` - Serviços de autenticação
- `userService.ts` - Serviços de usuário
- `bookingService.ts` - Serviços de agendamento
- `chairService.ts` - Serviços de cadeira
- `availabilityService.ts` - Serviços de disponibilidade
- `dashboardService.ts` - Serviços de dashboard

#### **Hooks** (`src/hooks/`)
- `useAuth.ts` - Hook de autenticação
- `useUsers.ts` - Hook de usuários
- `useBookings.ts` - Hook de agendamentos
- `useChairs.ts` - Hook de cadeiras
- `useAvailability.ts` - Hook de disponibilidade
- `useBookingNotifications.ts` - Hook de notificações

#### **Stores** (`src/stores/`)
- `authStore.ts` - Estado de autenticação (Zustand)

#### **Types** (`src/types/`)
- `user.ts` - Tipos de usuário
- `booking.ts` - Tipos de agendamento
- `chair.ts` - Tipos de cadeira
- `availability.ts` - Tipos de disponibilidade
- `api.ts` - Tipos da API
- `index.ts` - Exportações de tipos

#### **Utils** (`src/utils/`)
- `cn.ts` - Utilitários de classes CSS
- `constants.ts` - Constantes da aplicação
- `formatters.ts` - Formatadores de dados
- `validation.ts` - Validações

### 🔧 Padrões de Design Implementados

#### **Backend (Arquitetura Hexagonal)**
- **Hexagonal Architecture**: Separação clara entre domínio, aplicação e infraestrutura
- **Dependency Inversion**: Inversão de dependências através de interfaces
- **Repository Pattern**: Abstração de acesso a dados
- **Use Case Pattern**: Casos de uso bem definidos
- **DTO Pattern**: Transferência de dados estruturada
- **Middleware Pattern**: Processamento de requisições
- **Factory Pattern**: Criação de objetos complexos
- **Adapter Pattern**: Adaptadores para tecnologias externas

#### **Frontend**
- **Component Composition**: Composição de componentes
- **Custom Hooks**: Lógica reutilizável
- **Service Layer**: Abstração de chamadas de API
- **State Management**: Gerenciamento centralizado de estado
- **Type Safety**: Tipagem estática com TypeScript
- **Form Management**: Gerenciamento de formulários
- **Error Boundaries**: Tratamento de erros

### 📊 Fluxo de Dados

#### **Backend (Arquitetura Hexagonal)**
```
HTTP Request → Interface Layer → Application Layer → Domain Layer
                ↓
HTTP Response ← Interface Layer ← Application Layer ← Domain Layer
                ↑
Infrastructure Layer (Adaptadores)
```

#### **Frontend**
```
User Action → Component → Hook → Service → API → Backend
                ↓
UI Update ← Component ← Hook ← Service ← API ← Backend
```

### 🛡️ Segurança

#### **Backend**
- **JWT Authentication**: Autenticação baseada em tokens
- **Password Hashing**: Senhas criptografadas com bcrypt
- **CORS**: Cross-Origin Resource Sharing configurado
- **Input Validation**: Validação de dados de entrada
- **Audit Logging**: Log de todas as operações críticas
- **Role-based Access**: Controle de acesso por perfil

#### **Frontend**
- **Token Storage**: Tokens JWT armazenados seguramente
- **Route Protection**: Proteção de rotas por perfil
- **Input Sanitization**: Sanitização de dados de entrada
- **Error Handling**: Tratamento seguro de erros
- **HTTPS**: Comunicação segura com backend

## 🚀 Tecnologias Utilizadas

### Backend
- **Go 1.23.0** - Linguagem principal para desenvolvimento da API
- **Gin v1.10.1** - Framework web para criação de endpoints REST
- **GORM v1.25.5** - ORM para PostgreSQL com migrações automáticas
- **PostgreSQL Driver v1.5.4** - Driver para PostgreSQL
- **JWT v5.2.0** - Autenticação e autorização segura
- **Swagger v1.16.5** - Documentação automática da API
- **Zap v1.27.0** - Logging estruturado e performático
- **Validator v10.27.0** - Validação de dados de entrada
- **Crypto v0.40.0** - Criptografia para hash de senhas
- **Testify v1.10.0** - Framework de testes

### Frontend
- **React 19.1.0** - Framework UI com hooks modernos
- **TypeScript 5.8.3** - Tipagem estática para maior segurança
- **Vite 7.0.4** - Build tool rápida e moderna
- **Tailwind CSS 3.4.17** - Framework CSS utilitário
- **React Router DOM 7.7.1** - Roteamento client-side
- **Zustand 5.0.6** - Gerenciamento de estado simples
- **Axios 1.11.0** - Cliente HTTP para comunicação com API
- **React Hook Form 7.61.1** - Gerenciamento de formulários
- **TanStack React Query 5.83.0** - Cache e sincronização de dados
- **Radix UI** - Componentes de interface acessíveis
  - Avatar, Dropdown Menu, Label, Progress, Select, Slot
- **Lucide React 0.525.0** - Ícones modernos
- **Date-fns 4.1.0** - Manipulação de datas
- **Zod 4.0.10** - Validação de esquemas
- **Sonner 2.0.6** - Notificações toast
- **Class Variance Authority 0.7.1** - Variantes de componentes
- **Tailwind Merge 3.3.1** - Merge de classes CSS

### Infraestrutura
- **Docker** - Containerização da aplicação
- **Docker Compose** - Orquestração de serviços
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões (opcional)

## 📋 Pré-requisitos

### Para Execução com Docker (Recomendado)
- Docker 20.10+
- Docker Compose 2.0+

### Para Desenvolvimento Local
- Node.js 18+
- Go 1.23+
- PostgreSQL 14+
- Git

## 🛠️ Como Executar Localmente

### ⚡ Inicialização Rápida (Recomendado)

1. **Clone o repositório**:
```bash
git clone <repository-url>
cd agendamento
```

2. **Execute com Docker Compose**:
```bash
docker-compose up -d
```

3. **Acesse a aplicação**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger Docs: http://localhost:8080/swagger/index.html

### 🐳 Configuração Docker

O projeto inclui um `docker-compose.yml` configurado com:

- **Backend**: API Go na porta 8080
- **Frontend**: React na porta 5173
- **PostgreSQL**: Banco de dados na porta 5432

### 💻 Desenvolvimento Local

#### Backend
```bash
cd backend
cp .env.example .env
# Configure as variáveis de ambiente
go mod download
go run cmd/server/main.go
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Banco de Dados
```bash
# Instale PostgreSQL e crie o banco
createdb agendamento
```

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente (Backend)

Crie um arquivo `.env` na pasta `backend/`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agendamento
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=agendamento

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=24h

# Server
PORT=8080
ENV=development

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Variáveis de Ambiente (Frontend)

Crie um arquivo `.env` na pasta `frontend/`:

```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Sistema de Agendamento
```

## 👥 Usuários Padrão para Teste

### Administrador
- **CPF:** 12345678909 
- **Senha**: 123456
- **Perfil**: Administrador do sistema

### Atendente
- **CPF:** 98765432100 
- **Senha**: 123456
- **Perfil**: Funcionário da recepção/atendimento

### Usuário/Cliente
- **CPF:** 11144477735 
- **Senha**: 123456
- **Perfil**: Cliente do sistema

### Acesso Online
- **Swagger UI**: http://localhost:8080/swagger/index.html
- **API Docs**: http://localhost:8080/swagger/doc.json

## 🧪 Testes

### Backend
```bash
cd backend
go test ./...
go test -v ./...
go test -cover ./...
```

**Estrutura de Testes**
- **Testes Unitários**: Espalhados pelos pacotes com sufixo `_test.go`
- **Testes de Integração**: `tests/integration/handlers_test.go`
- **Fixtures**: `tests/fixtures/test_data.go` - Dados de teste
- **Cobertura**: Testes cobrem use cases, adapters e handlers

### Frontend
```bash
cd frontend
npm run lint
npm test
```

**Estrutura de Testes**
- **ESLint**: Verificação de código
- **TypeScript**: Verificação de tipos
- **Testes de Componentes**: (planejado)
- **Testes de Hooks**: (planejado)

## 📦 Build de Produção

### Backend
```bash
cd backend
go build -o bin/server cmd/server/main.go
```

### Frontend
```bash
cd frontend
npm run build
```

### Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Porta já em uso**:
   - Mude a porta no docker-compose.yml
   - Ou pare outros serviços: `docker-compose down`

2. **Erro de conexão com banco**:
   - Verifique se PostgreSQL está rodando
   - Confirme as credenciais no .env

3. **Frontend não carrega**:
   - Verifique se o backend está rodando
   - Confirme a URL da API no .env do frontend

### Logs
```bash
# Ver logs do backend
docker-compose logs backend

# Ver logs do frontend
docker-compose logs frontend

# Ver todos os logs
docker-compose logs -f
```

## 📚 Documentação Adicional

- **[TUTORIAL_PARA_RODAR.md](TUTORIAL_PARA_RODAR.md)** - Tutorial detalhado para executar o projeto
- **[backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)** - Documentação completa da API
- **[backend/DATABASE_MODELING.md](backend/DATABASE_MODELING.md)** - Modelagem do banco de dados
- **[frontend/FRONTEND_DOCUMENTATION.md](frontend/FRONTEND_DOCUMENTATION.md)** - Documentação do frontend

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- Desenvolvimento inicial - [Flauberth Brito]