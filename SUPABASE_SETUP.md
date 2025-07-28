# Configuração do Supabase Auth

Este projeto agora está integrado com o Supabase para autenticação de usuários.

## Configuração Inicial

### 1. Criar projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização e dê um nome ao projeto
5. Escolha uma senha para o banco de dados
6. Selecione uma região próxima ao Brasil (ex: East US)
7. Clique em "Create new project"

### 2. Obter as credenciais

1. No dashboard do Supabase, vá para **Settings > API**
2. Copie a **Project URL** e a **anon public key**

### 3. Configurar variáveis de ambiente

1. Copie o arquivo `.env.local` para `.env`
2. Preencha as variáveis com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anonima
```

### 4. Configurar Authentication no Supabase

1. No dashboard, vá para **Authentication > Settings**
2. Configure as opções conforme necessário:
   - **Site URL**: `http://localhost:5173` (para desenvolvimento)
   - **Disable email confirmations** (opcional para desenvolvimento)

### 5. Criar primeiro usuário admin

Como o sistema não permite registro público, você precisa criar o primeiro usuário admin diretamente no Supabase:

1. Vá para **Authentication > Users**
2. Clique em "Invite"
3. Digite o email do admin
4. Após criação, clique no usuário para editar
5. Na seção "User Metadata", adicione:
```json
{
  "name": "Administrador",
  "role": "admin"
}
```

## Funcionalidades Implementadas

### ✅ Login com Supabase Auth
- Autenticação segura via email/senha
- Sessão persistente
- Logout com limpeza de sessão

### ✅ Proteção de Rotas
- Acesso às páginas admin apenas para usuários logados
- Redirecionamento automático para login

### ✅ Gerenciamento de Usuários (Admin)
- Criação de novos usuários na área admin
- Definição de papéis (admin/usuário)
- Controle de acesso baseado em roles

### ✅ Contexto de Autenticação
- Estado global de autenticação
- Funções para login, logout e criação de usuários
- Loading states

## Como Usar

### Para fazer login:
1. Acesse `/admin/login`
2. Use as credenciais do usuário criado no Supabase

### Para criar novos usuários:
1. Faça login como admin
2. Vá para a aba "Usuários" no dashboard
3. Clique em "Novo Usuário"
4. Preencha os dados e escolha o tipo (admin/usuário)

## Segurança

- ✅ Variáveis de ambiente protegidas
- ✅ Autenticação server-side via Supabase
- ✅ Tokens JWT seguros
- ✅ Não exposição de credenciais no frontend
- ✅ Controle de acesso baseado em roles

## Próximos Passos

1. **Configurar RLS (Row Level Security)** no Supabase para proteger dados
2. **Implementar recuperação de senha**
3. **Adicionar confirmação por email** (opcional)
4. **Configurar políticas de senha** mais rigorosas
5. **Implementar auditoria de usuários**

## Troubleshooting

### "Missing Supabase environment variables"
- Verifique se o arquivo `.env` existe e tem as variáveis corretas
- Reinicie o servidor de desenvolvimento após criar o `.env`

### Erro de CORS
- Verifique se a URL do site está configurada corretamente no Supabase
- Para desenvolvimento, use `http://localhost:5173`

### Usuário não consegue fazer login
- Verifique se o usuário foi criado no Supabase
- Confirme que o metadata do usuário tem o campo `role`
- Verifique se a senha atende aos requisitos mínimos
