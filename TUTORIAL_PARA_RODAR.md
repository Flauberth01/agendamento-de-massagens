# 🚀 Tutorial para Rodar o Sistema de Agendamento

Este tutorial fornece instruções detalhadas para executar o sistema de agendamento localmente.

## 📋 Índice

- [🔧 Pré-requisitos](#-pré-requisitos)
- [📦 Instalação Inicial](#-instalação-inicial)
- [🐳 Execução com Docker](#-execução-com-docker)
- [💻 Execução Local](#-execução-local)
- [✅ Verificação do Sistema](#-verificação-do-sistema)
- [🧪 Executando Testes](#-executando-testes)
- [🔧 Troubleshooting](#-troubleshooting)
- [🛠️ Comandos Úteis](#️-comandos-úteis)
- [📈 Próximos Passos](#-próximos-passos)

---

## 🔧 Pré-requisitos

### **Software Necessário**
- **Docker** (versão 20.10+) e **Docker Compose** (versão 2.0+)
- **Git** (versão 2.30+)
- **Node.js** (versão 18+) - para execução local do frontend
- **Go** (versão 1.21+) - para execução local do backend
- **PostgreSQL** (versão 15+) - para execução local do banco

### **Recursos do Sistema**
- **RAM**: Mínimo 4GB (recomendado 8GB)
- **Espaço**: Mínimo 2GB livres
- **CPU**: Processador dual-core ou superior

### **Portas Necessárias**
- **8080**: API Backend
- **3000**: Frontend React
- **5432**: PostgreSQL

---

## 📦 Instalação Inicial

### **1. Clone o Repositório**
```bash
git clone https://github.com/seu-usuario/agendamento.git
cd agendamento
```

### **2. Verifique a Estrutura**
```bash
# Estrutura esperada
ls -la
# Deve mostrar:
# - backend/
# - frontend/
# - docker-compose.yml
# - README.md
```

### **3. Verifique as Configurações**
```bash
# Verifique se o docker-compose.yml existe
cat docker-compose.yml

# Verifique se os arquivos de configuração existem
ls backend/env.example
ls frontend/package.json
```

---

## 🐳 Execução com Docker (Recomendado)

### **1. Iniciar o Sistema**
```bash
# Na raiz do projeto
docker-compose up -d

# Verificar se os containers estão rodando
docker-compose ps
```

### **2. Verificar Logs**
```bash
# Logs gerais
docker-compose logs

# Logs específicos
docker-compose logs api
docker-compose logs postgres
```

### **3. Verificar Status dos Containers**
```bash
# Status dos containers
docker-compose ps

# Deve mostrar:
# - agendamento-postgres (healthy)
# - agendamento-api (running)
```

### **4. Acessar o Sistema**
- **API**: http://localhost:8080
- **Swagger**: http://localhost:8080/swagger/index.html
- **Frontend**: http://localhost:3000 (se configurado)

### **5. Parar o Sistema**
```bash
# Parar todos os containers
docker-compose down

# Parar e remover volumes (cuidado!)
docker-compose down -v
```

---

## 💻 Execução Local

### **1. Configurar PostgreSQL Local**

#### **Instalar PostgreSQL**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (com Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Baixe e instale do site oficial: https://www.postgresql.org/download/windows/
```

#### **Configurar Banco de Dados**
```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar usuário e banco
CREATE USER the_user WITH PASSWORD 'massagem2024@secure';
CREATE DATABASE agendamento_db OWNER the_user;
GRANT ALL PRIVILEGES ON DATABASE agendamento_db TO the_user;
\q
```

### **2. Configurar Backend**

#### **Criar Arquivo .env**
```bash
cd backend
cp env.example .env
```

#### **Editar .env**
```bash
# Configurações para desenvolvimento local
DB_HOST=localhost
DB_PORT=5432
DB_USER=the_user
DB_PASSWORD=massagem2024@secure
DB_NAME=agendamento_db
```

#### **Instalar Dependências e Executar**
```bash
# Instalar dependências
go mod download

# Executar o servidor
go run cmd/server/main.go
```

### **3. Configurar Frontend**

#### **Instalar Dependências**
```bash
cd frontend
npm install
```

#### **Configurar Variáveis de Ambiente**
```bash
# Criar .env se necessário
echo "VITE_API_URL=http://localhost:8080" > .env
```

#### **Executar Frontend**
```bash
npm run dev
```

---

## ✅ Verificação do Sistema

### **1. Verificar API**
```bash
# Testar endpoint de saúde
curl http://localhost:8080/health

# Verificar Swagger
curl http://localhost:8080/swagger/index.html
```

### **2. Verificar Banco de Dados**
```bash
# Conectar ao banco
docker-compose exec postgres psql -U the_user -d agendamento_db

# Verificar tabelas
\dt

# Verificar dados de seed
SELECT * FROM users LIMIT 5;
```

### **3. Verificar Logs**
```bash
# Logs da API
docker-compose logs api

# Logs do PostgreSQL
docker-compose logs postgres
```

### **4. Testar Endpoints**
```bash
# Login de teste
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678909","password":"123456"}'
```

---

## 🧪 Executando Testes

### **Backend**
```bash
cd backend

# Executar todos os testes
go test ./...

# Executar testes específicos
go test ./internal/application/usecases/...

# Executar testes com coverage
go test -cover ./...
```

### **Frontend**
```bash
cd frontend

# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage
```

### **Testes de Integração**
```bash
cd backend

# Executar testes de integração
go test ./tests/integration/...
```

---

## 🔧 Troubleshooting

### **Problemas Comuns**

#### **1. Container não inicia**
```bash
# Verificar logs
docker-compose logs

# Verificar recursos
docker system df
docker system prune

# Reiniciar containers
docker-compose restart
```

#### **2. Banco de dados não conecta**
```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs do banco
docker-compose logs postgres

# Conectar manualmente
docker-compose exec postgres psql -U the_user -d agendamento_db
```

#### **3. API não responde**
```bash
# Verificar se a API está rodando
curl http://localhost:8080/health

# Verificar logs da API
docker-compose logs api

# Verificar variáveis de ambiente
docker-compose exec api env | grep DB_
```

#### **4. Frontend não carrega**
```bash
# Verificar se o servidor está rodando
curl http://localhost:3000

# Verificar logs do frontend
npm run dev

# Verificar dependências
npm install
```

### **Soluções Específicas**

#### **Erro de Porta em Uso**
```bash
# Verificar portas em uso
netstat -tulpn | grep :8080
netstat -tulpn | grep :5432

# Matar processo na porta
sudo kill -9 $(lsof -t -i:8080)
```

#### **Erro de Permissão**
```bash
# Corrigir permissões do Docker
sudo chmod 666 /var/run/docker.sock

# Reiniciar Docker
sudo systemctl restart docker
```

#### **Erro de Memória**
```bash
# Limpar recursos do Docker
docker system prune -a

# Aumentar memória do Docker (Docker Desktop)
# Settings > Resources > Memory
```

---

## 🛠️ Comandos Úteis

### **Docker**
```bash
# Ver containers
docker ps

# Ver logs em tempo real
docker-compose logs -f

# Executar comando em container
docker-compose exec api sh
docker-compose exec postgres psql -U the_user -d agendamento_db

# Backup do banco
docker-compose exec postgres pg_dump -U the_user agendamento_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U the_user -d agendamento_db < backup.sql
```

### **Desenvolvimento**
```bash
# Rebuild containers
docker-compose build

# Restart específico
docker-compose restart api

# Ver variáveis de ambiente
docker-compose exec api env

# Debug container
docker-compose exec api sh
```

### **Limpeza**
```bash
# Parar e remover containers
docker-compose down

# Remover volumes
docker-compose down -v

# Limpar imagens não utilizadas
docker image prune

# Limpar tudo
docker system prune -a
```

---

## 📈 Próximos Passos

### **Desenvolvimento**
1. **Configurar IDE**: VSCode, GoLand, ou similar
2. **Configurar Debug**: Configurar debugging para Go e React
3. **Configurar Linting**: ESLint, golangci-lint
4. **Configurar Pre-commit**: Hooks para qualidade de código

### **Produção**
1. **Configurar HTTPS**: Certificados SSL
2. **Configurar Backup**: Backup automático do banco
3. **Configurar Monitoramento**: Logs, métricas, alertas
4. **Configurar CI/CD**: Pipeline de deploy

### **Segurança**
1. **Alterar senhas padrão**: JWT_SECRET, DB_PASSWORD
2. **Configurar firewall**: Regras de segurança
3. **Configurar rate limiting**: Proteção contra ataques
4. **Configurar CORS**: Política de origem cruzada

### **Performance**
2. **Configurar CDN**: Para assets estáticos
4. **Configurar monitoring**: APM, logs centralizados

---

### **Informações Úteis**
- **Versão**: Sistema de Agendamento v1.0.0
- **Autor**: [Flauberth Brito]
- **Licença**: MIT
- **Repositório**: https://github.com/seu-usuario/agendamento

---

**🎉 Parabéns! O sistema está rodando com sucesso!**

Agora você pode acessar o sistema e começar a usar todas as funcionalidades. Para dúvidas ou problemas, consulte a documentação ou entre em contato com o suporte.