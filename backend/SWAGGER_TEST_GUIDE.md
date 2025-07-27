# 🧪 Guia Completo de Teste no Swagger UI

## 📋 Índice
1. [Campos Obrigatórios para Registro](#campos-obrigatórios-para-registro)
2. [Autenticação JWT](#autenticação-jwt)
3. [Usuários de Teste Disponíveis](#usuários-de-teste-disponíveis)
4. [Fluxo de Teste por Role](#fluxo-de-teste-por-role)
5. [Testando Endpoints de Autenticação](#testando-endpoints-de-autenticação)
6. [Testando Endpoints de Usuários](#testando-endpoints-de-usuários)
7. [Testando Endpoints de Cadeiras](#testando-endpoints-de-cadeiras)
8. [Testando Endpoints de Agendamentos](#testando-endpoints-de-agendamentos)
9. [Testando Endpoints de Disponibilidade](#testando-endpoints-de-disponibilidade)
10. [Testando Dashboard](#testando-dashboard)
11. [Validação de Erros](#validação-de-erros)

## 📝 Campos Obrigatórios para Registro

Para registrar um novo usuário via `POST /api/auth/register`, todos os campos são obrigatórios:

### 🔴 **Campos Obrigatórios:**
- **`name`** - Nome completo (mínimo 2, máximo 60 caracteres)
- **`cpf`** - CPF válido (formato brasileiro)
- **`email`** - Email válido
- **`phone`** - Telefone (mínimo 10, máximo 20 caracteres)
- **`password`** - Senha (mínimo 6 caracteres)
- **`gender`** - Gênero ("masculino", "feminino" ou "outro")
- **`function`** - Função/Cargo
- **`position`** - Posição/Hierarquia
- **`registration`** - Matrícula
- **`sector`** - Setor
- **`birth_date`** - Data de nascimento (formato ISO)
- **`requested_role`** - Role solicitado ("usuario", "atendente" ou "admin")

### 📋 Exemplo Completo de JSON:
```json
{
  "name": "João Silva",
  "cpf": "55566677788",
  "email": "joao@teste.com",
  "phone": "11999999999",
  "password": "senha123",
  "gender": "masculino",
  "function": "Desenvolvedor",
  "position": "Junior",
  "registration": "12345",
  "sector": "TI",
  "birth_date": "1990-01-15T00:00:00Z",
  "requested_role": "usuario"
}
```

### ⚠️ Observações Importantes:
- **Status inicial**: Todos os novos usuários são criados com status "pendente"
- **Aprovação necessária**: Apenas administradores e atendentes podem aprovar usuários
- **Role padrão**: Se não especificado, o `requested_role` será "usuario"
- **Validações**: O sistema valida CPF, email e outros campos automaticamente
- **Endpoint público**: Não requer autenticação para registro

## 🔐 Autenticação JWT

### Como usar a autenticação:

1. **Faça login** via `POST /api/auth/login` com CPF e senha
2. **Copie o token** do campo `access_token` da resposta
3. **No Swagger UI**, clique no botão "Authorize" (🔒) no topo da página
4. **Cole o token** no campo "Value" com o formato: `Bearer <seu_token>`
5. **Clique em "Authorize"** e depois "Close"

### Exemplo de resposta do login:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2025-07-25T23:30:00Z",
  "user": {
    "id": 1,
    "name": "Admin",
    "role": "admin",
    "status": "aprovado"
  }
}
```

### Headers necessários para endpoints protegidos:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👥 Usuários de Teste Disponíveis

### 1. Administrador
```json
{
  "cpf": "12345678909",
  "password": "123456",
  "role": "admin",
  "status": "aprovado"
}
```

### 2. Atendente
```json
{
  "cpf": "98765432100",
  "password": "123456",
  "role": "atendente",
  "status": "aprovado"
}
```

### 3. Cliente
```json
{
  "cpf": "11144477735",
  "password": "123456",
  "role": "usuario",
  "status": "aprovado"
}
```

## 🔄 Fluxo de Teste por Role

### 🎯 Role: ADMIN
**Capacidades**: Acesso total ao sistema

**Fluxo de Teste**:
1. Login como admin
2. Criar novos usuários
3. Gerenciar cadeiras
4. Aprovar/rejeitar usuários
5. Criar disponibilidades
6. Acessar dashboard
7. Visualizar logs de auditoria

### 🎯 Role: ATENDENTE
**Capacidades**: Aprovar usuários e gerenciar agendamentos

**Fluxo de Teste**:
1. Login como atendente
2. Visualizar usuários pendentes
3. Aprovar/rejeitar usuários
4. Gerenciar agendamentos
5. Criar disponibilidades
6. Acessar dashboard

### 🎯 Role: USUARIO
**Capacidades**: Fazer agendamentos

**Fluxo de Teste**:
1. Login como usuário
2. Visualizar cadeiras disponíveis
3. Criar agendamentos
4. Gerenciar próprios agendamentos
5. Visualizar disponibilidades

## 🔐 Testando Endpoints de Autenticação

### 1. Login (POST /api/auth/login)

**Teste com Admin**:
```json
{
  "cpf": "12345678909",
  "password": "123456"
}
```

**Resposta Esperada**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@sistema.com",
    "cpf": "12345678909",
    "role": "admin",
    "status": "aprovado"
  },
  "expires_at": "2024-01-16T10:30:00Z"
}
```

**Teste com Atendente**:
```json
{
  "cpf": "98765432100",
  "password": "123456"
}
```

**Teste com Cliente**:
```json
{
  "cpf": "11144477735",
  "password": "123456"
}
```

### 2. Refresh Token (POST /api/auth/refresh)

**Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Logout (POST /api/auth/logout)

**Headers**: `Authorization: Bearer <token>`

## 👤 Testando Endpoints de Usuários

### 1. Listar Usuários (GET /api/users)

**Headers**: `Authorization: Bearer <admin_token>`

**Resposta Esperada**:
```json
[
  {
    "id": 1,
    "name": "Administrador",
    "email": "admin@sistema.com",
    "cpf": "12345678909",
    "role": "admin",
    "status": "aprovado"
  },
  {
    "id": 2,
    "name": "Atendente",
    "email": "atendente@sistema.com",
    "cpf": "98765432100",
    "role": "atendente",
    "status": "aprovado"
  },
  {
    "id": 3,
    "name": "Cliente",
    "email": "cliente@sistema.com",
    "cpf": "11144477735",
    "role": "usuario",
    "status": "aprovado"
  }
]
```

### 2. Criar Usuário (POST /api/users) - Admin Only

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:
```json
{
  "name": "João Silva",
  "cpf": "55566677788",
  "email": "joao@teste.com",
  "phone": "11999999999",
  "password": "senha123",
  "gender": "masculino",
  "function": "Desenvolvedor",
  "position": "Junior",
  "registration": "12345",
  "sector": "TI",
  "birth_date": "1990-01-15T00:00:00Z",
  "requested_role": "usuario"
}
```

### 3. Registrar Novo Usuário (POST /api/auth/register) - Público

**Body** (todos os campos obrigatórios):
```json
{
  "name": "Maria Silva",
  "cpf": "99988877766",
  "email": "maria@teste.com",
  "phone": "11988888888",
  "password": "senha123",
  "gender": "feminino",
  "function": "Analista",
  "position": "Pleno",
  "registration": "202108",
  "sector": "RH",
  "birth_date": "1985-05-20T00:00:00Z",
  "requested_role": "atendente"
}
```

**Resposta Esperada**:
```json
{
  "id": 4,
  "name": "Maria Silva",
  "email": "maria@teste.com",
  "status": "pendente",
  "role": "usuario",
  "message": "Usuário registrado com sucesso. Aguarde aprovação de um administrador ou atendente."
}
```

### 4. Buscar Usuário por ID (GET /api/users/{id})

**Headers**: `Authorization: Bearer <admin_token>`

### 5. Usuários Pendentes (GET /api/users/pending) - Admin/Attendant

**Headers**: `Authorization: Bearer <admin_token>`

### 6. Aprovar Usuário (POST /api/users/{id}/approve) - Admin/Attendant

**Headers**: `Authorization: Bearer <admin_token>`

### 7. Rejeitar Usuário (POST /api/users/{id}/reject) - Admin/Attendant

**Headers**: `Authorization: Bearer <admin_token>`

## 🪑 Testando Endpoints de Cadeiras

### 1. Listar Cadeiras (GET /api/chairs)

**Headers**: `Authorization: Bearer <admin_token>`

**Resposta Esperada**:
```json
[
  {
    "id": 1,
    "name": "Cadeira 01",
    "description": "Cadeira de massagem localizada no térreo",
    "location": "Térreo - Sala 1",
    "status": "ativa"
  },
  {
    "id": 2,
    "name": "Cadeira 02",
    "description": "Cadeira de massagem localizada no térreo",
    "location": "Térreo - Sala 2",
    "status": "ativa"
  },
  {
    "id": 3,
    "name": "Cadeira 03",
    "description": "Cadeira de massagem localizada no primeiro andar",
    "location": "1º Andar - Sala 1",
    "status": "ativa"
  }
]
```

### 2. Criar Cadeira (POST /api/chairs) - Admin Only

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:
```json
{
  "name": "Cadeira 04",
  "description": "Cadeira de massagem premium",
  "location": "2º Andar - Sala VIP",
  "status": "ativa"
}
```

### 3. Buscar Cadeira por ID (GET /api/chairs/{id})

**Headers**: `Authorization: Bearer <admin_token>`

### 4. Atualizar Cadeira (PUT /api/chairs/{id}) - Admin Only

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:
```json
{
  "name": "Cadeira 04 - Premium",
  "description": "Cadeira de massagem premium atualizada",
  "location": "2º Andar - Sala VIP",
  "status": "ativa"
}
```

### 5. Deletar Cadeira (DELETE /api/chairs/{id}) - Admin Only

**Headers**: `Authorization: Bearer <admin_token>`

## 📅 Testando Endpoints de Agendamentos

### 1. Listar Agendamentos (GET /api/bookings)

**Headers**: `Authorization: Bearer <user_token>`

### 2. Criar Agendamento (POST /api/bookings)

**Headers**: `Authorization: Bearer <user_token>`

**Body**:
```json
{
  "chair_id": 1,
  "date": "2024-01-20",
  "start_time": "14:00",
  "end_time": "15:00",
  "notes": "Massagem relaxante"
}
```

### 3. Buscar Agendamento por ID (GET /api/bookings/{id})

**Headers**: `Authorization: Bearer <user_token>`

### 4. Atualizar Agendamento (PUT /api/bookings/{id})

**Headers**: `Authorization: Bearer <user_token>`

**Body**:
```json
{
  "chair_id": 1,
  "date": "2024-01-20",
  "start_time": "15:00",
  "end_time": "16:00",
  "notes": "Massagem relaxante - horário alterado"
}
```

### 5. Cancelar Agendamento (DELETE /api/bookings/{id})

**Headers**: `Authorization: Bearer <user_token>`

## ⏰ Testando Endpoints de Disponibilidade

### 1. Listar Disponibilidades (GET /api/availability)

**Headers**: `Authorization: Bearer <admin_token>`

### 2. Criar Disponibilidade (POST /api/availability) - Admin/Attendant

**Headers**: `Authorization: Bearer <admin_token>`

**Body**:
```json
{
  "chair_id": 1,
  "day_of_week": 1,
  "start_time": "08:00",
  "end_time": "18:00",
  "valid_from": "2024-01-15T00:00:00Z",
  "valid_to": "2024-12-31T23:59:59Z",
  "is_active": true
}
```

### 3. Buscar Disponibilidade por ID (GET /api/availability/{id})

**Headers**: `Authorization: Bearer <admin_token>`

### 4. Atualizar Disponibilidade (PUT /api/availability/{id}) - Admin/Attendant

**Headers**: `Authorization: Bearer <admin_token>`

### 5. Deletar Disponibilidade (DELETE /api/availability/{id}) - Admin/Attendant

**Headers**: `Authorization: Bearer <admin_token>`

## 📊 Testando Dashboard

### ⚠️ **IMPORTANTE**: Todos os endpoints do dashboard requerem autenticação JWT!

**Passos para testar:**
1. Faça login via `POST /api/auth/login`
2. Copie o `access_token` da resposta
3. No Swagger UI, clique em "Authorize" (🔒) e cole: `Bearer <seu_token>`
4. Agora você pode testar os endpoints do dashboard

### Dashboard do Administrador
- **Endpoint**: `GET /api/dashboard/admin`
- **Descrição**: Retorna estatísticas completas para administradores
- **Parâmetros**: `date` (opcional) - Data para filtrar (YYYY-MM-DD)
- **Permissão**: Apenas administradores
- **Headers**: `Authorization: Bearer <token>`

### Dashboard do Atendente
- **Endpoint**: `GET /api/dashboard/attendant`
- **Descrição**: Retorna dados específicos para atendentes
- **Parâmetros**: `date` (opcional) - Data para filtrar (YYYY-MM-DD)
- **Permissão**: Administradores e atendentes
- **Headers**: `Authorization: Bearer <token>`

### Aprovações Pendentes
- **Endpoint**: `GET /api/dashboard/pending-approvals`
- **Descrição**: Lista usuários aguardando aprovação
- **Permissão**: Apenas administradores
- **Headers**: `Authorization: Bearer <token>`

### Ocupação das Cadeiras
- **Endpoint**: `GET /api/dashboard/chairs/occupancy`
- **Descrição**: Mostra ocupação atual das cadeiras
- **Permissão**: Administradores e atendentes
- **Headers**: `Authorization: Bearer <token>`

### Enviar Lembretes de Teste
- **Endpoint**: `POST /api/dashboard/test-reminders`
- **Descrição**: Envia lembretes de teste para todos os usuários
- **Permissão**: Apenas administradores
- **Headers**: `Authorization: Bearer <token>`

## ❌ Validação de Erros

### 1. Login com Credenciais Inválidas

**Body**:
```json
{
  "cpf": "12345678909",
  "password": "senhaerrada"
}
```

**Resposta Esperada**: `401 - CPF ou senha inválidos`

### 2. Acesso sem Token

**Endpoint**: `GET /api/users`

**Resposta Esperada**: `401 - Token de acesso requerido`

### 3. Acesso com Role Insuficiente

**Endpoint**: `POST /api/users` (com token de usuário)

**Resposta Esperada**: `403 - Acesso negado`

### 4. Dados Inválidos

**Body**:
```json
{
  "name": "",
  "cpf": "123",
  "email": "emailinvalido",
  "password": "123"
}
```

**Resposta Esperada**: `400 - Dados inválidos`

### 5. Recurso Não Encontrado

**Endpoint**: `GET /api/users/999`

**Resposta Esperada**: `404 - Usuário não encontrado`

## 🎯 Fluxos Completos de Teste

### Fluxo 1: Registro e Aprovação de Usuário

1. **Registrar Novo Usuário (Público)**
   ```json
   POST /api/auth/register
   {
     "name": "Maria Silva",
     "cpf": "99988877766",
     "email": "maria@teste.com",
     "phone": "11988888888",
     "password": "senha123",
     "gender": "feminino",
     "function": "Analista",
     "position": "Pleno",
     "registration": "202108",
     "sector": "RH",
     "birth_date": "1985-05-20T00:00:00Z",
     "requested_role": "atendente"
   }
   ```

2. **Login como Admin**
   ```json
   POST /api/auth/login
   {
     "cpf": "12345678909",
     "password": "123456"
   }
   ```

3. **Verificar Usuários Pendentes**
   ```json
   GET /api/users/pending
   ```

4. **Aprovar Usuário**
   ```json
   POST /api/users/4/approve
   ```

5. **Login do Novo Usuário**
   ```json
   POST /api/auth/login
   {
     "cpf": "99988877766",
     "password": "senha123"
   }
   ```

3. **Verificar Usuários Pendentes**
   ```json
   GET /api/users/pending
   ```

4. **Aprovar Usuário**
   ```json
   POST /api/users/4/approve
   ```

5. **Login do Novo Usuário**
   ```json
   POST /api/auth/login
   {
     "cpf": "99988877766",
     "password": "senha123"
   }
   ```

### Fluxo 2: Criação de Agendamento

1. **Login como Cliente**
   ```json
   POST /api/auth/login
   {
     "cpf": "11144477735",
     "password": "123456"
   }
   ```

2. **Criar Agendamento**
   ```json
   POST /api/bookings
   {
     "chair_id": 1,
     "date": "2024-01-25",
     "start_time": "14:00",
     "end_time": "15:00",
     "notes": "Primeira massagem"
   }
   ```

3. **Verificar Agendamento**
   ```json
   GET /api/bookings/1
   ```

### Fluxo 3: Gerenciamento de Cadeiras

1. **Login como Admin**
   ```json
   POST /api/auth/login
   {
     "cpf": "12345678909",
     "password": "123456"
   }
   ```

2. **Criar Nova Cadeira**
   ```json
   POST /api/chairs
   {
     "name": "Cadeira Premium",
     "description": "Cadeira de massagem premium",
     "location": "Sala VIP",
     "status": "ativa"
   }
   ```

3. **Criar Disponibilidade**
   ```json
   POST /api/availability
   {
     "chair_id": 4,
     "day_of_week": 1,
     "start_time": "09:00",
     "end_time": "17:00",
     "is_active": true
   }
   ```

## 🔧 Dicas para Teste no Swagger UI

### 1. Configurando Autenticação
1. Faça login usando `/api/auth/login`
2. Copie o token da resposta
3. Clique em "Authorize" no topo do Swagger UI
4. Digite: `Bearer <seu_token>`
5. Clique em "Authorize"

### 2. Testando Diferentes Roles
- Use diferentes usuários para testar permissões
- Verifique se endpoints restritos retornam erro 403
- Teste fluxos completos com cada role

### 3. Validação de Dados
- Teste com dados válidos e inválidos
- Verifique mensagens de erro
- Teste limites (CPF inválido, email inválido, etc.)

### 4. Sequência de Testes
1. Teste autenticação primeiro
2. Teste endpoints básicos (GET)
3. Teste criação (POST)
4. Teste atualização (PUT)
5. Teste exclusão (DELETE)
6. Teste fluxos completos

---

**🎯 Dica**: Mantenha o Swagger UI aberto e teste todos os cenários possíveis para garantir que a API está funcionando corretamente! 