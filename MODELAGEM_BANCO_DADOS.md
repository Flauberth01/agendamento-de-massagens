# Modelagem do Banco de Dados - Sistema de Agendamento

## Visão Geral

O sistema de agendamento utiliza PostgreSQL como banco de dados principal, com GORM como ORM para Go. A modelagem segue os princípios de Clean Architecture, separando as entidades de domínio dos modelos de persistência.

## Tecnologias Utilizadas

- **Banco de Dados**: PostgreSQL
- **ORM**: GORM (Go)
- **Migrações**: Auto-migração do GORM
- **Timezone**: America/Sao_Paulo

## Estrutura das Tabelas

### 1. Tabela `users`

**Descrição**: Armazena informações dos usuários do sistema (clientes, atendentes e administradores).

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    cpf VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'usuario',
    requested_role VARCHAR(20) DEFAULT 'usuario',
    status VARCHAR(20) DEFAULT 'pendente',
    function VARCHAR(50),
    position VARCHAR(50),
    registration VARCHAR(50),
    sector VARCHAR(50),
    gender VARCHAR(15),
    birth_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    last_login TIMESTAMP
);
```

**Campos Principais**:
- `id`: Chave primária auto-incremento
- `name`: Nome completo do usuário (máx. 60 caracteres)
- `cpf`: CPF único do usuário (máx. 15 caracteres)
- `email`: Email único do usuário (máx. 100 caracteres)
- `phone`: Telefone único do usuário (máx. 20 caracteres)
- `password`: Senha criptografada (máx. 255 caracteres)
- `role`: Papel atual no sistema (`usuario`, `atendente`, `admin`)
- `requested_role`: Papel solicitado durante cadastro
- `status`: Status do usuário (`pendente`, `aprovado`, `reprovado`)
- `function`: Função/cargo do usuário
- `position`: Posição hierárquica
- `registration`: Matrícula/registro
- `sector`: Setor de trabalho
- `gender`: Gênero (`masculino`, `feminino`, `outro`)
- `birth_date`: Data de nascimento
- `last_login`: Último login do usuário

**Índices**:
- Índice único em `cpf`
- Índice único em `email`
- Índice único em `phone`
- Índice em `deleted_at` (soft delete)

### 2. Tabela `chairs`

**Descrição**: Armazena informações das cadeiras de massagem disponíveis para agendamento.

```sql
CREATE TABLE chairs (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    location VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'ativa',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

**Campos Principais**:
- `id`: Chave primária auto-incremento
- `name`: Nome da cadeira (máx. 100 caracteres)
- `description`: Descrição detalhada da cadeira
- `location`: Localização física da cadeira (máx. 100 caracteres)
- `status`: Status da cadeira (`ativa`, `inativa`)

**Índices**:
- Índice em `deleted_at` (soft delete)

### 3. Tabela `availabilities`

**Descrição**: Define os horários de disponibilidade de cada cadeira por dia da semana.

```sql
CREATE TABLE availabilities (
    id BIGSERIAL PRIMARY KEY,
    chair_id BIGINT NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    valid_from DATE,
    valid_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (chair_id) REFERENCES chairs(id)
);
```

**Campos Principais**:
- `id`: Chave primária auto-incremento
- `chair_id`: Referência à cadeira (chave estrangeira)
- `day_of_week`: Dia da semana (0=Domingo, 1=Segunda, ..., 6=Sábado)
- `start_time`: Horário de início (formato HH:MM)
- `end_time`: Horário de fim (formato HH:MM)
- `valid_from`: Data de início da validade
- `valid_to`: Data de fim da validade
- `is_active`: Se a disponibilidade está ativa

**Índices**:
- Índice em `chair_id` (chave estrangeira)
- Índice em `deleted_at` (soft delete)

### 4. Tabela `bookings`

**Descrição**: Armazena os agendamentos realizados pelos usuários.

```sql
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    chair_id BIGINT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'agendado',
    notes VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (chair_id) REFERENCES chairs(id)
);
```

**Campos Principais**:
- `id`: Chave primária auto-incremento
- `user_id`: Referência ao usuário (chave estrangeira)
- `chair_id`: Referência à cadeira (chave estrangeira)
- `start_time`: Horário de início do agendamento
- `end_time`: Horário de fim do agendamento (sempre 30 min após início)
- `status`: Status do agendamento (`agendado`, `confirmado`, `cancelado`, `concluido`, `falta`)
- `notes`: Observações sobre o agendamento

**Índices**:
- Índice em `user_id` (chave estrangeira)
- Índice em `chair_id` (chave estrangeira)
- Índice em `deleted_at` (soft delete)

### 5. Tabela `audit_logs`

**Descrição**: Registra todas as ações realizadas no sistema para auditoria.

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id BIGINT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    description VARCHAR(500),
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Campos Principais**:
- `id`: Chave primária auto-incremento
- `user_id`: Referência ao usuário que executou a ação (opcional)
- `action`: Tipo de ação (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, etc.)
- `resource`: Recurso afetado (`USER`, `CHAIR`, `BOOKING`, `AVAILABILITY`, `AUTH`)
- `resource_id`: ID do recurso afetado
- `old_values`: Valores anteriores (JSON)
- `new_values`: Novos valores (JSON)
- `ip_address`: Endereço IP da requisição
- `user_agent`: User-Agent do navegador
- `description`: Descrição da ação

**Índices**:
- Índice em `user_id` (chave estrangeira)
- Índice em `action`
- Índice em `resource`
- Índice em `created_at`

## Relacionamentos

### Diagrama de Relacionamentos

```
users (1) ←→ (N) bookings
chairs (1) ←→ (N) bookings
chairs (1) ←→ (N) availabilities
users (1) ←→ (N) audit_logs
```

### Detalhamento dos Relacionamentos

1. **User → Bookings** (1:N)
   - Um usuário pode ter múltiplos agendamentos
   - Chave estrangeira: `bookings.user_id`

2. **Chair → Bookings** (1:N)
   - Uma cadeira pode ter múltiplos agendamentos
   - Chave estrangeira: `bookings.chair_id`

3. **Chair → Availabilities** (1:N)
   - Uma cadeira pode ter múltiplas disponibilidades (por dia da semana)
   - Chave estrangeira: `availabilities.chair_id`

4. **User → AuditLogs** (1:N)
   - Um usuário pode gerar múltiplos logs de auditoria
   - Chave estrangeira: `audit_logs.user_id` (opcional)

## Regras de Negócio Implementadas

### 1. Duração dos Agendamentos
- Todos os agendamentos têm duração fixa de 30 minutos
- Implementado via hooks do GORM (`BeforeCreate` e `BeforeUpdate`)

### 2. Status de Usuários
- `pendente`: Usuário aguardando aprovação
- `aprovado`: Usuário aprovado e ativo
- `reprovado`: Usuário reprovado

### 3. Status de Agendamentos
- `agendado`: Agendamento criado
- `confirmado`: Agendamento confirmado
- `cancelado`: Agendamento cancelado
- `concluido`: Sessão realizada
- `falta`: Usuário não compareceu

### 4. Status de Cadeiras
- `ativa`: Cadeira disponível para agendamento
- `inativa`: Cadeira indisponível

### 5. Soft Delete
- Todas as entidades principais implementam soft delete
- Campo `deleted_at` marca registros como deletados
- Índices criados para otimizar consultas

## Configurações do Banco

### Pool de Conexões
```go
MaxIdleConns: 10
MaxOpenConns: 100
ConnMaxLifetime: 1 hora
```

### Configurações de Ambiente
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=agendamento_db
DB_SSLMODE=disable
DB_TIMEZONE=America/Sao_Paulo
```

## Dados Iniciais (Seed)

### Usuários Padrão
1. **Administrador**
   - Email: admin@sistema.com
   - Senha: 123456
   - Role: admin
   - Status: aprovado

2. **Atendente**
   - Email: atendente@sistema.com
   - Senha: 123456
   - Role: atendente
   - Status: aprovado

3. **Cliente**
   - Email: cliente@sistema.com
   - Senha: 123456
   - Role: usuario
   - Status: aprovado

### Cadeiras Padrão
- Cadeira 01: Térreo - Sala 1
- Cadeira 02: Térreo - Sala 2
- Cadeira 03: 1º Andar - Sala 1

### Disponibilidades Padrão
- Segunda a Sexta: 08:00 às 18:00
- Válidas por 1 ano a partir da criação

## Validações e Constraints

### Validações de Domínio
- CPF deve ser único e válido
- Email deve ser único e válido
- Telefone deve ser único
- Senha mínima de 6 caracteres
- Nome mínimo de 2 caracteres
- Role deve ser um dos valores permitidos
- Status deve ser um dos valores permitidos

### Constraints de Banco
- Chaves primárias auto-incremento
- Chaves estrangeiras com integridade referencial
- Campos obrigatórios marcados como `NOT NULL`
- Campos únicos com constraints de unicidade
- Índices para otimização de consultas

## Considerações de Performance

1. **Índices Criados**:
   - Chaves primárias (automático)
   - Chaves estrangeiras
   - Campos de busca frequente (email, cpf, status)
   - Campos de ordenação (created_at)

2. **Soft Delete**:
   - Índices em `deleted_at` para filtrar registros ativos
   - Consultas otimizadas para não incluir registros deletados

3. **Relacionamentos**:
   - Eager loading controlado via GORM
   - Lazy loading para relacionamentos opcionais

## Segurança

1. **Senhas**: Criptografadas com bcrypt
2. **Auditoria**: Todas as ações registradas
3. **Soft Delete**: Previne perda acidental de dados
4. **Validações**: Múltiplas camadas de validação
5. **Timezone**: Configuração explícita para Brasil

## Migrações

O sistema utiliza auto-migração do GORM, que:
- Cria tabelas automaticamente
- Adiciona colunas quando necessário
- Mantém índices atualizados
- Preserva dados existentes

**Comando de migração**:
```go
db.AutoMigrate(
    &entities.User{},
    &entities.Chair{},
    &entities.Availability{},
    &entities.Booking{},
    &entities.AuditLog{},
)
```

## Monitoramento e Logs

1. **Logs de Auditoria**: Todas as ações registradas
2. **Logs de Sistema**: Operações de banco de dados
3. **Métricas**: Pool de conexões e performance
4. **Backup**: Recomendado diário para PostgreSQL

---

*Documento gerado em: $(date)*
*Versão do sistema: 1.0* 