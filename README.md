# Sistema de Agendamento

Sistema completo de agendamento com backend em Go e frontend em React/TypeScript.

## 🏗️ Estrutura do Projeto

```
agendamento/
├── backend/          # API REST em Go
├── frontend/         # Interface web em React/TypeScript
├── docker-compose.yml
└── README.md
```

## 🚀 Tecnologias

### Backend
- **Go 1.23** - Linguagem principal
- **Gin** - Framework web
- **GORM** - ORM para PostgreSQL
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Zap** - Logging estruturado

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **Zustand** - Gerenciamento de estado

## 📋 Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento frontend)
- Go 1.23+ (para desenvolvimento backend)

## 🛠️ Instalação e Execução

### ⚡ Inicialização Rápida (Recomendado)

Para rodar o projeto em **menos de 5 minutos**, consulte:
- **[QUICK_START.md](./QUICK_START.md)** - Guia de inicialização rápida
- **[GUIA_COMANDOS.md](./GUIA_COMANDOS.md)** - Guia completo de comandos

### 🚀 Scripts Automáticos

#### Windows (PowerShell)
```powershell
.\start.ps1
```

#### Linux/Mac (Bash)
```bash
chmod +x start.sh
./start.sh
```

### 🐳 Usando Docker (Manual)

1. Clone o repositório:
```bash
git clone <repository-url>
cd agendamento
```

2. Configure o ambiente:
```bash
cp backend/env.example backend/.env
```

3. Execute com Docker Compose:
```bash
docker-compose up -d
```

4. Acesse:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger Docs: http://localhost:8080/swagger/index.html

### 💻 Desenvolvimento Local

#### Backend
```bash
cd backend
go mod download
go run cmd/server/main.go
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentação

- [Especificação do Frontend](FRONTEND_SPECIFICATION.md)
- [Integração Backend](BACKEND_INTEGRATION_README.md)
- [API Documentation](http://localhost:8080/swagger/index.html)

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agendamento

# JWT
JWT_SECRET=your-secret-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🧪 Testes

### Backend
```bash
cd backend
go test ./...
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Build

### Backend
```bash
cd backend
docker build -t agendamento-backend .
```

### Frontend
```bash
cd frontend
npm run build
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- Seu Nome - Desenvolvimento inicial

## 🙏 Agradecimentos

- Comunidade Go
- Comunidade React
- Contribuidores do projeto