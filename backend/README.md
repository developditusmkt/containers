# Backend Asaas - Sistema Alencar Orçamentos

Backend Node.js/Express para integração segura com a API do Asaas, resolvendo problemas de CORS e fornecendo uma camada adicional de segurança e validação.

## 🚀 Recursos Implementados

### ✅ Segurança
- **CORS configurado** para desenvolvimento e produção
- **Rate limiting** global e específico para pagamentos
- **Helmet.js** para headers de segurança
- **Validação robusta** de dados com express-validator
- **Logging completo** com Winston
- **Error handling** padronizado

### ✅ Funcionalidades
- **Criação/atualização de clientes** no Asaas
- **Geração de pagamentos** com configurações personalizáveis
- **Links de pagamento** completos
- **Consulta de status** de pagamentos
- **Cancelamento** de pagamentos
- **Retry automático** com exponential backoff
- **Health check** endpoint

### ✅ Endpoints Disponíveis

```
GET    /health                           - Health check
GET    /api/asaas/config                 - Validar configuração
GET    /api/asaas/test                   - Testar conectividade
POST   /api/asaas/customers              - Criar/atualizar cliente
POST   /api/asaas/payments               - Criar pagamento
POST   /api/asaas/payment-links          - Criar link completo
GET    /api/asaas/payments/:id           - Buscar pagamento
GET    /api/asaas/customers/:id/payments - Listar pagamentos do cliente
DELETE /api/asaas/payments/:id           - Cancelar pagamento
```

## 🔧 Instalação e Configuração

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:
```env
ASAAS_API_KEY=sua_chave_do_asaas
FRONTEND_URL=http://localhost:5173
```

### 3. Executar o servidor
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

### 4. Verificar funcionamento
```bash
# Health check
curl http://localhost:3001/health

# Testar configuração Asaas
curl http://localhost:3001/api/asaas/config
```

## 📡 Integração com Frontend

### Atualizar URL do backend no frontend
No arquivo `src/services/asaasIntegration.ts`:

```typescript
// Usar o backend em produção
const BACKEND_URL = 'http://localhost:3001';
```

### Exemplo de uso no frontend
```typescript
// Criar link de pagamento completo
const response = await fetch('http://localhost:3001/api/asaas/payment-links', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    quote: {
      id: 'quote_123',
      customer: {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999999999',
        address: 'Rua A, 123',
        city: 'São Paulo',
        state: 'SP',
        cep: '01234-567'
      },
      finalApprovedAmount: 1500.00,
      paymentMethod: 'PIX'
    }
  })
});

const result = await response.json();
console.log('Link gerado:', result.data.paymentLink.url);
```

## 🐳 Docker (Opcional)

### Criar Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

### Executar com Docker
```bash
# Build
docker build -t asaas-backend .

# Run
docker run -p 3001:3001 --env-file .env asaas-backend
```

## 📊 Logging

Logs são salvos em:
- `logs/error.log` - Apenas erros
- `logs/combined.log` - Todos os logs
- `logs/asaas.log` - Específico do Asaas
- Console - Durante desenvolvimento

## 🔒 Segurança Implementada

### Rate Limiting
- **Global**: 100 requests/15min por IP
- **Pagamentos**: 20 requests/15min por IP

### Headers de Segurança
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- E outros via Helmet.js

### Validação de Dados
- Sanitização de inputs
- Validação de tipos e formatos
- Tratamento de erros padronizado

## 🚀 Deploy em Produção

### Variáveis de ambiente necessárias:
```env
NODE_ENV=production
ASAAS_API_KEY=sua_chave_producao
FRONTEND_URL=https://seudominio.com
PORT=3001
```

### Checklist de deploy:
- [ ] Configurar HTTPS
- [ ] Configurar variáveis de ambiente
- [ ] Configurar logs persistentes
- [ ] Configurar monitoramento
- [ ] Testar all endpoints
- [ ] Configurar backup de logs

## 📈 Monitoramento

### Health Check
```bash
curl http://localhost:3001/health
```

Retorna:
```json
{
  "uptime": 123.45,
  "message": "Backend funcionando",
  "timestamp": "2025-01-28T10:00:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "asaasConfigured": true
}
```

### Logs de Exemplo
```
2025-01-28T10:00:00.000Z info: 🚀 Servidor rodando na porta 3001
2025-01-28T10:00:01.000Z info: Asaas Request: POST /payments
2025-01-28T10:00:02.000Z info: Pagamento criado: pay_123456
```

## 🧪 Testes

### Testar endpoints manualmente:
```bash
# Testar conectividade
curl -X GET http://localhost:3001/api/asaas/test

# Criar cliente
curl -X POST http://localhost:3001/api/asaas/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@test.com","phone":"11999999999"}'
```

## 🆘 Troubleshooting

### Erro: "Chave da API não configurada"
- Verifique se o arquivo `.env` existe
- Confirme se `ASAAS_API_KEY` está definida
- Reinicie o servidor após alterar `.env`

### Erro: "CORS policy"
- Verifique se `FRONTEND_URL` está correto no `.env`
- Confirme se o frontend está rodando na URL configurada

### Erro: "Timeout na requisição"
- Verifique conectividade com internet
- Teste com `curl https://www.asaas.com/api/v3/customers?limit=1`
- Aumente `ASAAS_TIMEOUT` se necessário

---

**✅ Backend completo e pronto para produção!** 

Este backend resolve todos os problemas de CORS, adiciona segurança robusta e fornece uma API limpa para o frontend consumir.
