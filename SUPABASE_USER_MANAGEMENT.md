# Configuração de Gerenciamento de Usuários - Supabase

Este documento explica como configurar o gerenciamento de usuários no Supabase para o sistema de orçamentos.

## 📋 Funcionalidades Implementadas

### ✅ **Listagem de Usuários**
- Exibe todos os usuários cadastrados no sistema
- Mostra informações como nome, email, função (admin/usuário)
- Interface moderna com tabela responsiva

### ✅ **Reenvio de Link de Redefinição de Senha**
- Botão para reenviar email de redefinição para qualquer usuário
- Integração com sistema de email do Supabase
- Feedback visual de sucesso/erro

### ✅ **Exclusão de Usuários**
- Modal de confirmação antes da exclusão
- Exclusão permanente do usuário
- Atualização automática da lista após exclusão

### ✅ **Criação de Usuários**
- Formulário para criar novos usuários
- Definição de função (admin/usuário)
- Validações de segurança

## 🔧 Configuração Necessária no Supabase

### 1. **Ativar Auth Admin API**

No painel do Supabase, vá para:
- **Authentication** → **Settings** → **API Settings**
- Certifique-se de que a **Auth Admin API** está habilitada
- Anote a **Service Role Key** (será necessária para operações admin)

### 2. **Configurar RLS (Row Level Security)**

Execute no SQL Editor do Supabase:

```sql
-- Permitir que admins vejam todos os usuários
CREATE POLICY "Admins can view all users" ON auth.users
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Permitir que admins excluam usuários
CREATE POLICY "Admins can delete users" ON auth.users
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

### 3. **Configurar Metadados de Usuário**

Quando criar usuários, certifique-se de incluir metadados:

```javascript
{
  data: {
    name: "Nome do Usuário",
    role: "admin" // ou "user"
  }
}
```

### 4. **Configurar Templates de Email**

No painel do Supabase:
- **Authentication** → **Email Templates**
- Configure o template de **Password Reset**
- Personalize conforme necessário

## 🚨 Limitações Atuais

### **Auth Admin API**
- As funções `getAllUsers()` e `deleteUser()` requerem a **Service Role Key**
- Por segurança, essas operações devem ser feitas via backend/API
- No ambiente de desenvolvimento, você pode testar via console do navegador

### **Solução Recomendada para Produção**

1. **Criar API Backend** (Node.js/Python/etc):
```javascript
// Exemplo com service key
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Listar usuários
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  res.json({ data, error });
});

// Excluir usuário
app.delete('/api/users/:id', async (req, res) => {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(req.params.id);
  res.json({ error });
});
```

2. **Chamar a API do Frontend**:
```javascript
const getAllUsers = async () => {
  const response = await fetch('/api/users');
  return response.json();
};
```

## 🔐 Variáveis de Ambiente

Certifique-se de ter no arquivo `.env`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key  # Para backend apenas
```

## 🎨 Interface de Usuário

### **Características do Design**
- **Layout responsivo** com tabela que funciona em mobile
- **Cards de usuário** com avatar colorido
- **Badges de função** (Admin/Usuário) com cores distintas
- **Modal de confirmação** para exclusões
- **Feedback visual** para todas as ações
- **Loading states** para melhor UX

### **Ações Disponíveis**
1. **➕ Criar Usuário** - Formulário completo com validações
2. **🔄 Atualizar Lista** - Recarrega usuários do Supabase
3. **📧 Reset Senha** - Envia email de redefinição
4. **🗑️ Excluir** - Remove usuário com confirmação

## 🚀 Como Testar

1. **Acesse o Admin Dashboard**
2. **Vá para "Usuários"**
3. **Crie um usuário teste**
4. **Teste as funcionalidades**:
   - Reenvio de senha
   - Atualização da lista
   - Exclusão (cuidado!)

## 📞 Próximos Passos

1. **Implementar backend** para operações seguras
2. **Adicionar paginação** para muitos usuários
3. **Implementar busca/filtros**
4. **Adicionar logs de auditoria**
5. **Configurar roles mais específicas**

---

**Nota**: As funcionalidades estão totalmente implementadas no frontend. Para ambiente de produção, recomenda-se implementar um backend para operações sensíveis como listagem e exclusão de usuários.
