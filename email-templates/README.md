# 📧 Templates de Email Profissionais - Supabase

## 🎨 Templates Criados

Foram criados 2 templates HTML profissionais com a identidade visual do sistema:

### 1. **Confirmação de Email** (`confirm-email.html`)
- Design moderno com gradientes e animações
- Cores da marca: `#44A17C` e `#3e514f`
- Ícone de verificação
- Avisos de segurança
- Responsivo para mobile

### 2. **Redefinição de Senha** (`reset-password.html`)
- Layout similar ao de confirmação
- Ícone de cadeado
- Avisos de segurança reforçados
- Timer de expiração do link
- Seção de suporte

## 🚀 Como Configurar no Supabase

### **Passo 1: Acesse o Dashboard**
1. Faça login no [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para **Authentication** → **Email Templates**

### **Passo 2: Configure Template de Confirmação**
1. Clique em **Confirm signup**
2. Substitua o conteúdo por: `email-templates/confirm-email.html`
3. **Subject**: `Confirme seu email - Alencar Empreendimentos`
4. Clique em **Save**

### **Passo 3: Configure Template de Reset**
1. Clique em **Reset password**
2. Substitua o conteúdo por: `email-templates/reset-password.html`
3. **Subject**: `Redefinir senha - Alencar Empreendimentos`
4. Clique em **Save**

## 🎯 Variáveis do Supabase

Os templates utilizam estas variáveis automáticas:

### **Confirmação de Email**
- `{{ .ConfirmationURL }}` - Link de confirmação
- `{{ .Email }}` - Email do usuário

### **Reset de Senha**
- `{{ .ConfirmationURL }}` - Link de redefinição
- `{{ .Email }}` - Email do usuário

## 🎨 Características dos Templates

### **Design Profissional**
- ✅ **Responsivo** - Funciona em desktop e mobile
- ✅ **Gradientes** - Cores da marca com efeitos modernos
- ✅ **Animações** - Efeitos sutis no header
- ✅ **Ícones** - Visual profissional e intuitivo
- ✅ **Typography** - Hierarquia clara e legível

### **Elementos Visuais**
- **Header**: Gradiente animado com padrão geométrico
- **Logo**: Emoji + nome da empresa
- **Ícones**: SVG customizados para cada tipo
- **Botões**: Gradiente com hover effects
- **Alertas**: Cores diferenciadas por importância
- **Footer**: Informações da empresa

### **Cores Utilizadas**
- **Primary**: `#44A17C` (Verde principal)
- **Secondary**: `#3e514f` (Verde escuro)
- **Warning**: `#f59e0b` (Laranja para alertas)
- **Danger**: `#ef4444` (Vermelho para avisos)
- **Info**: `#0284c7` (Azul para informações)

## 📱 Responsividade

### **Mobile (< 600px)**
- Header compacto
- Botões otimizados para toque
- Texto adequado para telas pequenas
- Padding reduzido

### **Desktop**
- Layout completo
- Hover effects
- Animações suaves
- Tipografia maior

## 🔐 Elementos de Segurança

### **Template de Confirmação**
- ✅ Aviso sobre email correto
- ✅ Instrução para ignorar se não foi o usuário
- ✅ Link alternativo se botão não funcionar

### **Template de Reset**
- ✅ Aviso de expiração (1 hora)
- ✅ Instruções de segurança
- ✅ Alerta se não foi solicitado
- ✅ Seção de suporte para problemas
- ✅ Link único de uso

## 🛠️ Customização

### **Para Alterar Cores**
Edite as variáveis CSS:
```css
/* Cores principais */
--primary: #44A17C;
--secondary: #3e514f;
--warning: #f59e0b;
```

### **Para Alterar Logo**
Substitua na seção header:
```html
<h1>🏗️ Alencar Empreendimentos</h1>
<p>Sistema de Orçamentos</p>
```

### **Para Alterar Ícones**
Substitua os SVGs na classe `.icon`:
```html
<svg viewBox="0 0 24 24">
  <!-- Seu ícone aqui -->
</svg>
```

## 📧 Configuração de SMTP

Para emails funcionarem corretamente:

1. **Supabase nativo**: Funciona automaticamente
2. **SMTP customizado**: Configure em **Settings** → **SMTP**

### **Providers Recomendados**
- **SendGrid**: Boa entregabilidade
- **Mailgun**: Fácil configuração
- **AWS SES**: Econômico
- **Postmark**: Rápido e confiável

## ✅ Checklist de Configuração

- [ ] Template de confirmação configurado
- [ ] Template de reset configurado
- [ ] Subjects dos emails definidos
- [ ] URLs de redirecionamento configuradas
- [ ] Teste de envio realizado
- [ ] Design verificado em mobile
- [ ] Design verificado em desktop
- [ ] Todas as variáveis funcionando

## 🧪 Como Testar

### **Teste de Confirmação**
1. Registre novo usuário
2. Verifique email recebido
3. Teste responsividade
4. Clique no link de confirmação

### **Teste de Reset**
1. Use "Esqueci minha senha"
2. Verifique email recebido
3. Teste responsividade
4. Clique no link de reset

## 📞 Suporte

Se precisar de ajuda com a configuração:
- Documentação Supabase: [https://supabase.com/docs/guides/auth/auth-email-templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- Comunidade: [https://github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)

---

**🎯 Resultado**: Emails profissionais que reforçam a marca e melhoram a experiência do usuário!
