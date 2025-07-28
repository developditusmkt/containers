import axios from 'axios';

// Teste direto da API key
const API_KEY = 'aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjdmNmI1ZGUyLThjYzItNGYzNi1iM2YwLTYxOTgwZDc2YjNmMDo6JGFhY2hfNzg2ZWU0OGUtZWZiZS00Y2FmLWE5ODAtNjA3Y2JiZTQzMmJj';

console.log('🧪 Testando API Key diretamente...');
console.log('🔑 Chave:', API_KEY.substring(0, 20) + '...');

async function testAsaasConnection() {
  try {
    const response = await axios.get('https://api-sandbox.asaas.com/v3/customers', {
      headers: {
        'Content-Type': 'application/json',
        'access_token': API_KEY
      },
      params: {
        limit: 1
      }
    });
    
    console.log('✅ API Key válida!');
    console.log('Status:', response.status);
    console.log('Dados:', response.data);
  } catch (error) {
    console.error('❌ Erro na API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

testAsaasConnection();
