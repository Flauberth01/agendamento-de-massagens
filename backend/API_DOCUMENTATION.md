# Documentação da API

Esta documentação descreve todos os endpoints da API do Sistema de Agendamento.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints](#endpoints)
4. [Modelos de Dados](#modelos-de-dados)
5. [Códigos de Status](#códigos-de-status)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Swagger](#swagger)

## 🌐 Visão Geral

- **Base URL**: `http://localhost:8080/api/v1`
- **Content-Type**: `application/json`
- **Autenticação**: JWT Bearer Token
- **Documentação Swagger**: `http://localhost:8080/swagger/index.html`

## 🔐 Autenticação

A API utiliza JWT (JSON Web Token) para autenticação.

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Resposta de Login
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "João Silva",
      "role": "admin"
    }
  }
}
```

### Uso do Token
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📡 Endpoints

### 🔐 Autenticação

#### POST /api/v1/auth/login
Autentica um usuário e retorna um token JWT.

**Parâmetros:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "number",
      "email": "string",
      "name": "string",
      "role": "string"
    }
  }
}
```

#### POST /api/v1/auth/register
Registra um novo usuário.

**Parâmetros:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "string"
}
```

**Resposta (201):**
```json
{
  "success": true,
  "data": {
    "id": "number",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

#### POST /api/v1/auth/refresh
Renova o token JWT.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "token": "string"
  }
}
```

### 👥 Usuários

#### GET /api/v1/users
Lista todos os usuários (apenas admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Página atual (padrão: 1)
- `limit` (number): Itens por página (padrão: 10)
- `search` (string): Termo de busca

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "number",
        "name": "string",
        "email": "string",
        "role": "string",
        "created_at": "string",
        "updated_at": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "pages": "number"
    }
  }
}
```

#### GET /api/v1/users/{id}
Obtém detalhes de um usuário específico.

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "id": "number",
    "name": "string",
    "email": "string",
    "role": "string",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

#### PUT /api/v1/users/{id}
Atualiza um usuário.

**Parâmetros:**
```json
{
  "name": "string",
  "email": "string",
  "role": "string"
}
```

#### DELETE /api/v1/users/{id}
Remove um usuário.

### 👨‍⚕️ Profissionais

#### GET /api/v1/professionals
Lista todos os profissionais.

**Query Parameters:**
- `page` (number): Página atual
- `limit` (number): Itens por página
- `specialty` (string): Filtrar por especialidade
- `search` (string): Termo de busca

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "professionals": [
      {
        "id": "number",
        "name": "string",
        "email": "string",
        "phone": "string",
        "specialty": "string",
        "crm": "string",
        "active": "boolean",
        "created_at": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "pages": "number"
    }
  }
}
```

#### POST /api/v1/professionals
Cria um novo profissional.

**Parâmetros:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "specialty": "string",
  "crm": "string",
  "active": "boolean"
}
```

#### GET /api/v1/professionals/{id}
Obtém detalhes de um profissional.

#### PUT /api/v1/professionals/{id}
Atualiza um profissional.

#### DELETE /api/v1/professionals/{id}
Remove um profissional.

### 👤 Pacientes

#### GET /api/v1/patients
Lista todos os pacientes.

**Query Parameters:**
- `page` (number): Página atual
- `limit` (number): Itens por página
- `search` (string): Termo de busca

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "number",
        "name": "string",
        "email": "string",
        "phone": "string",
        "cpf": "string",
        "birth_date": "string",
        "address": "string",
        "created_at": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "pages": "number"
    }
  }
}
```

#### POST /api/v1/patients
Cria um novo paciente.

**Parâmetros:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "cpf": "string",
  "birth_date": "string",
  "address": "string"
}
```

#### GET /api/v1/patients/{id}
Obtém detalhes de um paciente.

#### PUT /api/v1/patients/{id}
Atualiza um paciente.

#### DELETE /api/v1/patients/{id}
Remove um paciente.

### 📅 Consultas

#### GET /api/v1/appointments
Lista todas as consultas.

