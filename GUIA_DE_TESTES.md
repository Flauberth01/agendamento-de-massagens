# Guia de Testes - Sistema de Agendamento

Este documento fornece instruções completas sobre como executar os testes do projeto backend, incluindo testes unitários, de integração e de cobertura.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Estrutura dos Testes](#estrutura-dos-testes)
3. [Comandos Básicos](#comandos-básicos)
4. [Executando Testes Específicos](#executando-testes-específicos)
5. [Testes de Cobertura](#testes-de-cobertura)
6. [Debugging de Testes](#debugging-de-testes)
7. [Boas Práticas](#boas-práticas)
8. [Solução de Problemas](#solução-de-problemas)

## 🚀 Pré-requisitos

Antes de executar os testes, certifique-se de que:

1. **Go está instalado** (versão 1.19 ou superior)
2. **Você está no diretório correto:**
   ```bash
   cd backend
   ```
3. **As dependências estão instaladas:**
   ```bash
   go mod download
   ```

## 📁 Estrutura dos Testes

```
backend/
├── internal/
│   ├── domain/entities/          # Testes de entidades
│   │   ├── user_test.go
│   │   ├── booking_test.go
│   │   ├── chair_test.go
│   │   └── availability_test.go
│   ├── application/
│   │   ├── dtos/                # Testes de DTOs
│   │   │   ├── user_dto_test.go
│   │   │   ├── booking_dto_test.go
│   │   │   └── chair_dto_test.go
│   │   ├── mappers/             # Testes de mappers
│   │   │   └── user_mapper_test.go
│   │   └── usecases/            # Testes de use cases
│   │       └── user_usecase_test.go
│   └── infrastructure/adapters/  # Testes de adapters
│       ├── validator_adapter_test.go
│       ├── bcrypt_password_hasher_test.go
│       └── time_service_adapter_test.go
└── tests/
    ├── fixtures/                 # Dados de teste
    │   └── test_data.go
    └── integration/              # Testes de integração
        └── handlers_test.go
```

## 🎯 Comandos Básicos

### 1. **Rodar todos os testes**
```bash
go test ./... -v
```

### 2. **Rodar testes com informações detalhadas**
```bash
go test ./... -v -count=1
```

### 3. **Rodar testes em paralelo (mais rápido)**
```bash
go test ./... -v -parallel 4
```

### 4. **Rodar testes com timeout personalizado**
```bash
go test ./... -v -timeout 30s
```

## 🎯 Executando Testes Específicos

### **Testes por Categoria**

#### **Entidades (Domain)**
```bash
# Todos os testes de entidades
go test ./internal/domain/entities/... -v

# Testes específicos de usuário
go test ./internal/domain/entities -run TestUser -v

# Testes específicos de booking
go test ./internal/domain/entities -run TestBooking -v

# Testes específicos de chair
go test ./internal/domain/entities -run TestChair -v

# Testes específicos de availability
go test ./internal/domain/entities -run TestAvailability -v
```

#### **DTOs (Data Transfer Objects)**
```bash
# Todos os testes de DTOs
go test ./internal/application/dtos/... -v

# Testes específicos de user DTO
go test ./internal/application/dtos -run TestUser -v

# Testes específicos de booking DTO
go test ./internal/application/dtos -run TestBooking -v

# Testes específicos de chair DTO
go test ./internal/application/dtos -run TestChair -v
```

#### **Mappers**
```bash
# Todos os testes de mappers
go test ./internal/application/mappers/... -v

# Testes específicos de user mapper
go test ./internal/application/mappers -run TestUser -v
```

#### **Use Cases**
```bash
# Todos os testes de use cases
go test ./internal/application/usecases/... -v

# Testes específicos de user use case
go test ./internal/application/usecases -run TestUser -v
```

#### **Adapters (Infrastructure)**
```bash
# Todos os testes de adapters
go test ./internal/infrastructure/adapters/... -v

# Testes específicos de validator
go test ./internal/infrastructure/adapters -run TestValidator -v

# Testes específicos de password hasher
go test ./internal/infrastructure/adapters -run TestBcrypt -v

# Testes específicos de time service
go test ./internal/infrastructure/adapters -run TestTime -v
```

#### **Testes de Integração**
```bash
# Todos os testes de integração
go test ./tests/integration/... -v

# Testes específicos de handlers
go test ./tests/integration -run TestHandlers -v
```

### **Testes por Método Específico**

```bash
# Testar apenas um método específico
go test ./internal/domain/entities -run TestUser_IsAdmin -v

# Testar métodos relacionados a status
go test ./internal/domain/entities -run "Test.*Status" -v

# Testar métodos de validação
go test ./internal/application/dtos -run "Test.*Validation" -v
```

## 📊 Testes de Cobertura

### **Verificar cobertura básica**
```bash
go test ./... -cover
```

### **Gerar relatório de cobertura detalhado**
```bash
# Gerar arquivo de cobertura
go test ./... -coverprofile=coverage.out

# Gerar relatório HTML
go tool cover -html=coverage.out -o coverage.html

# Abrir relatório no navegador (Windows)
start coverage.html

# Abrir relatório no navegador (Linux/Mac)
open coverage.html
```

### **Cobertura por pacote**
```bash
# Cobertura das entidades
go test ./internal/domain/entities/... -cover

# Cobertura dos DTOs
go test ./internal/application/dtos/... -cover

# Cobertura dos use cases
go test ./internal/application/usecases/... -cover
```

## 🐛 Debugging de Testes

### **Executar testes com logs detalhados**
```bash
go test ./... -v -logtostderr
```

### **Executar um teste específico com debug**
```bash
go test ./internal/domain/entities -run TestUser_IsAdmin -v -count=1
```

### **Executar testes com race detector**
```bash
go test ./... -race
```

### **Executar testes com timeout longo para debug**
```bash
go test ./... -v -timeout 5m
```

### **Executar testes com verbose máximo**
```bash
go test ./... -v -count=1 -timeout 30s
```

## 📝 Boas Práticas

### **1. Antes de fazer commit**
```bash
# Rodar todos os testes
go test ./... -v

# Verificar cobertura
go test ./... -cover

# Rodar testes de integração
go test ./tests/integration/... -v
```

### **2. Durante o desenvolvimento**
```bash
# Rodar testes do pacote que está trabalhando
go test ./internal/domain/entities -v

# Rodar testes específicos que estão falhando
go test ./internal/domain/entities -run TestUser -v -count=1
```

### **3. Para CI/CD**
```bash
# Comando recomendado para pipelines
go test ./... -v -race -coverprofile=coverage.out
```

## 🔧 Solução de Problemas

### **Problema: Testes falhando aleatoriamente**
```bash
# Rodar testes múltiplas vezes para identificar flakiness
go test ./... -v -count=10
```

### **Problema: Testes muito lentos**
```bash
# Rodar em paralelo
go test ./... -v -parallel 8

# Rodar apenas testes específicos
go test ./internal/domain/entities -v
```

### **Problema: Dependências não encontradas**
```bash
# Limpar cache e reinstalar dependências
go clean -modcache
go mod download
go test ./... -v
```

### **Problema: Testes de integração falhando**
```bash
# Verificar se o banco de dados está rodando
# Verificar variáveis de ambiente
go test ./tests/integration/... -v -timeout 60s
```

## 📋 Checklist de Testes

Antes de fazer commit, verifique se:

- [ ] Todos os testes unitários passam: `go test ./internal/... -v`
- [ ] Todos os testes de integração passam: `go test ./tests/integration/... -v`
- [ ] Cobertura está adequada: `go test ./... -cover`
- [ ] Não há race conditions: `go test ./... -race`
- [ ] Testes não são flaky: `go test ./... -v -count=5`

## 🎯 Comandos Rápidos

### **Para desenvolvimento diário:**
```bash
# Testes rápidos
go test ./internal/domain/entities -v

# Testes completos
go test ./... -v

# Cobertura
go test ./... -cover
```

### **Para verificação final:**
```bash
# Testes completos com race detector
go test ./... -v -race

# Cobertura detalhada
go test ./... -coverprofile=coverage.out && go tool cover -html=coverage.out
```