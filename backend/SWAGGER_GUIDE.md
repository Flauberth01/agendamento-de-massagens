# 🚀 Guia Completo do Swagger - API de Agendamento

## 📋 Índice
1. [Acessando o Swagger UI](#acessando-o-swagger-ui)
2. [Estrutura da Documentação](#estrutura-da-documentação)
3. [Testando Endpoints de Autenticação](#testando-endpoints-de-autenticação)
4. [Testando Endpoints Protegidos](#testando-endpoints-protegidos)
5. [Exemplos de Uso](#exemplos-de-uso)
6. [Troubleshooting](#troubleshooting)

## 🌐 Acessando o Swagger UI

### URL do Swagger
```
http://localhost:8080/swagger/index.html
```

### Pré-requisitos
- Servidor rodando (Docker Compose ou local)
- Navegador web moderno
- Conhecimento básico de APIs REST

## 📚 Estrutura da Documentação

### Informações Gerais da API
- **Título**: Sistema de Agendamento API
- **Versão**: 1.0.0
- **Base Path**: `/api`
- **Host**: `localhost:8080`
- **Schemes**: `http`, `https`

### Funcionalidades Principais
- ✅ **Autenticação**: Login com CPF e senha, refresh tokens
- ✅ **Usuários**: CRUD completo com aprovação de novos usuários
- ✅ **Cadeiras**: Gerenciamento de cadeiras de massagem
- ✅ **Agendamentos**: Criação e gerenciamento de agendamentos
- ✅ **Disponibilidade**: Controle de horários disponíveis
- ✅ **Auditoria**: Log de todas as ações do sistema
- ✅ **Dashboard**: Estatísticas e relatórios

### Roles de Usuário
- **usuario**: Usuário comum, pode fazer agendamentos
- **atendente**: Pode aprovar usuários e gerenciar agendamentos
- **admin**: Acesso total ao sistema

## 🔐 Testando Endpoints de Autenticação

### 1. Login (POST /api/auth/login)

**Endpoint**: `POST /api/auth/login`

**Body**:
```json
{
  "cpf": "123.456.789-09",
  "password": "minhasenha123"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com",
    "cpf": "12345678909",
    "phone": "11999999999",
    "role": "usuario",
    "status": "aprovado",
    "function": "Desenvolvedor",
    "position": "Junior",
    "registration": "12345",
    "sector": "TI",
    "gender": "masculino",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "last_login": "2024-01-15T10:30:00Z"
  },
  "expires_at": "2024-01-16T10:30:00Z"
}
```

### 2. Refresh Token (POST /api/auth/refresh)

**Endpoint**: `POST /api/auth/refresh`

**Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Resposta de Sucesso (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2024-01-16T10:30:00Z"
}
```

### 3. Logout (POST /api/auth/logout)

**Endpoint**: `POST /api/auth/logout`

**Headers**: `Authorization: Bearer <token>`

**Resposta de Sucesso (200)**:
```json
{
  "message": "Logout realizado com sucesso"
}
```

## 🛡️ Testando Endpoints Protegidos

### Configurando Autenticação no Swagger

1. **Faça login** usando o endpoint `/api/auth/login`
2. **Copie o token** da resposta
3. **Clique no botão "Authorize"** no topo do Swagger UI
4. **Digite**: `Bearer <seu_token>` (ex: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
5. **Clique em "Authorize"**

### Endpoints que Requerem Autenticação

#### Usuários (Admin/Attendant)
- `GET /api/users` - Listar usuários
- `GET /api/users/{id}` - Buscar usuário por ID
- `POST /api/users` - Criar usuário (Admin)
- `PUT /api/users/{id}` - Atualizar usuário (Admin)
- `DELETE /api/users/{id}` - Deletar usuário (Admin)

#### Aprovação de Usuários (Attendant/Admin)
- `GET /api/users/pending` - Listar usuários pendentes
- `POST /api/users/{id}/approve` - Aprovar usuário
- `POST /api/users/{id}/reject` - Rejeitar usuário

#### Cadeiras (Admin)
- `GET /api/chairs` - Listar cadeiras
- `GET /api/chairs/{id}` - Buscar cadeira por ID
- `POST /api/chairs` - Criar cadeira
- `PUT /api/chairs/{id}` - Atualizar cadeira
- `DELETE /api/chairs/{id}` - Deletar cadeira

#### Agendamentos (Todos os usuários autenticados)
- `GET /api/bookings` - Listar agendamentos
- `GET /api/bookings/{id}` - Buscar agendamento por ID
- `POST /api/bookings` - Criar agendamento
- `PUT /api/bookings/{id}` - Atualizar agendamento
- `DELETE /api/bookings/{id}` - Cancelar agendamento

#### Disponibilidade (Admin/Attendant)
- `GET /api/availability` - Listar disponibilidades
- `GET /api/availability/{id}` - Buscar disponibilidade por ID
- `POST /api/availability` - Criar disponibilidade
- `PUT /api/availability/{id}` - Atualizar disponibilidade
- `DELETE /api/availability/{id}` - Deletar disponibilidade

## 📝 Exemplos de Uso

### Exemplo 1: Fluxo Completo de Usuário

1. **Criar usuário** (Admin)
```json
POST /api/users
{
  "name": "Maria Silva",
  "cpf": "987.654.321-00",
  "email": "maria@example.com",
  "phone": "11988888888",
  "password": "senha123",
  "gender": "feminino",
  "function": "Analista",
  "position": "Pleno",
  "registration": "54321",
  "sector": "RH",
  "requested_role": "usuario"
}
```

2. **Aprovar usuário** (Attendant/Admin)
```json
POST /api/users/2/approve
```

3. **Login do usuário**
```json
POST /api/auth/login
{
  "cpf": "98765432100",
  "password": "senha123"
}
```

4. **Criar agendamento** (com token do usuário)
```json
POST /api/bookings
{
  "chair_id": 1,
  "date": "2024-01-20",
  "start_time": "14:00",
  "end_time": "15:00",
  "notes": "Massagem relaxante"
}
```

### Exemplo 2: Gerenciamento de Cadeiras

1. **Criar cadeira** (Admin)
```json
POST /api/chairs
{
  "name": "Cadeira de Massagem 1",
  "description": "Cadeira profissional para massagem",
  "status": "ativa",
  "location": "Sala 101"
}
```

2. **Criar disponibilidade** (Admin/Attendant)
```json
POST /api/availability
{
  "chair_id": 1,
  "day_of_week": 1,
  "start_time": "08:00",
  "end_time": "18:00",
  "is_available": true
}
```

### Exemplo 3: Dashboard e Relatórios

1. **Estatísticas gerais**
```json
GET /api/dashboard/stats
```

2. **Enviar lembretes** (Admin)
```json
POST /api/dashboard/test-reminders
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Token Expirado
**Sintoma**: Erro 401 "Token inválido"
**Solução**: Use o endpoint `/api/auth/refresh` para renovar o token

#### 2. Acesso Negado
**Sintoma**: Erro 403 "Acesso negado"
**Solução**: Verifique se o usuário tem a role necessária para o endpoint

#### 3. Dados Inválidos
**Sintoma**: Erro 400 "Dados inválidos"
**Solução**: Verifique o formato dos dados enviados (CPF, email, etc.)

#### 4. Usuário Não Aprovado
**Sintoma**: Erro 401 "Usuário não está aprovado"
**Solução**: Aguarde aprovação de um atendente ou admin

### Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Dados inválidos
- **401**: Não autorizado (token inválido/expirado)
- **403**: Acesso negado (sem permissão)
- **404**: Recurso não encontrado
- **409**: Conflito (CPF/email já cadastrado)
- **500**: Erro interno do servidor

### Validações Importantes

#### CPF
- Formato aceito: `123.456.789-09` ou `12345678909`
- Deve ser um CPF válido
- Será normalizado automaticamente

#### Email
- Deve ser um email válido
- Deve ser único no sistema

#### Senha
- Mínimo 6 caracteres
- Será hasheada automaticamente

#### Telefone
- Mínimo 10 caracteres
- Formato: `11999999999`

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs do servidor
- Consulte a documentação da API
- Entre em contato com a equipe de desenvolvimento

---

**🎯 Dica**: Use o Swagger UI para explorar todos os endpoints disponíveis e testar diferentes cenários antes de implementar no seu código! 