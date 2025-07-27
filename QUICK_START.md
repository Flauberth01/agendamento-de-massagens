# ⚡ Inicialização Rápida - Sistema de Agendamento

Este guia permite que você rode o projeto em **menos de 5 minutos** após fazer o clone.

## 🚀 Opção 1: Script Automático (Recomendado)

### Windows (PowerShell)
```powershell
# Executar como administrador se necessário
.\start.ps1
```

### Linux/Mac (Bash)
```bash
# Dar permissão de execução
chmod +x start.sh

# Executar
./start.sh
```

## 🛠️ Opção 2: Comandos Manuais

### 1. Configurar Ambiente
```bash
# Copiar variáveis de ambiente
cp backend/env.example backend/.env
```

### 2. Iniciar Backend e Banco
```bash
# Iniciar tudo com Docker
docker-compose up -d

# Verificar se está rodando
docker-compose ps
```

### 3. Iniciar Frontend
```bash
# Instalar dependências
cd frontend
npm install

# Rodar em desenvolvimento
npm run dev
```

## 🌐 Acessos

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Documentação**: http://localhost:8080/swagger/index.html

## 📋 Pré-requisitos

- Docker Desktop
- Node.js 18+
- Git

## 🔧 Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Reiniciar
docker-compose restart
```

## 🆘 Problemas Comuns

### Porta já em uso
```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080
```

### Docker não inicia
- Verifique se o Docker Desktop está rodando
- Reinicie o Docker Desktop

### Frontend não carrega
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📞 Suporte

Se ainda tiver problemas, consulte o [GUIA_COMANDOS.md](./GUIA_COMANDOS.md) para instruções detalhadas. 