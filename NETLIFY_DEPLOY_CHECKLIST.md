# ✅ Checklist de Deploy - Netlify

## 📋 Antes do Deploy

- [ ] Código commitado e pushed para GitHub
- [ ] API Key do Asaas de **PRODUÇÃO** em mãos
- [ ] Testado localmente com `npm run dev`

## 🚀 Deploy no Netlify

### 1. Configuração do Site
- [ ] Acessar [netlify.com](https://netlify.com)
- [ ] "New site from Git"
- [ ] Conectar repositório `containers`
- [ ] Branch: `main`

### 2. Build Settings
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Functions directory: `netlify/functions`

### 3. Environment Variables
```
NODE_ENV=production
ASAAS_API_KEY=sua_chave_de_producao_real
ASAAS_API_URL=https://api.asaas.com/v3
```

### 4. Deploy
- [ ] Click "Deploy site"
- [ ] Aguardar build (2-5 minutos)
- [ ] Verificar logs se houver erro

## 🧪 Testes Pós-Deploy

### Frontend
- [ ] Site carrega: `https://seu-app.netlify.app`
- [ ] Formulário funciona
- [ ] Botão "Gerar Link" aparece

### Backend API
- [ ] Health check: `https://seu-app.netlify.app/api/health`
- [ ] Deve retornar JSON com success: true

### Integração Asaas
- [ ] Criar orçamento teste
- [ ] Clicar "Gerar Link de Pagamento"
- [ ] Verificar se link é gerado (não deve ser mock)
- [ ] Testar pagamento no link gerado

## 🐛 Troubleshooting

### Se build falhar:
1. Verificar logs no Netlify
2. Verificar `package.json` dependencies
3. Verificar Node.js version (should be 18+)

### Se API não funcionar:
1. Verificar environment variables
2. Verificar logs das functions
3. Testar endpoints individualmente

### Se Asaas retornar erro:
1. Verificar API key (produção vs sandbox)
2. Verificar formato da requisição
3. Verificar logs de erro detalhados

## 🎉 Sucesso!

Quando tudo estiver funcionando:
- ✅ Frontend rodando no Netlify
- ✅ Backend serverless no Netlify
- ✅ Integração real com Asaas
- ✅ Deploy automático configurado

**URL Final:** `https://seu-app.netlify.app`
