/**
 * Script de teste para verificar configuração da API key do Asaas
 */

import { ASAAS_CONFIG, getAsaasHeaders, validateAsaasConfig } from './config/asaas.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔍 Testando configuração do Asaas...\n');

console.log('📋 Configurações carregadas:');
console.log('- ASAAS_API_URL:', process.env.ASAAS_API_URL);
console.log('- ASAAS_API_KEY presente:', !!process.env.ASAAS_API_KEY);
console.log('- ASAAS_API_KEY length:', process.env.ASAAS_API_KEY?.length || 0);
console.log('- ASAAS_API_KEY prefix:', process.env.ASAAS_API_KEY?.substring(0, 15) + '...' || 'undefined');

console.log('\n📋 ASAAS_CONFIG:');
console.log('- baseURL:', ASAAS_CONFIG.baseURL);
console.log('- apiKey presente:', !!ASAAS_CONFIG.apiKey);
console.log('- apiKey length:', ASAAS_CONFIG.apiKey?.length || 0);
console.log('- apiKey prefix:', ASAAS_CONFIG.apiKey?.substring(0, 15) + '...' || 'undefined');

console.log('\n🔑 Testando getAsaasHeaders():');
try {
  const headers = getAsaasHeaders();
  console.log('- Headers criados com sucesso');
  console.log('- Content-Type:', headers['Content-Type']);
  console.log('- access_token presente:', !!headers['access_token']);
  console.log('- access_token length:', headers['access_token']?.length || 0);
  console.log('- access_token prefix:', headers['access_token']?.substring(0, 15) + '...' || 'undefined');
} catch (error) {
  console.error('❌ Erro ao criar headers:', error.message);
}

console.log('\n✅ Validação final:');
console.log('- Configuração válida:', validateAsaasConfig());
