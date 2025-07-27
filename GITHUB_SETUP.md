# Configuração do Repositório no GitHub

## Passo a Passo para Criar o Repositório Privado

### 1. Criar Repositório no GitHub

1. **Acesse**: https://github.com/new
2. **Nome do repositório**: `agendamento` (ou o nome que preferir)
3. **Descrição**: `Sistema de Agendamento com Backend Go e Frontend React`
4. **Visibilidade**: ✅ **Private** (repositório privado)
5. **Não inicialize** com README, .gitignore ou licença (já temos tudo)
6. **Clique em**: "Create repository"

### 2. Configurar Remote e Fazer Push

Após criar o repositório, execute estes comandos no terminal:

```bash
# Adicionar o remote (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/agendamento.git

# Verificar se o remote foi adicionado
git remote -v

# Fazer push para o GitHub
git branch -M main
git push -u origin main
```

### 3. Verificar se Funcionou

1. **Acesse** o repositório no GitHub: https://github.com/SEU_USUARIO/agendamento
2. **Verifique** se todos os arquivos estão lá
3. **Confirme** que está marcado como "Private"

### 4. Comandos Úteis para o Futuro

```bash
# Ver status
git status

# Adicionar mudanças
git add .

# Fazer commit
git commit -m "Descrição das mudanças"

# Fazer push
git push

# Ver histórico
git log --oneline

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Mudar para branch
git checkout main

# Fazer merge
git merge feature/nova-funcionalidade
```

### 5. Configurações Recomendadas

#### Configurar Git (se ainda não fez)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

#### Configurar Credenciais (Windows)
```bash
# Usar Windows Credential Manager
git config --global credential.helper wincred

# Ou usar Personal Access Token
# 1. Vá em GitHub > Settings > Developer settings > Personal access tokens
# 2. Generate new token (classic)
# 3. Selecione: repo, workflow
# 4. Use o token como senha quando solicitado
```

### 6. Estrutura do Repositório

Após o push, seu repositório deve ter esta estrutura:

```
agendamento/
├── backend/          # API Go
├── frontend/         # React/TypeScript
├── docker-compose.yml
├── README.md
├── .gitignore
├── FRONTEND_SPECIFICATION.md
├── BACKEND_INTEGRATION_README.md
└── GITHUB_SETUP.md
```

### 7. Próximos Passos

1. **Convide colaboradores** (se necessário):
   - Vá em Settings > Collaborators
   - Add people

2. **Configure proteções de branch** (recomendado):
   - Vá em Settings > Branches
   - Add rule para `main`
   - Marque: Require pull request reviews

3. **Configure GitHub Actions** (opcional):
   - Crie workflows para CI/CD
   - Testes automáticos
   - Deploy automático

### 8. Troubleshooting

#### Problema: "Authentication failed"
```bash
# Verificar credenciais
git config --list | grep user

# Reconfigurar credenciais
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

#### Problema: "Permission denied"
- Verifique se o repositório foi criado corretamente
- Confirme que você tem permissão de push
- Use Personal Access Token se necessário

#### Problema: "Repository not found"
- Verifique se o URL do remote está correto
- Confirme que o repositório existe no GitHub
- Verifique se você tem acesso ao repositório

### 9. Links Úteis

- **GitHub**: https://github.com
- **Documentação Git**: https://git-scm.com/doc
- **GitHub CLI**: https://cli.github.com/ (opcional)
- **Personal Access Tokens**: https://github.com/settings/tokens 