**Query Parameters:**
- `page` (number): Página atual
- `limit` (number): Itens por página
- `date` (string): Filtrar por data (YYYY-MM-DD)
- `professional_id` (number): Filtrar por profissional
- `patient_id` (number): Filtrar por paciente
- `status` (string): Filtrar por status

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "number",
        "patient_id": "number",
        "professional_id": "number",
        "date": "string",
        "time": "string",
        "status": "string",
        "notes": "string",
        "patient": {
          "id": "number",
          "name": "string",
          "email": "string"
        },
        "professional": {
          "id": "number",
          "name": "string",
          "specialty": "string"
        },
        "created_at": "string"
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "pages": "number"
    }
  }
}
```

#### POST /api/v1/appointments
Cria uma nova consulta.

**Parâmetros:**
```json
{
  "patient_id": "number",
  "professional_id": "number",
  "date": "string",
  "time": "string",
  "notes": "string"
}
```

#### GET /api/v1/appointments/{id}
Obtém detalhes de uma consulta.

#### PUT /api/v1/appointments/{id}
Atualiza uma consulta.

**Parâmetros:**
```json
{
  "date": "string",
  "time": "string",
  "status": "string",
  "notes": "string"
}
```

#### DELETE /api/v1/appointments/{id}
Remove uma consulta.

#### POST /api/v1/appointments/{id}/cancel
Cancela uma consulta.

#### POST /api/v1/appointments/{id}/reschedule
Reagenda uma consulta.

**Parâmetros:**
```json
{
  "date": "string",
  "time": "string"
}
```

### 📊 Relatórios

#### GET /api/v1/reports/appointments
Relatório de consultas por período.

**Query Parameters:**
- `start_date` (string): Data inicial (YYYY-MM-DD)
- `end_date` (string): Data final (YYYY-MM-DD)
- `professional_id` (number): Filtrar por profissional

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "total_appointments": "number",
    "completed": "number",
    "cancelled": "number",
    "pending": "number",
    "by_professional": [
      {
        "professional_id": "number",
        "professional_name": "string",
        "total": "number",
        "completed": "number",
        "cancelled": "number"
      }
    ],
    "by_date": [
      {
        "date": "string",
        "total": "number",
        "completed": "number",
        "cancelled": "number"
      }
    ]
  }
}
```

#### GET /api/v1/reports/patients
Relatório de pacientes.

**Query Parameters:**
- `start_date` (string): Data inicial
- `end_date` (string): Data final

### 🔧 Utilitários

#### GET /api/v1/health
Verifica o status da API.

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "string",
    "version": "string"
  }
}
```

#### GET /api/v1/available-times
Obtém horários disponíveis para agendamento.

**Query Parameters:**
- `professional_id` (number): ID do profissional
- `date` (string): Data (YYYY-MM-DD)

**Resposta (200):**
```json
{
  "success": true,
  "data": {
    "available_times": [
      "09:00",
      "10:00",
      "11:00",
      "14:00",
      "15:00",
      "16:00"
    ]
  }
}
```

## 📋 Modelos de Dados

### Usuário
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "role": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### Profissional
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "phone": "string",
  "specialty": "string",
  "crm": "string",
  "active": "boolean",
  "created_at": "string",
  "updated_at": "string"
}
```

### Paciente
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "phone": "string",
  "cpf": "string",
  "birth_date": "string",
  "address": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

### Consulta
```json
{
  "id": "number",
  "patient_id": "number",
  "professional_id": "number",
  "date": "string",
  "time": "string",
  "status": "string",
  "notes": "string",
  "created_at": "string",
  "updated_at": "string",
  "patient": "object",
  "professional": "object"
}
```

## 📊 Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Não autorizado |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito de dados |
| 422 | Unprocessable Entity - Dados inválidos |
| 500 | Internal Server Error - Erro interno |

## 💡 Exemplos de Uso

### Criar uma Consulta
```bash
curl -X POST http://localhost:8080/api/v1/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": 1,
    "professional_id": 2,
    "date": "2024-01-15",
    "time": "14:00",
    "notes": "Consulta de rotina"
  }'
```

### Listar Consultas
```bash
curl -X GET "http://localhost:8080/api/v1/appointments?date=2024-01-15&professional_id=2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Atualizar Consulta
```bash
curl -X PUT http://localhost:8080/api/v1/appointments/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "notes": "Consulta realizada com sucesso"
  }'
```

### Cancelar Consulta
```bash
curl -X POST http://localhost:8080/api/v1/appointments/1/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📚 Swagger

A documentação interativa da API está disponível em:
- **URL**: `http://localhost:8080/swagger/index.html`
- **Especificação OpenAPI**: `http://localhost:8080/swagger/doc.json`

### Recursos do Swagger
- Documentação interativa
- Teste de endpoints
- Exemplos de requisições
- Esquemas de dados
- Códigos de resposta

## 🔒 Segurança

### Autenticação
- JWT Bearer Token
- Expiração configurável
- Refresh token disponível

### Autorização
- Controle de acesso baseado em roles
- Endpoints protegidos por middleware
- Validação de permissões

### Validação
- Validação de dados de entrada
- Sanitização de dados
- Proteção contra SQL Injection
- Rate limiting
