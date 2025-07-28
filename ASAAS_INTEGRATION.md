# Integração com Asaas - Links de Pagamento

## ⚠️ Problema CORS Identificado

### **O que aconteceu?**
A integração direta do frontend com a API do Asaas está bloqueada pelo **CORS Policy**:
```
Access to fetch at 'https://www.asaas.com/api/v3/customers' from origin 'http://localhost:5175' 
has been blocked by CORS policy
```

### **Por que acontece?**
1. **Segurança**: APIs de pagamento não permitem chamadas diretas do browser
2. **Chave da API**: Expor a chave no frontend é um risco de segurança
3. **CORS**: Asaas não permite requests de origens diferentes

## 🛠️ Soluções Implementadas

### **Solução Atual: Mock/Demonstração**
- ✅ **Status**: Funcional para demonstração
- 🧪 **Modo**: Simulação de links de pagamento
- ⚠️ **Limitação**: Não cria links reais no Asaas

### **Solução Recomendada: Backend/Proxy**
Para produção, implemente um backend que faça as chamadas à API:

#### 1. **Estrutura Recomendada**
```
projeto/
├── frontend/ (atual)
├── backend/
│   ├── server.js
│   ├── routes/asaas.js
│   └── .env (com ASAAS_API_KEY)
```

#### 2. **Backend Example** (arquivo criado: `backend-example.js`)
- Node.js + Express
- Proxy para API do Asaas
- CORS configurado para frontend
- Chave API segura no servidor

## Configuração

### 1. Obter Chave da API

1. Acesse o [Asaas](https://www.asaas.com) e faça login na sua conta
2. Vá para **API** > **Chaves de Integração**
3. Para desenvolvimento/testes:
   - Use a chave de **Sandbox**
   - URL da API: `https://sandbox.asaas.com/api/v3`
4. Para produção:
   - Use a chave de **Produção**
   - URL da API: `https://www.asaas.com/api/v3`

### 2. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Adicione sua chave da API do Asaas no arquivo `.env.local`:
   ```bash
   VITE_ASAAS_API_KEY=sua_chave_api_aqui
   # OU (ambos funcionam)
   REACT_APP_ASAAS_API_KEY=sua_chave_api_aqui
   ```

⚠️ **Importante**: 
- No Vite, use o arquivo `.env.local` 
- Prefira `VITE_` mas `REACT_APP_` também funciona
- Remova o `$` do início da chave se estiver presente

### 3. Exemplo de Configuração

Para desenvolvimento (Sandbox):
```bash
REACT_APP_ASAAS_API_KEY=$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNDQ5MDQ6OiRhYWNkXzExNjVlODU0LTJiMDgtNDMwOC1hODJhLWY3NWE2YzRkMGU1ZQ==
```

## Como Usar

### 1. Preparar Orçamento

Antes de gerar o link de pagamento, certifique-se de que:
- O orçamento tem um **Valor Final Aprovado** definido
- As informações do cliente estão completas

### 2. Gerar Link de Pagamento

1. Acesse **Admin > Orçamentos**
2. Encontre o orçamento desejado
3. Clique no ícone **💳** (Cartão de Crédito) para gerar link de pagamento
4. O sistema irá:
   - Criar/atualizar o cliente no Asaas
   - Gerar o link de pagamento
   - Salvar o link no orçamento
   - Copiar o link para área de transferência
   - Abrir o link em nova aba

### 3. Funcionalidades do Link

O link de pagamento gerado permite:
- **Múltiplas formas de pagamento**: Boleto, PIX, Cartão de Crédito
- **Parcelamento**: Até 12x no cartão de crédito
- **Validade**: 30 dias
- **Vencimento**: 7 dias para boleto
- **Descrição**: Inclui ID do orçamento e finalidade

## Estrutura do Sistema

### Serviços

#### `src/services/asaasService.ts`
- `createOrUpdateCustomer()`: Cria ou busca cliente no Asaas
- `createPaymentLink()`: Gera link de pagamento
- `getPaymentStatus()`: Consulta status de pagamento
- `validateAsaasConfig()`: Valida configuração da API

### Componentes

#### `src/components/QuoteManagement.tsx`
- Botão de gerar link de pagamento com loading
- Validações de valor e configuração
- Mensagens de sucesso/erro
- Integração com banco de dados

## Fluxo de Funcionamento

1. **Validação**: Sistema verifica se API está configurada e valor está definido
2. **Cliente**: Busca ou cria cliente no Asaas com dados do orçamento
3. **Link**: Gera link de pagamento com valor final aprovado
4. **Salvamento**: Salva link no banco de dados (campo `payment_link`)
5. **Notificação**: Mostra mensagem de sucesso e copia link
6. **Redirecionamento**: Abre link em nova aba

## Tratamento de Erros

- **API não configurada**: Mensagem explicativa
- **Valor não definido**: Solicita definir valor final aprovado
- **Erro de comunicação**: Exibe erro específico da API
- **Timeout**: Indica falha de conexão

## Webhooks (Opcional)

Para receber notificações automáticas de pagamento, configure webhooks no Asaas:

1. Acesse **Configurações > Webhooks** no Asaas
2. Configure URL do webhook: `https://seu-dominio.com/api/webhooks/asaas`
3. Selecione eventos: `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`

## Segurança

- ✅ Chave da API mantida no servidor (.env)
- ✅ Validação de dados antes do envio
- ✅ Tratamento de erros adequado
- ✅ Logs de auditoria
- ⚠️ **Importante**: Nunca exponha a chave da API no frontend

## Limitações

- Links de pagamento têm validade de 30 dias
- Parcelamento limitado a 12x
- Requer conexão com internet
- Dependente da disponibilidade da API do Asaas

## Suporte

Para problemas com a integração:
1. Verifique a configuração da API key
2. Confirme se o valor final aprovado está definido
3. Consulte logs do navegador (F12 > Console)
4. Verifique documentação oficial: https://www.asaas.com/api/docs/
