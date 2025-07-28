// Backend simples em Node.js/Express para proxy das chamadas Asaas
// Arquivo: backend/server.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

// Configurar CORS para permitir localhost:5175
app.use(cors({
  origin: 'http://localhost:5175',
  credentials: true
}));

app.use(express.json());

// Configuração do Asaas
const ASAAS_API_URL = 'https://www.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY; // Chave no servidor

// Headers para Asaas
const getAsaasHeaders = () => ({
  'Content-Type': 'application/json',
  'access_token': ASAAS_API_KEY,
  'User-Agent': 'Sistema Alencar Orçamentos'
});

// Rota para criar/buscar cliente
app.post('/api/asaas/customers', async (req, res) => {
  try {
    const { customerData } = req.body;
    
    // Buscar cliente existente
    const searchResponse = await fetch(
      `${ASAAS_API_URL}/customers?email=${encodeURIComponent(customerData.email)}`,
      {
        method: 'GET',
        headers: getAsaasHeaders()
      }
    );

    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.data && searchResult.data.length > 0) {
        return res.json(searchResult.data[0]);
      }
    }

    // Criar novo cliente
    const createResponse = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: getAsaasHeaders(),
      body: JSON.stringify(customerData)
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.errors?.[0]?.description || createResponse.statusText);
    }

    const customer = await createResponse.json();
    res.json(customer);

  } catch (error) {
    console.error('Erro ao processar cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para criar link de pagamento
app.post('/api/asaas/payment-links', async (req, res) => {
  try {
    const { paymentLinkData } = req.body;
    
    const response = await fetch(`${ASAAS_API_URL}/paymentLinks`, {
      method: 'POST',
      headers: getAsaasHeaders(),
      body: JSON.stringify(paymentLinkData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.[0]?.description || response.statusText);
    }

    const paymentLink = await response.json();
    res.json(paymentLink);

  } catch (error) {
    console.error('Erro ao criar link de pagamento:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});

module.exports = app;
