# Sistema de Agendamento

Sistema completo de agendamento com backend em Go e frontend em React/TypeScript, desenvolvido para gerenciar consultas, pacientes e profissionais de saúde.

## 📋 Descrição do Projeto
Sistema web completo de agendamento de sessões de massagem com controle de acesso por perfis hierárquicos (Usuário, Atendente e Administrador). Desenvolvido com backend em Go e frontend em React/TypeScript, o sistema permite gerenciar agendamentos, aprovar usuários, controlar cadeiras e horários disponíveis, com interface intuitiva e segura.


🎯 Regras de Negócio e Funcionalidades
👥 Perfis e Permissões
Usuário

Pode agendar e cancelar sessões

Apenas 1 sessão ativa por vez

Acesso liberado somente após aprovação

Atendente

Aprova ou reprova cadastros de usuários

Visualiza agendamentos por data, cadeira ou usuário

Cancela, remarca e marca presença em sessões

Acompanha indicadores em dashboard (presença, cancelamento etc.)

Administrador

Tem acesso total ao sistema

Gerencia usuários, cadeiras, atendentes e agenda

Define dias e horários disponíveis para agendamento

Concede ou revoga permissões de atendente

📅 Agendamento de Sessões
Sessões com duração fixa de 30 minutos

Horários controlados por disponibilidade configurada pelo administrador

Impede agendamentos em conflito para cadeira ou usuário

Cancelamento permitido com antecedência mínima de 3h

🪑 Gestão de Cadeiras
Cada cadeira possui:

Nome/ID, localização e status (ativa/inativa)

Apenas administradores podem cadastrar ou editar

📊 Dashboard Operacional
Disponível para atendentes e administradores

Mostra:

Sessões do dia

Ocupação por cadeira

Pendências de aprovação de usuários

Indicadores de presença e cancelamento

📢 Notificações por E-mail (Funcionalidade Extra)
Confirmação de agendamento

Cancelamento de sessão

Lembrete de agendamento

Aprovação de cadastro

## 🏗️ Estrutura do Projeto

```
agendamento/
├── backend/          # API REST em Go
│   ├── cmd/         # Ponto de entrada da aplicação
│   ├── internal/    # Lógica de negócio
│   ├── pkg/         # Pacotes compartilhados
│   └── docs/        # Documentação da API
├── frontend/        # Interface web em React/TypeScript
│   ├── src/         # Código fonte
│   ├── public/      # Arquivos estáticos
│   └── dist/        # Build de produção
├── docker-compose.yml
├── README.md
└── docs/           # Documentação adicional
```

## 🚀 Tecnologias Utilizadas

### Backend
- **Go 1.23** - Linguagem principal para desenvolvimento da API
- **Gin** - Framework web para criação de endpoints REST
- **GORM** - ORM para PostgreSQL com migrações automáticas
- **JWT** - Autenticação e autorização segura
- **Swagger** - Documentação automática da API
- **Zap** - Logging estruturado e performático
- **Validator** - Validação de dados de entrada
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **React 18** - Framework UI com hooks modernos
- **TypeScript** - Tipagem estática para maior segurança
- **Vite** - Build tool rápida e moderna
- **Tailwind CSS** - Framework CSS utilitário
- **React Router** - Roteamento client-side
- **Zustand** - Gerenciamento de estado simples
- **Axios** - Cliente HTTP para comunicação com API
- **React Hook Form** - Gerenciamento de formulários
- **React Query** - Cache e sincronização de dados

### Infraestrutura
- **Docker** - Containerização da aplicação
- **Docker Compose** - Orquestração de serviços
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões (opcional)

## 📋 Pré-requisitos

### Para Execução com Docker (Recomendado)
- Docker 20.10+
- Docker Compose 2.0+

### Para Desenvolvimento Local
- Node.js 18+
- Go 1.23+
- PostgreSQL 14+
- Git

## 🛠️ Como Executar Localmente

### ⚡ Inicialização Rápida (Recomendado)

1. **Clone o repositório**:
```bash
git clone <repository-url>
cd agendamento
```

2. **Execute com Docker Compose**:
```bash
docker-compose up -d
```

3. **Acesse a aplicação**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger Docs: http://localhost:8080/swagger/index.html

### 🐳 Configuração Docker

O projeto inclui um `docker-compose.yml` configurado com:

- **Backend**: API Go na porta 8080
- **Frontend**: React na porta 5173
- **PostgreSQL**: Banco de dados na porta 5432
- **Redis**: Cache na porta 6379 (opcional)

### 💻 Desenvolvimento Local

#### Backend
```bash
cd backend
cp .env.example .env
# Configure as variáveis de ambiente
go mod download
go run cmd/server/main.go
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Banco de Dados
```bash
# Instale PostgreSQL e crie o banco
createdb agendamento
```

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente (Backend)

Crie um arquivo `.env` na pasta `backend/`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agendamento
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=agendamento

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRATION=24h

# Server
PORT=8080
ENV=development

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Variáveis de Ambiente (Frontend)

Crie um arquivo `.env` na pasta `frontend/`:

```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Sistema de Agendamento
```

## 👥 Usuários Padrão para Teste

### Administrador
- **CPF:** 12345678909 
- **Senha**: 123456
- **Perfil**: Administrador do sistema

### Atendente
- **CPF:** 98765432100 
- **Senha**: 123456
- **Perfil**: Funcionário da recepção/atendimento

### Usuário/Cliente
- **CPF 11144477735 
- **Senha**: 123456
- **Perfil**: Cliente do sistema

### Acesso Online
- **Swagger UI**: http://localhost:8080/swagger/index.html
- **API Docs**: http://localhost:8080/swagger/doc.json

## 🧪 Testes

### Backend
```bash
cd backend
go test ./...
go test -v ./...
go test -cover ./...
```

### Frontend
```bash
cd frontend
npm test
npm run test:coverage
```

## 📦 Build de Produção

### Backend
```bash
cd backend
go build -o bin/server cmd/server/main.go
```

### Frontend
```bash
cd frontend
npm run build
```

### Docker
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Porta já em uso**:
   - Mude a porta no docker-compose.yml
   - Ou pare outros serviços: `docker-compose down`

2. **Erro de conexão com banco**:
   - Verifique se PostgreSQL está rodando
   - Confirme as credenciais no .env

3. **Frontend não carrega**:
   - Verifique se o backend está rodando
   - Confirme a URL da API no .env do frontend

### Logs
```bash
# Ver logs do backend
docker-compose logs backend

# Ver logs do frontend
docker-compose logs frontend

# Ver todos os logs
docker-compose logs -f
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- **Go**: Use `gofmt` e `golint`
- **React**: Use ESLint e Prettier
- **Commits**: Use Conventional Commits

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- Desenvolvimento inicial - [Seu Nome]

## 🙏 Agradecimentos

- Comunidade Go
- Comunidade React
- Contribuidores do projeto
- Bibliotecas open source utilizadas

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma [Issue](../../issues)
- Entre em contato: [seu-email@exemplo.com]
- Documentação: [Wiki](../../wiki)