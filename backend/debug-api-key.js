import dotenv from 'dotenv';
import { getAsaasHeaders, ASAAS_CONFIG } from './config/asaas.js';

// Carregar .env
dotenv.config();

console.log('🔍 DIAGNÓSTICO DA API KEY:\n');

console.log('1️⃣ Variável de ambiente:');
console.log('ASAAS_API_KEY =', process.env.ASAAS_API_KEY || 'UNDEFINED');

console.log('\n2️⃣ Configuração carregada:');
console.log('ASAAS_CONFIG.apiKey =', ASAAS_CONFIG.apiKey || 'UNDEFINED');

console.log('\n3️⃣ Headers gerados:');
try {
  const headers = getAsaasHeaders();
  console.log('access_token =', headers.access_token || 'UNDEFINED');
  console.log('Tipo da chave:', typeof headers.access_token);
  console.log('Comprimento da chave:', headers.access_token?.length || 0);
} catch (error) {
  console.error('ERRO ao gerar headers:', error.message);
}

console.log('\n4️⃣ Validação do formato:');
const apiKey = process.env.ASAAS_API_KEY;
if (apiKey) {
  console.log('Começa com aact_:', apiKey.startsWith('aact_'));
  console.log('Comprimento total:', apiKey.length);
  console.log('Primeiro parte:', apiKey.substring(0, 20) + '...');
  console.log('Última parte:', '...' + apiKey.substring(apiKey.length - 20));
} else {
  console.log('❌ API Key não encontrada!');
}
