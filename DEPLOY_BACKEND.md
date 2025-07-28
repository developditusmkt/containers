# 🚀 Deploy Completo Frontend + Backend

## 📋 Pré-requisitos
- Conta no GitHub (já tem)
- Repositório no GitHub com o código
- API Key do Asaas (produção)

## 🎯 Netlify (Frontend + Backend) - RECOMENDADO

### Configuração Completa:

1. **Push para GitHub** (se ainda não fez)
2. **Acesse [netlify.com](https://netlify.com)**
3. **New site from Git**
4. **Conecte seu repositório GitHub**
5. **Configure o build:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

6. **Configure as Variáveis de Ambiente no Netlify:**
   ```
   NODE_ENV=production
   ASAAS_API_KEY=sua_chave_de_producao_real
   ASAAS_API_URL=https://api.asaas.com/v3
   ```

7. **Deploy automático!**

### ✅ Resultado:
- Frontend: `https://seu-app.netlify.app`
- Backend: `https://seu-app.netlify.app/api/*`
- Deploy automático a cada push
- SSL gratuito
- Serverless functions
- 125k requests/mês grátis

---

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

## 🎯 Opção 3: Netlify Functions

### Para Backend no Netlify:

1. **Crie arquivo `netlify.toml` na raiz do projeto:**
   ```toml
   [build]
     command = "npm run build"
     functions = "netlify/functions"
     publish = "dist"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

2. **Crie pasta `netlify/functions/` e arquivo `api.js`:**
   ```javascript
   // netlify/functions/api.js
   import serverless from 'serverless-http';
   import express from 'express';
   import cors from 'cors';
   import asaasRoutes from '../../backend/routes/asaas.js';

   const app = express();
   
   app.use(cors());
   app.use(express.json());
   app.use('/api/asaas', asaasRoutes);
   
   export const handler = serverless(app);
   ```

3. **Configure variáveis no Netlify Dashboard:**
   - Site Settings → Environment Variables
   - Adicione: `ASAAS_API_KEY`, `ASAAS_API_URL`, `NODE_ENV`

4. **Deploy automático via GitHub!**

---

## 🎯 Opção 4: Vercel

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
