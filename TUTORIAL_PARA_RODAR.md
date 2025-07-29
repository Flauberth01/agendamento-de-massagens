# 🚀 Tutorial Completo para Rodar o Sistema de Agendamento

Este tutorial irá guiá-lo através de todas as etapas necessárias para executar o sistema de agendamento localmente.

## 📋 Pré-requisitos

### 🔧 Ferramentas Necessárias

1. **Git** - Para clonar o repositório
   ```bash
   # Verificar se o Git está instalado
   git --version
   ```

2. **Go 1.23.0+** - Para o backend
   ```bash
   # Verificar versão do Go
   go version
   ```

3. **Node.js 18+** - Para o frontend
   ```bash
   # Verificar versão do Node.js
   node --version
   npm --version
   ```

4. **PostgreSQL 14+** - Banco de dados
   ```bash
   # Verificar se PostgreSQL está instalado
   psql --version
   ```

5. **Docker e Docker Compose** (Opcional, mas recomendado)
   ```bash
   # Verificar se Docker está instalado
   docker --version
   docker-compose --version
   ```

## 🏗️ Configuração Inicial

### 1. Clone do Repositório

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd agendamento

# Verificar estrutura do projeto
ls -la
```

### 2. Verificação da Estrutura

Você deve ver a seguinte estrutura:
```
agendamento/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

## 🐳 Opção 1: Execução com Docker (Recomendado)

### Passo 1: Configuração do Docker

```bash
# Verificar se o Docker está rodando
docker ps

# Se não estiver rodando, inicie o Docker Desktop
```

### Passo 2: Execução Completa

```bash
# Na raiz do projeto
docker-compose up -d

# Verificar se os containers estão rodando
docker-compose ps
```

### Passo 3: Verificação dos Serviços

Após alguns minutos, você deve ter acesso a:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger/index.html
- **PostgreSQL**: localhost:5432

### Passo 4: Logs e Debug

```bash
# Ver logs do backend
docker-compose logs backend

# Ver logs do frontend
docker-compose logs frontend

# Ver logs do banco de dados
docker-compose logs postgres

# Ver todos os logs em tempo real
docker-compose logs -f
```

### Passo 5: Parar os Serviços

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (cuidado: apaga dados)
docker-compose down -v
```

## 💻 Opção 2: Execução Local

### 🔧 Configuração do Backend

#### Passo 1: Configuração do Banco de Dados

```bash
# Instalar PostgreSQL (se não tiver)
# Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# macOS:
brew install postgresql

# Windows:
# Baixar do site oficial: https://www.postgresql.org/download/windows/

# Iniciar PostgreSQL
# Ubuntu/Debian:
sudo systemctl start postgresql

# macOS:
brew services start postgresql

# Criar banco de dados
sudo -u postgres psql
CREATE DATABASE agendamento;
CREATE USER agendamento_user WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE agendamento TO agendamento_user;
\q
```

#### Passo 2: Configuração do Backend

```bash
# Entrar na pasta do backend
cd backend

# Copiar arquivo de exemplo de variáveis de ambiente
cp .env.example .env

# Editar o arquivo .env com suas configurações
nano .env
# ou
code .env
```

#### Passo 3: Configuração do Arquivo .env

Edite o arquivo `.env` com as seguintes configurações:

```env
# Database Configuration
DATABASE_URL=postgresql://agendamento_user:sua_senha_aqui@localhost:5432/agendamento
DB_HOST=localhost
DB_PORT=5432
DB_USER=agendamento_user
DB_PASSWORD=sua_senha_aqui
DB_NAME=agendamento

# JWT Configuration
JWT_SECRET=sua_chave_super_secreta_aqui_muito_longa_e_complexa
JWT_EXPIRATION=24h

# Server Configuration
PORT=8080
ENV=development

# Email Configuration (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_de_app
```

#### Passo 4: Instalação de Dependências do Backend

```bash
# Baixar dependências do Go
go mod download

# Verificar se tudo está correto
go mod verify
```

#### Passo 5: Execução do Backend

```bash
# Executar o servidor
go run cmd/server/main.go

# Ou compilar e executar
go build -o bin/server cmd/server/main.go
./bin/server
```

**Verificação**: Acesse http://localhost:8080/swagger/index.html para ver a documentação da API.

### 🎨 Configuração do Frontend

#### Passo 1: Instalação de Dependências

```bash
# Voltar para a raiz do projeto
cd ..

# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install

# Verificar se tudo foi instalado corretamente
npm list --depth=0
```

#### Passo 2: Configuração do Frontend

```bash
# Criar arquivo de variáveis de ambiente
touch .env

# Editar o arquivo .env
nano .env
# ou
code .env
```

#### Passo 3: Configuração do Arquivo .env do Frontend

```env
# API Configuration
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Sistema de Agendamento

