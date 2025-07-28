# 🏗️ Alencar Quote System

Sistema completo de geração de orçamentos para containers habitáveis com interface administrativa e integração com Supabase.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Formulários**: React Hook Form + Zod
- **PDF**: jsPDF
- **Ícones**: Lucide React

## ✨ Funcionalidades

### 👥 Para Clientes
- ✅ Geração de orçamentos interativos
- ✅ Seleção de itens por categoria
- ✅ Cálculo automático de preços
- ✅ Busca automática de endereço por CEP
- ✅ Download de PDF do orçamento
- ✅ Compartilhamento via WhatsApp

### 🔧 Para Administradores
- ✅ Dashboard administrativo completo
- ✅ Gestão de categorias e itens
- ✅ Visualização de todos os orçamentos
- ✅ Sistema Kanban para acompanhar status
- ✅ Gerenciamento de usuários
- ✅ Filtros e busca avançada

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/developditusmkt/project.git
cd project
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite o .env.local com suas credenciais do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica
```

### 4. Configure o banco de dados
Execute os scripts SQL no Supabase Dashboard:

1. **SQL Editor** → Cole e execute `supabase_tables.sql`
2. **SQL Editor** → Cole e execute `supabase_seed_data.sql`

### 5. Execute o projeto
```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 📊 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── CategoryManagement.tsx
│   ├── KanbanBoard.tsx
│   ├── QuoteManagement.tsx
│   └── UserManagement.tsx
├── contexts/           # Contexts do React
│   ├── AuthContext.tsx
│   ├── CategoryContext.tsx
│   └── QuoteContext.tsx
├── lib/               # Configurações
│   └── supabase.ts
├── pages/             # Páginas principais
│   ├── AdminDashboard.tsx
│   ├── AdminLogin.tsx
│   └── PublicQuote.tsx
├── services/          # Serviços de API
│   ├── categoryService.ts
│   └── quoteService.ts
├── types/             # Definições TypeScript
│   └── index.ts
└── utils/             # Utilitários
    └── maskUtils.ts
```

## 🔐 Autenticação

O sistema utiliza Supabase Auth para gerenciar usuários:

- **Admin**: Acesso completo ao dashboard
- **User**: Acesso limitado (futuras implementações)

### Primeiro Acesso
1. Configure um usuário admin no Supabase
2. Adicione `role: "admin"` no User Metadata
3. Acesse `/admin/login`

## 📱 Status de Orçamentos

O sistema gerencia 9 status diferentes:

1. 🆕 **Novo** - Orçamento recém-criado
2. 🔍 **Analisando** - Em análise técnica
3. 💬 **Negociando** - Em negociação com cliente
4. ✍️ **Aguardando Assinatura** - Aguardando assinatura do contrato
5. ✅ **Aprovado** - Projeto aprovado
6. 💰 **Aguardando Pagamento** - Aguardando pagamento
7. 💳 **Pago** - Pagamento confirmado
8. ❌ **Rejeitado** - Projeto rejeitado
9. 🏁 **Concluído** - Projeto finalizado

## 🚀 Deploy

### Netlify / Vercel
```bash
npm run build
```

### Variáveis de Ambiente
Configure no seu provedor de hosting:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📝 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
npm run lint     # Executar ESLint
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'feat: nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 📧 Contato

- **Projeto**: Alencar Quote System
- **Versão**: 1.0.0
- **Desenvolvido com**: ❤️ e muito ☕
