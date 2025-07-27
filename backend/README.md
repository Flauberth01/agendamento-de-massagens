# 🚀 Sistema de Agendamento - API Backend

## 📋 Descrição

API REST para sistema de agendamento de cadeiras de massagem, desenvolvida em Go com arquitetura hexagonal (Clean Architecture) e documentação completa via Swagger.

## 🏗️ Arquitetura

### Clean Architecture / Hexagonal Architecture
```
├── domain/          # Entidades e regras de negócio
├── application/     # Casos de uso e DTOs
├── infrastructure/  # Adaptadores, repositórios, banco
└── interfaces/      # Handlers HTTP, rotas, middleware
```

### Tecnologias Utilizadas
- **Go 1.23** - Linguagem principal
- **Gin** - Framework HTTP
- **GORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação e autorização
- **Swagger** - Documentação da API
- **Docker** - Containerização
- **Zap** - Logging estruturado

## 🚀 Funcionalidades

### ✅ Implementadas
- **Autenticação**: Login com CPF e senha, refresh tokens
- **Usuários**: CRUD completo com aprovação de novos usuários
- **Cadeiras**: Gerenciamento de cadeiras de massagem
- **Agendamentos**: Criação e gerenciamento de agendamentos
- **Disponibilidade**: Controle de horários disponíveis
- **Auditoria**: Log de todas as ações do sistema
- **Dashboard**: Estatísticas e relatórios
- **Documentação**: Swagger completo e atualizado

### 🔄 Em Desenvolvimento
- Sistema de notificações por email
- Relatórios avançados
- API de integração externa

## 🛠️ Instalação e Execução

### Pré-requisitos
- Go 1.23+
- Docker e Docker Compose
- PostgreSQL (via Docker)

### Execução com Docker Compose
```bash
# Clonar o repositório
git clone <repository-url>
cd agendamento/backend

# Executar com Docker Compose
docker-compose up -d

# Verificar logs
docker-compose logs -f api
```

### Execução Local
```bash
# Instalar dependências
go mod download

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrações
go run cmd/server/main.go
```

## 📚 Documentação da API

### Swagger UI
Acesse a documentação interativa da API:
```
http://localhost:8080/swagger/index.html
```

### Guias de Uso
- **Guia Completo**: `SWAGGER_GUIDE.md` - Documentação detalhada da API
- **Guia de Testes**: `SWAGGER_TEST_GUIDE.md` - Guia completo de testes no Swagger UI

### Usuários de Teste Disponíveis
O sistema já possui usuários de teste configurados automaticamente:

#### 👑 Administrador
- **CPF**: `12345678909`
- **Senha**: `123456`
- **Role**: `admin`
- **Capacidades**: Acesso total ao sistema

#### 👨‍💼 Atendente
- **CPF**: `98765432100`
- **Senha**: `123456`
- **Role**: `atendente`
- **Capacidades**: Aprovar usuários e gerenciar agendamentos

#### 👤 Cliente
- **CPF**: `11144477735`
- **Senha**: `123456`
- **Role**: `usuario`
- **Capacidades**: Fazer agendamentos

### Como Testar no Swagger UI

1. **Acesse**: `http://localhost:8080/swagger/index.html`
2. **Faça login** usando um dos usuários de teste acima
3. **Configure autenticação**: Clique em "Authorize" e digite `Bearer <seu_token>`
4. **Teste os endpoints** seguindo o guia `SWAGGER_TEST_GUIDE.md`

### Fluxos de Teste Recomendados

#### 🎯 Fluxo Admin
1. Login como admin
2. Criar novos usuários
3. Gerenciar cadeiras
4. Aprovar/rejeitar usuários
5. Criar disponibilidades
6. Acessar dashboard

#### 🎯 Fluxo Atendente
1. Login como atendente
2. Visualizar usuários pendentes
3. Aprovar/rejeitar usuários
4. Gerenciar agendamentos
5. Criar disponibilidades

#### 🎯 Fluxo Usuário
1. Login como usuário
2. Visualizar cadeiras disponíveis
3. Criar agendamentos
4. Gerenciar próprios agendamentos

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Login com CPF e senha
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

#### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário (Admin)
- `GET /api/users/{id}` - Buscar usuário
- `PUT /api/users/{id}` - Atualizar usuário (Admin)
- `DELETE /api/users/{id}` - Deletar usuário (Admin)
- `GET /api/users/pending` - Usuários pendentes
- `POST /api/users/{id}/approve` - Aprovar usuário
- `POST /api/users/{id}/reject` - Rejeitar usuário

#### Cadeiras
- `GET /api/chairs` - Listar cadeiras
- `POST /api/chairs` - Criar cadeira (Admin)
- `GET /api/chairs/{id}` - Buscar cadeira
- `PUT /api/chairs/{id}` - Atualizar cadeira (Admin)
- `DELETE /api/chairs/{id}` - Deletar cadeira (Admin)

#### Agendamentos
- `GET /api/bookings` - Listar agendamentos
- `POST /api/bookings` - Criar agendamento
- `GET /api/bookings/{id}` - Buscar agendamento
- `PUT /api/bookings/{id}` - Atualizar agendamento
- `DELETE /api/bookings/{id}` - Cancelar agendamento

#### Disponibilidade
- `GET /api/availability` - Listar disponibilidades
- `POST /api/availability` - Criar disponibilidade
- `GET /api/availability/{id}` - Buscar disponibilidade
- `PUT /api/availability/{id}` - Atualizar disponibilidade
- `DELETE /api/availability/{id}` - Deletar disponibilidade

## 🧪 Testes

### Executar Todos os Testes
```bash
go test ./...
```

### Executar Testes por Camada
```bash
# Testes de domínio
go test ./internal/domain/...

# Testes de aplicação
go test ./internal/application/...

# Testes de infraestrutura
go test ./internal/infrastructure/...

# Testes de integração
go test ./tests/integration/...
```

### Cobertura de Testes
```bash
go test -cover ./...
```

## 🔐 Autenticação e Autorização

### Roles de Usuário
- **usuario**: Usuário comum, pode fazer agendamentos
- **atendente**: Pode aprovar usuários e gerenciar agendamentos
- **admin**: Acesso total ao sistema

### JWT Tokens
- **Access Token**: Válido por 24 horas
- **Refresh Token**: Válido por 7 dias
- **Autorização**: Bearer token no header Authorization

## 📊 Estrutura de Dados

### Usuário
```go
type User struct {
    ID             uint      `json:"id"`
    Name           string    `json:"name"`
    CPF            string    `json:"cpf"`
    Email          string    `json:"email"`
    Phone          string    `json:"phone"`
    Password       string    `json:"-"`
    Role           string    `json:"role"`
    RequestedRole  string    `json:"requested_role"`
    Status         string    `json:"status"`
    Function       string    `json:"function"`
    Position       string    `json:"position"`
    Registration   string    `json:"registration"`
    Sector         string    `json:"sector"`
    Gender         string    `json:"gender"`
    BirthDate      *time.Time `json:"birth_date"`
    CreatedAt      time.Time `json:"created_at"`
    UpdatedAt      time.Time `json:"updated_at"`
    LastLogin      *time.Time `json:"last_login"`
}
```

### Agendamento
```go
type Booking struct {
    ID        uint      `json:"id"`
    UserID    uint      `json:"user_id"`
    ChairID   uint      `json:"chair_id"`
    Date      time.Time `json:"date"`
    StartTime string    `json:"start_time"`
    EndTime   string    `json:"end_time"`
    Status    string    `json:"status"`
    Notes     string    `json:"notes"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
```

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=agendamento_db

# JWT
JWT_SECRET=your-secret-key

# Server
PORT=8080
GIN_MODE=release

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 📈 Monitoramento

### Logs
- Logs estruturados com Zap
- Níveis: DEBUG, INFO, WARN, ERROR
- Formato JSON para produção

### Auditoria
- Todas as ações são registradas
- Logs de usuário e sistema
- Rastreamento de IP e User-Agent

## 🤝 Contribuição

### Padrões de Código
- Go modules
- Clean Architecture
- Testes unitários obrigatórios
- Documentação Swagger atualizada

### Fluxo de Desenvolvimento
1. Fork do repositório
2. Criar branch para feature
3. Implementar com testes
4. Atualizar documentação
5. Pull Request

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Consulte a documentação Swagger
- Verifique os logs do sistema

---

**🎯 Status do Projeto**: ✅ Documentação Swagger completa e atualizada!