# 🚀 Deploy do Backend

## 📋 Pré-requisitos
- Conta no GitHub (já tem)
- Repositório no GitHub com o código

## 🎯 Opção 1: Render (Recomendado)

### Passo a Passo:

1. **Acesse [render.com](https://render.com)**
2. **Conecte com GitHub**
3. **Crie um novo Web Service**
   - Repository: `seu-usuario/containers`
   - Branch: `main`
   - Root Directory: `/`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Configure as Variáveis de Ambiente:**
   ```
   NODE_ENV=production
   ASAAS_API_KEY=sua_api_key_de_producao
   ASAAS_API_URL=https://api.asaas.com/v3
   PORT=10000
   ```

5. **Deploy será automático!**

### ✅ Resultado:
- URL do backend: `https://seu-app.onrender.com`
- Deploy automático a cada push no GitHub
- SSL gratuito
- Logs em tempo real

---

## 🎯 Opção 2: Railway

1. **Acesse [railway.app](https://railway.app)**
2. **Conecte com GitHub**
3. **Deploy from GitHub**
4. **Selecione o repositório**
5. **Configure variáveis de ambiente**
6. **Deploy automático!**

---

## 🎯 Opção 3: Vercel

1. **Acesse [vercel.com](https://vercel.com)**
2. **Import Git Repository**
3. **Configure como Node.js project**
4. **Deploy!**

---

## 🔧 Configuração do Frontend

Após o deploy do backend, você precisa atualizar o frontend para usar a URL de produção:

### No arquivo `src/services/asaasIntegration.ts`:

```typescript
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://seu-backend.onrender.com'  // URL do seu backend em produção
  : 'http://localhost:3001';
```

### Ou criar um arquivo `.env` no frontend:

```
VITE_BACKEND_URL=https://seu-backend.onrender.com
```

E usar:
```typescript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
```

---

## 🔐 Variáveis de Ambiente Necessárias:

### Backend (Render/Railway/Vercel):
```
NODE_ENV=production
ASAAS_API_KEY=sua_chave_de_producao_real
ASAAS_API_URL=https://api.asaas.com/v3
PORT=10000
```

### Frontend (Netlify):
```
VITE_BACKEND_URL=https://seu-backend.onrender.com
```

---

## 🎯 Qual serviço você prefere usar?

**Render** é o mais recomendado por ser:
- ✅ Gratuito
- ✅ Fácil configuração
- ✅ Deploy automático
- ✅ SSL incluído
- ✅ Logs detalhados