# Development Configuration
VITE_DEV_MODE=true
```

#### Passo 4: Execução do Frontend

```bash
# Executar em modo de desenvolvimento
npm run dev

# Ou executar com preview
npm run preview
```

**Verificação**: Acesse http://localhost:3000 para ver a aplicação.

## 🔍 Verificação do Sistema

### 1. Verificação do Backend

```bash
# Testar se a API está respondendo
curl http://localhost:8080/health

# Verificar documentação Swagger
curl http://localhost:8080/swagger/doc.json
```

### 2. Verificação do Frontend

- Acesse http://localhost:3000

### 3. Verificação da Integração

- Tente fazer login com um dos usuários padrão
- Verifique se consegue navegar pelas páginas
- Teste algumas funcionalidades básicas

## 👥 Usuários de Teste

### Administrador
- **CPF:** 12345678909
- **Senha:** 123456
- **Perfil:** Administrador do sistema

### Atendente
- **CPF:** 98765432100
- **Senha:** 123456
- **Perfil:** Funcionário da recepção/atendimento

### Usuário/Cliente
- **CPF:** 11144477735
- **Senha:** 123456
- **Perfil:** Cliente do sistema

## 🧪 Execução de Testes

### Testes do Backend

```bash
# Na pasta backend
cd backend

# Executar todos os testes
go test ./...

# Executar testes com verbose
go test -v ./...

# Executar testes com cobertura
go test -cover ./...

# Executar testes de um pacote específico
go test ./internal/application/usecases/...

# Executar testes de integração
go test ./tests/integration/...
```

### Testes do Frontend

```bash
# Na pasta frontend
cd frontend

# Verificar código com ESLint
npm run lint

# Executar verificações de tipo TypeScript
npx tsc --noEmit
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Banco de Dados

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar se consegue conectar
psql -h localhost -U agendamento_user -d agendamento

# Verificar logs do backend
tail -f backend/logs/app.log
```

#### 2. Erro de Porta Já em Uso

```bash
# Verificar quais processos estão usando a porta
lsof -i :8080
lsof -i :5173

# Matar processo se necessário
kill -9 <PID>
```

#### 3. Erro de Dependências

```bash
# Backend - Limpar cache do Go
go clean -modcache
go mod download

# Frontend - Limpar cache do npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 4. Erro de CORS

```bash
# Verificar se o backend está configurado corretamente
# Verificar se a URL da API no frontend está correta
# Verificar se o middleware CORS está ativo
```

#### 5. Erro de JWT

```bash
# Verificar se JWT_SECRET está configurado
# Verificar se o token está sendo enviado corretamente
# Verificar se o token não expirou
```

### Logs Úteis

#### Backend
```bash
# Logs em tempo real
tail -f backend/logs/app.log

# Logs de erro
grep "ERROR" backend/logs/app.log

# Logs de requisições
grep "HTTP" backend/logs/app.log
```

#### Frontend
```bash
# Logs do Vite
npm run dev

# Logs do navegador
# Abrir DevTools (F12) e verificar Console
```

#### Docker
```bash
# Logs de todos os containers
docker-compose logs

# Logs de um container específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Logs em tempo real
docker-compose logs -f
```

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Reiniciar apenas o backend
docker-compose restart backend

# Reiniciar apenas o frontend
docker-compose restart frontend

# Rebuild de um container
docker-compose build backend
docker-compose up -d backend

# Ver logs em tempo real
docker-compose logs -f backend
```

### Debug

```bash
# Entrar no container do backend
docker-compose exec backend sh

# Entrar no container do frontend
docker-compose exec frontend sh

# Verificar variáveis de ambiente
docker-compose exec backend env

# Verificar arquivos de configuração
docker-compose exec backend cat .env
```

### Limpeza

```bash
# Parar todos os containers
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Remover imagens não utilizadas
docker image prune

# Limpar tudo
docker system prune -a
```

## 📚 Próximos Passos

1. **Explorar a API**: Acesse http://localhost:8080/swagger/index.html
2. **Testar Funcionalidades**: Use os usuários de teste para explorar o sistema
3. **Desenvolver**: Faça alterações no código e veja as mudanças em tempo real
4. **Debugar**: Use os logs e ferramentas de debug para resolver problemas

## 🆘 Suporte

Se você encontrar problemas:

1. **Verifique os logs** usando os comandos acima
2. **Consulte a documentação** no README.md
3. **Verifique as issues** no repositório
4. **Crie uma nova issue** se o problema persistir

---

**🎉 Parabéns!** Se você chegou até aqui, o sistema está rodando corretamente. Agora você pode começar a desenvolver e explorar todas as funcionalidades do sistema de agendamento :)