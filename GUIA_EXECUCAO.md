# 🚀 Como Rodar o Projeto - Guia Completo

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Git instalado
- Conta no Supabase (opcional, pode usar modo mock)
- PowerShell ou Terminal

## 🛠️ Instalação

### 1. **Clone o repositório**
```powershell
git clone https://github.com/developditusmkt/containers.git
cd containers
```

### 2. **Instale as dependências do frontend**
```powershell
npm install
```

### 3. **Instale as dependências do backend**
```powershell
cd backend
npm install
cd ..
```

## ⚙️ Configuração

### 4. **Configure o Supabase (Opcional)**
```powershell
# Crie um arquivo .env na raiz do projeto com:
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

### 5. **Configure o Backend Asaas (Opcional)**
```powershell
# O backend já está configurado com uma API key de teste
# Se quiser usar sua própria chave, edite backend/.env
```

## 🚀 Executando o Projeto

### Opção 1: **Modo Desenvolvimento Completo** (Recomendado)

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

### Opção 2: **Apenas Frontend** (Usa funções Netlify)
```powershell
npm run dev
```

## 🌐 Acessando o Sistema

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001 (se rodando localmente)
- **Admin**: http://localhost:5173/admin/login

## 🔑 Credenciais de Teste

### Admin (se Supabase configurado):
- Email: Configure no Supabase
- Senha: Configure no Supabase

### Sem Supabase:
- O sistema funciona em modo mock para demonstração

## 📱 Funcionalidades Disponíveis

### Para Clientes:
- ✅ Criar orçamentos interativos
- ✅ Selecionar itens por categoria
- ✅ Calcular preços automaticamente
- ✅ Buscar endereço por CEP
- ✅ Gerar PDF do orçamento
- ✅ Gerar links de pagamento (Asaas)
- ✅ Compartilhar via WhatsApp

### Para Administradores:
- ✅ Dashboard completo
- ✅ Gerenciar categorias e itens
- ✅ Visualizar todos os orçamentos
- ✅ Sistema Kanban de status
- ✅ Gerenciar usuários

## 🐛 Troubleshooting

### Problema: "Cannot find module"
```powershell
# Reinstalar dependências
rm -rf node_modules
rm -rf backend/node_modules
npm install
cd backend && npm install
```

### Problema: Porta ocupada
```powershell
# Frontend (alterar porta)
npm run dev -- --port 3000

# Backend (alterar no .env)
# PORT=3002
```

### Problema: API Asaas não funciona
- O sistema tem fallback para modo mock
- Funciona mesmo sem chave válida
- Para produção, configure chave real no backend/.env

## 📦 Scripts Disponíveis

```powershell
# Frontend
npm run dev          # Desenvolver frontend
npm run build        # Build para produção
npm run preview      # Preview da build

# Backend
cd backend
npm run dev          # Backend com hot reload
npm start            # Backend produção
npm test             # Testes

# Integração
npm run backend:install  # Instalar deps backend
npm run backend:start    # Iniciar backend
```

## 🌍 URLs em Produção

- **Frontend**: https://containers-alencar.netlify.app
- **Backend**: Netlify Functions (serverless)
- **Demo**: Funcional em produção

## 📚 Estrutura do Projeto

```
project/
├── src/                 # Frontend React
│   ├── components/      # Componentes
│   ├── pages/          # Páginas
│   ├── services/       # APIs
│   └── types/          # TypeScript
├── backend/            # Backend Node.js
│   ├── routes/         # Rotas da API
│   ├── services/       # Lógica de negócio
│   └── config/         # Configurações
├── netlify/            # Funções serverless
└── public/             # Arquivos estáticos
```

## ✅ Verificação Rápida

Execute este teste para verificar se tudo está funcionando:

```powershell
# 1. Testar backend local (se rodando)
curl http://localhost:3001/health

# 2. Testar função Netlify
curl https://containers-alencar.netlify.app/.netlify/functions/api/health

# 3. Acessar frontend
# Abrir: http://localhost:5173
```

## 🎯 Próximos Passos

1. ✅ Sistema rodando localmente
2. 🔧 Configure Supabase para persistência
3. 🔑 Configure chave Asaas real
4. 🚀 Deploy personalizado (opcional)

## 📞 Suporte

Se tiver problemas:
1. Verifique se Node.js 18+ está instalado
2. Certifique-se que as portas 5173 e 3001 estão livres
3. Execute os comandos no PowerShell como Administrador
4. Verifique os logs do console para erros específicos

**O projeto está pronto para usar mesmo sem configurações adicionais!** 🎉
