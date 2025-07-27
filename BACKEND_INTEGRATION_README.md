# 🚀 BACKEND API - GUIA COMPLETO DE INTEGRAÇÃO

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Configuração e Acesso](#configuração-e-acesso)
3. [Autenticação e Autorização](#autenticação-e-autorização)
4. [Estruturas de Dados](#estruturas-de-dados)
5. [Endpoints da API](#endpoints-da-api)
6. [Regras de Negócio](#regras-de-negócio)
7. [Exemplos de Integração](#exemplos-de-integração)
8. [Tratamento de Erros](#tratamento-de-erros)
9. [Usuários de Teste](#usuários-de-teste)

---

## 🎯 Visão Geral

API REST completa para sistema de agendamento de massagens em cadeiras, desenvolvida em **Go** com arquitetura hexagonal e documentação Swagger.

### **Tecnologias**
- **Backend**: Go 1.23 + Gin + GORM + PostgreSQL
- **Autenticação**: JWT (24h access, 7 dias refresh)
- **Documentação**: Swagger/OpenAPI
- **Porta**: 8080

### **Funcionalidades Disponíveis**
- ✅ **Autenticação**: Login, registro, refresh tokens
- ✅ **Usuários**: CRUD completo com sistema de aprovação
- ✅ **Cadeiras**: Gerenciamento de cadeiras de massagem
- ✅ **Agendamentos**: Criação e controle de sessões (30min)
- ✅ **Disponibilidade**: Configuração de horários
- ✅ **Dashboard**: Estatísticas e relatórios
- ✅ **Auditoria**: Log de todas as ações

---

## ⚙️ Configuração e Acesso

### **URLs de Acesso**
```bash
# API Base URL
http://localhost:8080/api

# Documentação Swagger
http://localhost:8080/swagger/index.html

# Health Check
http://localhost:8080/health
```

### **Headers Padrão**
```javascript
// Para todas as requisições autenticadas
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### **Configuração do Frontend**
```javascript
// Axios configuration
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🔐 Autenticação e Autorização

### **Sistema de Roles**
```typescript
type UserRole = 'usuario' | 'atendente' | 'admin';
type UserStatus = 'pendente' | 'aprovado' | 'reprovado';

// Hierarquia de permissões
// admin > atendente > usuario
```

### **Endpoints de Autenticação**

#### **1. Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "cpf": "12345678909",
  "password": "123456"
}
```

**Resposta de Sucesso (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "cpf": "12345678909",
    "email": "joao@example.com",
    "phone": "11999999999",
    "role": "usuario",
    "requested_role": "usuario",
    "status": "aprovado",
    "function": "Desenvolvedor",
    "position": "Junior",
    "registration": "12345",
    "sector": "TI",
    "gender": "masculino",
    "birth_date": "1990-01-15T00:00:00Z",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "last_login": "2024-01-15T10:30:00Z"
  },
  "expires_at": "2024-01-16T10:30:00Z"
}
```

#### **2. Registro**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "cpf": "12345678909",
  "email": "joao@example.com",
  "phone": "11999999999",
  "password": "123456",
  "gender": "masculino",
  "function": "Desenvolvedor",
  "position": "Junior",
  "registration": "12345",
  "sector": "TI",
  "birth_date": "1990-01-15T00:00:00Z",
  "requested_role": "usuario"
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "status": "pendente",
  "role": "usuario",
  "message": "Usuário registrado com sucesso. Aguarde aprovação."
}
```

#### **3. Refresh Token**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **4. Logout**
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### **Validações de Autenticação**
- **CPF**: Formato `123.456.789-09` ou `12345678909` (normalizado automaticamente)
- **Email**: Formato válido e único no sistema
- **Senha**: Mínimo 6 caracteres
- **Telefone**: Mínimo 10 caracteres
- **Status**: Apenas usuários `aprovado` podem fazer login

---

## 📊 Estruturas de Dados

### **1. USUÁRIO (User)**
```typescript
interface User {
  id: number;
  name: string;                    // Nome completo (2-60 chars)
  cpf: string;                     // CPF único (normalizado)
  email: string;                   // Email único
  phone: string;                   // Telefone (10-20 chars)
  password?: string;               // Não retornado na API
  role: 'usuario' | 'atendente' | 'admin';
  requested_role: 'usuario' | 'atendente' | 'admin';
  status: 'pendente' | 'aprovado' | 'reprovado';
  function: string;                // Ex: "Desenvolvedor"
  position: string;                // Ex: "Junior"
  registration: string;            // Matrícula
  sector: string;                  // Ex: "TI"
  gender: 'masculino' | 'feminino' | 'outro';
  birth_date?: string;             // ISO 8601
  created_at: string;              // ISO 8601
  updated_at: string;              // ISO 8601
  last_login?: string;             // ISO 8601
  bookings?: Booking[];            // Relacionamento
}
```

### **2. CADEIRA (Chair)**
```typescript
interface Chair {
  id: number;
  name: string;                    // Nome/ID da cadeira (2-100 chars)
  description?: string;            // Descrição (255 chars)
  location: string;                // Localização (2-100 chars)
  status: 'ativa' | 'inativa';     // Status da cadeira
  created_at: string;              // ISO 8601
  updated_at: string;              // ISO 8601
  bookings?: Booking[];            // Relacionamento
  availabilities?: Availability[]; // Relacionamento
}
```

### **3. AGENDAMENTO (Booking)**
```typescript
interface Booking {
  id: number;
  user_id: number;                 // ID do usuário
  chair_id: number;                // ID da cadeira
  start_time: string;              // ISO 8601 (data + hora)
  end_time: string;                // ISO 8601 (30min depois)
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido' | 'falta';
  notes?: string;                  // Observações (500 chars)
  created_at: string;              // ISO 8601
  updated_at: string;              // ISO 8601
  user?: User;                     // Relacionamento
  chair?: Chair;                   // Relacionamento
}
```

### **4. DISPONIBILIDADE (Availability)**
```typescript
interface Availability {
  id: number;
  chair_id: number;                // ID da cadeira
  day_of_week: number;             // 0=Domingo, 1=Segunda, ..., 6=Sábado
  start_time: string;              // Formato HH:MM (ex: "08:00")
  end_time: string;                // Formato HH:MM (ex: "18:00")
  valid_from?: string;             // ISO 8601 (data de início)
  valid_to?: string;               // ISO 8601 (data de fim)
  is_active: boolean;              // Se está ativa
  created_at: string;              // ISO 8601
  updated_at: string;              // ISO 8601
  chair?: Chair;                   // Relacionamento
}
```

---

## 🚀 Endpoints da API

### **🔐 AUTENTICAÇÃO**
```http
POST /api/auth/login              # Login com CPF e senha
POST /api/auth/register           # Registro de novo usuário
POST /api/auth/refresh            # Renovar token
POST /api/auth/logout             # Logout
```

### **👥 USUÁRIOS**

#### **Consulta (Todos autenticados)**
```http
GET /api/users                    # Listar usuários
GET /api/users/:id                # Buscar usuário por ID
```

#### **Aprovações (Atendentes e Admins)**
```http
GET /api/users/pending            # Usuários pendentes de aprovação
POST /api/users/:id/approve       # Aprovar usuário
POST /api/users/:id/reject        # Rejeitar usuário
```

#### **CRUD Completo (Apenas Admin)**
```http
POST /api/users                   # Criar usuário
PUT /api/users/:id                # Atualizar usuário
DELETE /api/users/:id             # Deletar usuário
```

### **🪑 CADEIRAS**

#### **Consulta (Todos autenticados)**
```http
GET /api/chairs                   # Listar todas as cadeiras
GET /api/chairs/:id               # Buscar cadeira por ID
GET /api/chairs/active            # Cadeiras ativas
GET /api/chairs/available         # Cadeiras disponíveis para agendamento
GET /api/chairs/stats             # Estatísticas das cadeiras
```

#### **Gestão (Apenas Admin)**
```http
POST /api/chairs                  # Criar cadeira
PUT /api/chairs/:id               # Atualizar cadeira
DELETE /api/chairs/:id            # Deletar cadeira
PUT /api/chairs/:id/status        # Alterar status
POST /api/chairs/:id/activate     # Ativar cadeira
POST /api/chairs/:id/deactivate   # Desativar cadeira
```

### **📅 AGENDAMENTOS**

#### **Operações Básicas (Todos autenticados)**
```http
POST /api/bookings                # Criar agendamento
GET /api/bookings/:id             # Buscar agendamento por ID
GET /api/bookings                 # Listar agendamentos
POST /api/bookings/:id/cancel     # Cancelar agendamento
GET /api/bookings/user/:user_id   # Agendamentos do usuário
GET /api/bookings/today           # Agendamentos de hoje
GET /api/bookings/upcoming        # Próximos agendamentos
```

#### **Controle de Sessões (Atendentes e Admins)**
```http
GET /api/bookings/chair/:chair_id # Agendamentos por cadeira
GET /api/bookings/date/:date      # Agendamentos por data
GET /api/bookings/chair/:chair_id/date/:date # Agendamentos por cadeira e data
GET /api/bookings/stats           # Estatísticas de agendamentos
POST /api/bookings/:id/confirm    # Confirmar agendamento
POST /api/bookings/:id/complete   # Marcar como concluído
POST /api/bookings/:id/no-show    # Marcar como falta
POST /api/bookings/:id/attendance # Marcar presença
```

#### **Operações Administrativas (Apenas Admin)**
```http
PUT /api/bookings/:id             # Atualizar agendamento
PUT /api/bookings/:id/reschedule  # Reagendar
```

### **⏰ DISPONIBILIDADE**

#### **Consulta (Todos autenticados)**
```http
GET /api/availabilities           # Listar disponibilidades
GET /api/availabilities/:id       # Buscar disponibilidade por ID
GET /api/availabilities/chair/:chair_id # Disponibilidades por cadeira
GET /api/availabilities/chair/:chair_id/slots # Slots disponíveis
GET /api/availabilities/stats     # Estatísticas de disponibilidade
```

#### **Gestão (Apenas Admin)**
```http
POST /api/availabilities          # Criar disponibilidade
PUT /api/availabilities/:id       # Atualizar disponibilidade
DELETE /api/availabilities/:id    # Deletar disponibilidade
POST /api/availabilities/:id/activate    # Ativar disponibilidade
POST /api/availabilities/:id/deactivate  # Desativar disponibilidade
PUT /api/availabilities/:id/validity     # Definir período de validade
```

### **📊 DASHBOARD**

#### **Dashboard do Atendente**
```http
GET /api/dashboard/attendant      # Dashboard do atendente
GET /api/dashboard/sessions/date/:date # Sessões por data
GET /api/dashboard/chairs/occupancy # Ocupação das cadeiras
GET /api/dashboard/stats/attendance # Estatísticas de comparecimento
```

#### **Dashboard do Admin**
```http
GET /api/dashboard/admin          # Dashboard do administrador
GET /api/dashboard/pending-approvals # Aprovações pendentes
POST /api/dashboard/test-reminders # Enviar lembretes de teste
```

### **📝 AUDITORIA**
```http
GET /api/audit-logs               # Listar logs de auditoria
GET /api/audit-logs/:id           # Buscar log por ID
GET /api/audit-logs/user/:user_id # Logs por usuário
GET /api/audit-logs/action/:action # Logs por ação
```

---

## 📋 Regras de Negócio

### **🔐 Autenticação**
- **Login**: Apenas usuários com status `aprovado`
- **Token**: Bearer token no header `Authorization`
- **Refresh**: Token válido por 7 dias para renovar access token
- **Logout**: Invalida o token atual

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

---

## 💻 Exemplos de Integração

### **1. Fluxo de Login**
```javascript
// Login
const login = async (cpf, password) => {
  try {
    const response = await api.post('/auth/login', { cpf, password });
    const { token, refresh_token, user } = response.data;
    
    // Salvar tokens
    localStorage.setItem('token', token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    throw new Error('Login falhou');
  }
};

// Refresh automático
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refresh_token = localStorage.getItem('refresh_token');
      if (refresh_token) {
        try {
          const response = await api.post('/auth/refresh', { refresh_token });
          localStorage.setItem('token', response.data.token);
          return api.request(error.config);
        } catch (refreshError) {
          // Redirecionar para login
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### **2. Criar Agendamento**
```javascript
const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', {
      chair_id: bookingData.chairId,
      start_time: bookingData.startTime, // ISO 8601
      end_time: bookingData.endTime,     // ISO 8601
      notes: bookingData.notes
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('Horário já está ocupado');
    }
    throw error;
  }
};
```

### **3. Listar Cadeiras Disponíveis**
```javascript
const getAvailableChairs = async (date) => {
  try {
    const response = await api.get('/chairs/available', {
      params: { date }
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar cadeiras disponíveis');
  }
};
```

### **4. Dashboard do Atendente**
```javascript
const getAttendantDashboard = async () => {
  try {
    const response = await api.get('/dashboard/attendant');
    return response.data;
  } catch (error) {
    throw new Error('Erro ao carregar dashboard');
  }
};
```

### **5. Aprovar Usuário**
```javascript
const approveUser = async (userId) => {
  try {
    const response = await api.post(`/users/${userId}/approve`);
    return response.data;
  } catch (error) {
    throw new Error('Erro ao aprovar usuário');
  }
};
```

---

## ⚠️ Tratamento de Erros

### **Códigos de Status HTTP**
```typescript
// Sucesso
200: OK                    // Operação realizada com sucesso
201: Created              // Recurso criado com sucesso

// Erro do Cliente
400: Bad Request          // Dados inválidos
401: Unauthorized         // Token inválido/expirado
403: Forbidden            // Sem permissão para a operação
404: Not Found            // Recurso não encontrado
409: Conflict             // Conflito (CPF/email já cadastrado)
422: Unprocessable Entity // Validação falhou

// Erro do Servidor
500: Internal Server Error // Erro interno do servidor
```

### **Estrutura de Erro**
```json
{
  "error": "Mensagem de erro",
  "code": "ERROR_CODE",
  "details": {
    "field": "Descrição do erro no campo"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### **Exemplos de Erros Comuns**
```javascript
// Token expirado
{
  "error": "Token inválido ou expirado",
  "code": "TOKEN_EXPIRED",
  "timestamp": "2024-01-15T10:30:00Z"
}

// Acesso negado
{
  "error": "Acesso negado. Role 'usuario' não tem permissão para esta operação",
  "code": "ACCESS_DENIED",
  "timestamp": "2024-01-15T10:30:00Z"
}

// Validação de CPF
{
  "error": "Dados inválidos",
  "code": "VALIDATION_ERROR",
  "details": {
    "cpf": "CPF deve ser válido"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🧪 Usuários de Teste

### **👑 Administrador**
```json
{
  "cpf": "12345678909",
  "password": "123456",
  "role": "admin",
  "status": "aprovado"
}
```

### **👨‍💼 Atendente**
```json
{
  "cpf": "98765432100",
  "password": "123456",
  "role": "atendente",
  "status": "aprovado"
}
```

### **👤 Cliente**
```json
{
  "cpf": "11144477735",
  "password": "123456",
  "role": "usuario",
  "status": "aprovado"
}
```

### **Como Usar os Usuários de Teste**
1. **Acesse**: `http://localhost:8080/swagger/index.html`
2. **Faça login** usando um dos usuários acima
3. **Configure autenticação**: Clique em "Authorize" e digite `Bearer <seu_token>`
4. **Teste os endpoints** conforme sua role

---

## 📚 Recursos Adicionais

### **Documentação Swagger**
- **URL**: `http://localhost:8080/swagger/index.html`
- **Guia Completo**: `SWAGGER_GUIDE.md`
- **Guia de Testes**: `SWAGGER_TEST_GUIDE.md`

### **Health Check**
```http
GET /health
```

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### **Logs de Auditoria**
Todas as ações são registradas automaticamente:
- Login/logout
- Criação/edição/exclusão de recursos
- Aprovações/rejeições
- Agendamentos/cancelamentos

---

## 🚀 Próximos Passos

1. **Configure o frontend** com as URLs e headers corretos
2. **Implemente o sistema de autenticação** com refresh automático
3. **Crie os componentes** para cada funcionalidade
4. **Teste a integração** usando os usuários de teste
5. **Implemente tratamento de erros** adequado
6. **Adicione validações** no frontend

---

## 📞 Suporte

Para dúvidas ou problemas:
- **Documentação Swagger**: `http://localhost:8080/swagger/index.html`
- **Logs do servidor**: Verifique os logs do Docker
- **Issues**: Abra uma issue no repositório

---

**🎯 Status**: ✅ API completa e documentada, pronta para integração! 