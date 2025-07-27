# 🚀 ESPECIFICAÇÃO COMPLETA DO FRONTEND - SISTEMA DE AGENDAMENTO

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura e Tecnologias](#arquitetura-e-tecnologias)
3. [Sistema de Autenticação](#sistema-de-autenticação)
4. [Entidades e Estruturas de Dados](#entidades-e-estruturas-de-dados)
5. [Endpoints da API](#endpoints-da-api)
6. [Regras de Negócio](#regras-de-negócio)
7. [Telas e Funcionalidades](#telas-e-funcionalidades)
8. [Estrutura do Projeto](#estrutura-do-projeto)
9. [Checklist de Implementação](#checklist-de-implementação)
10. [Configurações Técnicas](#configurações-técnicas)

---

## 🎯 Visão Geral

Sistema web completo para agendamento de massagens em cadeiras com sessões de 30 minutos, desenvolvido em React com TypeScript e integração com API REST em Go.

### **Funcionalidades Principais**
- ✅ **Autenticação**: Login com CPF e senha, sistema de roles
- ✅ **Cadastro**: Formulário em 2 etapas com validação
- ✅ **Agendamentos**: Criação, visualização e cancelamento
- ✅ **Dashboards**: Específicos por tipo de usuário
- ✅ **Gestão**: Usuários, cadeiras e disponibilidade
- ✅ **Aprovações**: Sistema de aprovação de cadastros
- ✅ **Notificações**: Emails automáticos

---

## 🏗️ Arquitetura e Tecnologias

### **Frontend Stack**
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Dates**: date-fns

### **Backend Integration**
- **API**: REST em Go (Gin)
- **Autenticação**: JWT (24h access, 7 dias refresh)
- **Banco**: PostgreSQL
- **Documentação**: Swagger/OpenAPI
- **Porta**: 8080

---

## 🔐 Sistema de Autenticação

### **Endpoints de Autenticação**
```typescript
// Login
POST /api/auth/login
Body: { cpf: string, password: string }
Response: { token: string, user: User, expires_at: Date }

// Registro
POST /api/auth/register
Body: CreateUserRequest
Response: { message: string, data: CreateUserResponse }

// Refresh Token
POST /api/auth/refresh
Headers: { Authorization: "Bearer <refresh_token>" }
Response: { token: string, expires_at: Date }

// Logout
POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
Response: { message: string }
```

### **Roles e Permissões**
```typescript
type UserRole = 'usuario' | 'atendente' | 'admin';

type UserStatus = 'pendente' | 'aprovado' | 'reprovado';

interface User {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  role: UserRole;
  requested_role: UserRole;
  status: UserStatus;
  // ... outros campos
}
```

### **Fluxo de Autenticação**
1. **Login**: CPF + senha → JWT token
2. **Verificação**: Token no header `Authorization: Bearer <token>`
3. **Refresh**: Renovação automática do token
4. **Logout**: Invalidação do token
5. **Proteção**: Rotas protegidas por role

---

## 📊 Entidades e Estruturas de Dados

### **1. USUÁRIO (User)**
```typescript
interface User {
  id: number;
  name: string;                    // Nome completo
  cpf: string;                     // CPF (formato: 12345678909)
  email: string;                   // Email único
  phone: string;                   // Telefone
  password: string;                // Senha (não retornada na API)
  role: 'usuario' | 'atendente' | 'admin';
  requested_role: 'usuario' | 'atendente' | 'admin';
  status: 'pendente' | 'aprovado' | 'reprovado';
  function: string;                // Ex: "Analista"
  position: string;                // Ex: "Analista de Sistemas"
  registration: string;            // Matrícula
  sector: string;                  // Ex: "Tecnologia da Informação"
  gender: 'masculino' | 'feminino' | 'outro';
  birth_date?: Date;               // Data de nascimento
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}
```

### **2. CADEIRA (Chair)**
```typescript
interface Chair {
  id: number;
  name: string;                    // Nome/ID da cadeira
  description?: string;            // Descrição
  location: string;                // Localização
  status: 'ativa' | 'inativa';     // Status da cadeira
  created_at: Date;
  updated_at: Date;
}
```

### **3. AGENDAMENTO (Booking)**
```typescript
interface Booking {
  id: number;
  user_id: number;
  chair_id: number;
  start_time: Date;                // Data e hora de início
  end_time: Date;                  // Data e hora de fim (30min depois)
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido' | 'falta';
  notes?: string;                  // Observações
  created_at: Date;
  updated_at: Date;
  user?: User;                     // Relacionamento
  chair?: Chair;                   // Relacionamento
}
```

### **4. DISPONIBILIDADE (Availability)**
```typescript
interface Availability {
  id: number;
  chair_id: number;
  day_of_week: number;             // 0=Domingo, 6=Sábado
  start_time: string;              // Formato HH:MM
  end_time: string;                // Formato HH:MM
  valid_from?: Date;               // Data de início da validade
  valid_to?: Date;                 // Data de fim da validade
  is_active: boolean;              // Se está ativa
  created_at: Date;
  updated_at: Date;
  chair?: Chair;                   // Relacionamento
}
```

---

## 🚀 Endpoints da API

### **🔐 AUTENTICAÇÃO**
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
```

### **👥 USUÁRIOS**
```
GET /api/users                    # Listar usuários
GET /api/users/:id                # Buscar usuário
POST /api/users                   # Criar usuário (admin)
PUT /api/users/:id                # Atualizar usuário (admin)
DELETE /api/users/:id             # Deletar usuário (admin)

# Aprovações (atendentes e admins)
GET /api/users/pending            # Usuários pendentes
POST /api/users/:id/approve       # Aprovar usuário
POST /api/users/:id/reject        # Rejeitar usuário
```

### **🪑 CADEIRAS**
```
GET /api/chairs                   # Listar cadeiras
GET /api/chairs/:id               # Buscar cadeira
GET /api/chairs/active            # Cadeiras ativas
GET /api/chairs/available         # Cadeiras disponíveis
GET /api/chairs/stats             # Estatísticas

# Apenas admin
POST /api/chairs                  # Criar cadeira
PUT /api/chairs/:id               # Atualizar cadeira
DELETE /api/chairs/:id            # Deletar cadeira
PUT /api/chairs/:id/status        # Alterar status
POST /api/chairs/:id/activate     # Ativar cadeira
POST /api/chairs/:id/deactivate   # Desativar cadeira
```

### **📅 AGENDAMENTOS**
```
# Todos os usuários autenticados
POST /api/bookings                # Criar agendamento
GET /api/bookings/:id             # Buscar agendamento
GET /api/bookings                 # Listar agendamentos
POST /api/bookings/:id/cancel     # Cancelar agendamento
GET /api/bookings/user/:user_id   # Agendamentos do usuário
GET /api/bookings/today           # Agendamentos de hoje
GET /api/bookings/upcoming        # Próximos agendamentos

# Atendentes e admins
GET /api/bookings/chair/:chair_id # Agendamentos por cadeira
GET /api/bookings/date/:date      # Agendamentos por data
GET /api/bookings/chair/:chair_id/date/:date # Agendamentos por cadeira e data
GET /api/bookings/stats           # Estatísticas
POST /api/bookings/:id/confirm    # Confirmar agendamento
POST /api/bookings/:id/complete   # Marcar como concluído
POST /api/bookings/:id/no-show    # Marcar como falta
POST /api/bookings/:id/attendance # Marcar presença

# Apenas admin
PUT /api/bookings/:id             # Atualizar agendamento
PUT /api/bookings/:id/reschedule  # Reagendar
```

### **⏰ DISPONIBILIDADE**
```
# Todos os usuários autenticados
GET /api/availabilities/:id       # Buscar disponibilidade
GET /api/availabilities           # Listar disponibilidades
GET /api/availabilities/chair/:chair_id # Disponibilidades por cadeira
GET /api/availabilities/chair/:chair_id/slots # Slots disponíveis
GET /api/availabilities/stats     # Estatísticas

# Apenas admin
POST /api/availabilities          # Criar disponibilidade
PUT /api/availabilities/:id       # Atualizar disponibilidade
DELETE /api/availabilities/:id    # Deletar disponibilidade
POST /api/availabilities/:id/activate    # Ativar
POST /api/availabilities/:id/deactivate  # Desativar
PUT /api/availabilities/:id/validity     # Definir período de validade
```

### **📊 DASHBOARD**
```
# Atendentes e admins
GET /api/dashboard/attendant      # Dashboard do atendente
GET /api/dashboard/sessions/date/:date # Sessões por data
GET /api/dashboard/chairs/occupancy # Ocupação das cadeiras
GET /api/dashboard/stats/attendance # Estatísticas de comparecimento

# Apenas admin
GET /api/dashboard/admin          # Dashboard do administrador
GET /api/dashboard/pending-approvals # Aprovações pendentes
POST /api/dashboard/test-reminders # Enviar lembretes de teste
```

---

## 📋 Regras de Negócio

### **🔐 Autenticação e Autorização**
- **Login**: Apenas com CPF e senha
- **Status**: Usuários `pendente` ou `reprovado` não conseguem fazer login
- **Token**: Bearer token no header `Authorization`
- **Refresh**: Token válido por 7 dias para renovar access token

### **👥 Gestão de Usuários**
- **Cadastro**: Usuários novos ficam com status `pendente`
- **Aprovação**: Apenas `atendentes` e `admins` podem aprovar usuários
- **Atendentes**: Apenas `admins` podem aprovar cadastro de atendentes
- **Hierarquia**: `admin` > `atendente` > `usuario`

### **📅 Agendamentos**
- **Duração**: Sessões fixas de 30 minutos
- **Conflitos**: Impedir conflitos de horário para usuário ou cadeira
- **Cancelamento**: Mínimo 3 horas de antecedência
- **Limite**: Usuário pode ter apenas 1 agendamento ativo por vez
- **Horários**: Apenas dentro dos horários configurados na disponibilidade

### **🪑 Cadeiras**
- **Status**: `ativa` ou `inativa`
- **Gestão**: Apenas `admins` podem criar/editar/inativar
- **Disponibilidade**: Cadeiras inativas não aparecem para agendamento

### **⏰ Disponibilidade**
- **Configuração**: Apenas `admins` podem configurar
- **Dias**: 0=Domingo, 1=Segunda, ..., 6=Sábado
- **Horários**: Formato HH:MM (ex: "08:00", "18:00")
- **Slots**: Blocos de 30 minutos
- **Validade**: Período de validade configurável

### **📊 Dashboard**
- **Atendente**: Sessões do dia, aprovações pendentes, ocupação
- **Admin**: Tudo do atendente + gestão completa do sistema
- **Usuário**: Seus agendamentos e histórico

---

## 🖥️ Telas e Funcionalidades

### **1. TELA DE LOGIN**
```typescript
interface LoginForm {
  cpf: string;        // Validação: CPF válido
  password: string;   // Validação: mínimo 6 caracteres
}

// Funcionalidades:
- Formulário com CPF e senha
- Validação em tempo real com Zod
- Mensagem de erro para usuários não aprovados
- Link para cadastro ("Não tem uma conta? Criar Conta")
- Redirecionamento automático por role após login
```

### **2. CADASTRO DE USUÁRIO (2 ETAPAS)**

#### **Etapa 1: Dados Pessoais e Profissionais**
```typescript
interface Step1Form {
  name: string;           // Nome completo (mínimo 2 caracteres)
  cpf: string;            // CPF válido
  function: string;       // Ex: "Analista"
  position: string;       // Ex: "Analista de Sistemas"
  registration: string;   // Matrícula
  sector: string;         // Ex: "Tecnologia da Informação"
  email: string;          // Email válido
}

// Validações Zod:
- name: mínimo 2 caracteres
- cpf: formato válido
- function: obrigatório
- position: obrigatório
- registration: obrigatório
- sector: obrigatório
- email: formato válido
```

#### **Etapa 2: Dados Complementares**
```typescript
interface Step2Form {
  phone: string;              // Telefone (formato: (11) 99999-9999)
  gender: 'masculino' | 'feminino' | 'outro';
  birth_date: Date;           // Data de nascimento
  requested_role: 'usuario' | 'atendente' | 'admin';
  password: string;           // Senha (mínimo 6 caracteres)
  confirm_password: string;   // Confirmação de senha
}

// Validações Zod:
- phone: formato válido
- gender: obrigatório
- birth_date: data válida
- requested_role: obrigatório
- password: mínimo 6 caracteres
- confirm_password: deve ser igual à senha
```

### **3. DASHBOARD DO USUÁRIO**
```typescript
interface UserDashboard {
  // Estatísticas
  totalBookings: number;
  completedBookings: number;
  activeBookings: number;
  
  // Agendamentos
  upcomingBookings: Booking[];
  recentBookings: Booking[];
  
  // Ações
  canCreateBooking: boolean;
}

// Funcionalidades:
- Visualizar estatísticas pessoais
- Listar próximos agendamentos
- Botão "Agendar Nova Sessão"
- Histórico de agendamentos
- Cancelar agendamentos (com validação de 3h)
```

### **4. DASHBOARD DO ATENDENTE**
```typescript
interface AttendantDashboard {
  // Estatísticas do dia
  todaySessions: number;
  confirmedSessions: number;
  pendingSessions: number;
  pendingApprovals: number;
  
  // Dados
  todayBookings: Booking[];
  pendingUsers: User[];
  chairOccupancy: ChairOccupancy[];
}

// Funcionalidades:
- Visualizar sessões do dia
- Confirmar presença de usuários
- Aprovar/rejeitar cadastros de usuários
- Visualizar ocupação das cadeiras
- Estatísticas de comparecimento
```

### **5. DASHBOARD DO ADMINISTRADOR**
```typescript
interface AdminDashboard extends AttendantDashboard {
  // Funcionalidades adicionais
  systemStats: SystemStats;
  allChairs: Chair[];
  allUsers: User[];
  
  // Gestão completa
  canManageChairs: boolean;
  canManageAvailability: boolean;
  canApproveAttendants: boolean;
}

// Funcionalidades:
- Tudo do atendente +
- Gestão completa de cadeiras
- Configuração de disponibilidade
- Aprovação de atendentes
- Relatórios do sistema
- Envio de lembretes de teste
```

### **6. TELA DE AGENDAMENTO**
```typescript
interface BookingFlow {
  // Etapa 1: Seleção de Data
  selectedDate: Date;
  
  // Etapa 2: Seleção de Cadeira
  availableChairs: Chair[];
  selectedChair: Chair;
  
  // Etapa 3: Seleção de Horário
  availableTimeSlots: TimeSlot[];
  selectedTimeSlot: TimeSlot;
  
  // Confirmação
  bookingSummary: BookingSummary;
}

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
}

// Funcionalidades:
- Calendário para seleção de data
- Lista de cadeiras disponíveis
- Slots de horário (30 minutos)
- Validação de conflitos
- Confirmação e resumo
- Notificação de sucesso
```

---

## 📁 Estrutura do Projeto

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/                    # Componentes base (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── select.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── index.ts
│   │   ├── forms/                 # Formulários reutilizáveis
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── booking-form.tsx
│   │   │   └── user-form.tsx
│   │   ├── layout/                # Layout, Header, Sidebar
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── navigation.tsx
│   │   │   └── footer.tsx
│   │   └── dashboard/             # Componentes específicos do dashboard
│   │       ├── stats-card.tsx
│   │       ├── booking-list.tsx
│   │       ├── user-list.tsx
│   │       └── chair-list.tsx
│   ├── pages/
│   │   ├── auth/                  # Autenticação
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── register-step2.tsx
│   │   ├── dashboard/             # Dashboards por role
│   │   │   ├── user-dashboard.tsx
│   │   │   ├── attendant-dashboard.tsx
│   │   │   └── admin-dashboard.tsx
│   │   ├── bookings/              # Agendamentos
│   │   │   ├── booking-list.tsx
│   │   │   ├── booking-create.tsx
│   │   │   ├── booking-detail.tsx
│   │   │   └── booking-calendar.tsx
│   │   ├── users/                 # Gestão de usuários
│   │   │   ├── user-list.tsx
│   │   │   ├── user-create.tsx
│   │   │   ├── user-edit.tsx
│   │   │   └── user-approvals.tsx
│   │   ├── chairs/                # Gestão de cadeiras
│   │   │   ├── chair-list.tsx
│   │   │   ├── chair-create.tsx
│   │   │   └── chair-edit.tsx
│   │   └── availability/          # Gestão de disponibilidade
│   │       ├── availability-list.tsx
│   │       ├── availability-create.tsx
│   │       └── availability-edit.tsx
│   ├── hooks/
│   │   ├── useAuth.ts             # Hook de autenticação
│   │   ├── useApi.ts              # Hook para chamadas da API
│   │   ├── useBookings.ts         # Hook para agendamentos
│   │   ├── useUsers.ts            # Hook para usuários
│   │   ├── useChairs.ts           # Hook para cadeiras
│   │   └── useAvailability.ts     # Hook para disponibilidade
│   ├── services/
│   │   ├── api.ts                 # Configuração do Axios
│   │   ├── auth.ts                # Serviços de autenticação
│   │   ├── users.ts               # Serviços de usuários
│   │   ├── bookings.ts            # Serviços de agendamentos
│   │   ├── chairs.ts              # Serviços de cadeiras
│   │   ├── availability.ts        # Serviços de disponibilidade
│   │   └── dashboard.ts           # Serviços do dashboard
│   ├── types/
│   │   ├── user.ts                # Tipos de usuário
│   │   ├── booking.ts             # Tipos de agendamento
│   │   ├── chair.ts               # Tipos de cadeira
│   │   ├── availability.ts        # Tipos de disponibilidade
│   │   ├── auth.ts                # Tipos de autenticação
│   │   └── api.ts                 # Tipos de resposta da API
│   ├── utils/
│   │   ├── validation.ts          # Schemas Zod
│   │   ├── formatters.ts          # Formatação de dados
│   │   ├── constants.ts           # Constantes do sistema
│   │   ├── date-utils.ts          # Utilitários de data
│   │   └── cpf-utils.ts           # Utilitários de CPF
│   ├── stores/
│   │   ├── authStore.ts           # Estado de autenticação
│   │   ├── uiStore.ts             # Estado da interface
│   │   └── bookingStore.ts        # Estado de agendamentos
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## ✅ Checklist de Implementação

### **Fase 1: Setup e Configuração**
- [ ] **Setup do projeto React + TypeScript**
  - [ ] Criar projeto com Vite
  - [ ] Configurar TypeScript
  - [ ] Instalar dependências base

- [ ] **Configuração do Tailwind + shadcn/ui**
  - [ ] Instalar e configurar Tailwind CSS
  - [ ] Configurar shadcn/ui
  - [ ] Criar componentes base (Button, Input, Card, etc.)

- [ ] **Estrutura de pastas**
  - [ ] Criar estrutura de diretórios
  - [ ] Configurar aliases de importação
  - [ ] Configurar ESLint e Prettier

- [ ] **Configuração do Axios**
  - [ ] Configurar interceptors
  - [ ] Configurar base URL
  - [ ] Configurar headers de autenticação

- [ ] **Tipos TypeScript**
  - [ ] Definir interfaces baseadas na API
  - [ ] Criar tipos para formulários
  - [ ] Criar tipos para respostas da API

### **Fase 2: Autenticação**
- [ ] **Tela de login**
  - [ ] Formulário com CPF e senha
  - [ ] Validação com Zod
  - [ ] Tratamento de erros
  - [ ] Loading states

- [ ] **Tela de cadastro (2 etapas)**
  - [ ] Etapa 1: Dados pessoais e profissionais
  - [ ] Etapa 2: Dados complementares e senha
  - [ ] Validação em ambas as etapas
  - [ ] Indicador de progresso
  - [ ] Navegação entre etapas

- [ ] **Hook de autenticação**
  - [ ] useAuth hook
  - [ ] Gerenciamento de token
  - [ ] Refresh automático
  - [ ] Logout

- [ ] **Proteção de rotas**
  - [ ] Componente ProtectedRoute
  - [ ] Redirecionamento por role
  - [ ] Verificação de status do usuário

### **Fase 3: Dashboards**
- [ ] **Dashboard do usuário**
  - [ ] Estatísticas pessoais
  - [ ] Lista de agendamentos
  - [ ] Botão de novo agendamento
  - [ ] Histórico

- [ ] **Dashboard do atendente**
  - [ ] Sessões do dia
  - [ ] Aprovações pendentes
  - [ ] Ocupação das cadeiras
  - [ ] Estatísticas de comparecimento

- [ ] **Dashboard do administrador**
  - [ ] Tudo do atendente
  - [ ] Gestão completa do sistema
  - [ ] Relatórios avançados
  - [ ] Configurações do sistema

- [ ] **Componentes de estatísticas**
  - [ ] StatsCard component
  - [ ] Charts e gráficos
  - [ ] Indicadores visuais

### **Fase 4: Funcionalidades Core**
- [ ] **CRUD de agendamentos**
  - [ ] Listar agendamentos
  - [ ] Criar agendamento (fluxo completo)
  - [ ] Visualizar detalhes
  - [ ] Cancelar agendamento
  - [ ] Validações de negócio

- [ ] **CRUD de usuários (admin)**
  - [ ] Listar usuários
  - [ ] Criar usuário
  - [ ] Editar usuário
  - [ ] Deletar usuário
  - [ ] Sistema de aprovações

- [ ] **CRUD de cadeiras (admin)**
  - [ ] Listar cadeiras
  - [ ] Criar cadeira
  - [ ] Editar cadeira
  - [ ] Ativar/desativar cadeira

- [ ] **Gestão de disponibilidade (admin)**
  - [ ] Listar disponibilidades
  - [ ] Criar disponibilidade
  - [ ] Editar disponibilidade
  - [ ] Configurar horários

### **Fase 5: Polimento e Otimização**
- [ ] **Responsividade completa**
  - [ ] Mobile-first design
  - [ ] Breakpoints adequados
  - [ ] Teste em diferentes dispositivos

- [ ] **Loading states**
  - [ ] Skeleton loaders
  - [ ] Loading spinners
  - [ ] Estados de carregamento

- [ ] **Error handling**
  - [ ] Tratamento de erros da API
  - [ ] Mensagens de erro amigáveis
  - [ ] Fallbacks para falhas

- [ ] **Notificações**
  - [ ] Toast notifications
  - [ ] Alert dialogs
  - [ ] Confirmações de ações

- [ ] **Testes**
  - [ ] Testes unitários
  - [ ] Testes de integração
  - [ ] Testes E2E

---

## ⚙️ Configurações Técnicas

### **Dependências Principais**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-hook-form": "^7.43.0",
    "zod": "^3.20.0",
    "@hookform/resolvers": "^2.9.0",
    "axios": "^1.3.0",
    "zustand": "^4.3.0",
    "@tanstack/react-query": "^4.29.0",
    "date-fns": "^2.29.0",
    "lucide-react": "^0.263.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^1.2.0",
    "tailwind-merge": "^1.13.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "@vitejs/plugin-react": "^3.1.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.2.0",
    "typescript": "^4.9.0",
    "vite": "^4.1.0"
  }
}
```

### **Configuração do Vite**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@stores': path.resolve(__dirname, './src/stores'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

### **Configuração do Tailwind**
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### **Variáveis de Ambiente**
```env
# .env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Sistema de Agendamento
VITE_APP_VERSION=1.0.0

# .env.production
VITE_API_URL=https://api.agendamento.com
VITE_APP_NAME=Sistema de Agendamento
VITE_APP_VERSION=1.0.0
```

### **Usuários de Teste**
```
Admin: admin@sistema.com / 123456
Atendente: atendente@sistema.com / 123456
Usuário: cliente@sistema.com / 123456
```

---

## 🎯 Próximos Passos

1. **Setup inicial** do projeto React + TypeScript
2. **Configuração** do Tailwind CSS e shadcn/ui
3. **Implementação** do sistema de autenticação
4. **Desenvolvimento** das telas de login e cadastro
5. **Criação** dos dashboards por role
6. **Implementação** das funcionalidades de agendamento
7. **Desenvolvimento** das funcionalidades administrativas
8. **Polimento** e testes finais

---

## 📞 Suporte

Para dúvidas ou suporte durante o desenvolvimento:

- **Documentação da API**: http://localhost:8080/swagger/index.html
- **Backend**: Go + Gin + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS

---

**🎉 Boa sorte no desenvolvimento! Este documento contém todas as informações necessárias para criar um frontend completo e funcional!** 