// Teste simples da API key
console.log('🔍 Testando API Key...');

// Lendo direto do arquivo .env
import fs from 'fs';
const envContent = fs.readFileSync('.env', 'utf8');
console.log('📄 Conteúdo do .env:');
console.log(envContent);

// Procurando pela linha da API key
const lines = envContent.split('\n');
const apiKeyLine = lines.find(line => line.startsWith('ASAAS_API_KEY='));
console.log('\n🔑 Linha da API Key:');
console.log('Linha encontrada:', apiKeyLine);

if (apiKeyLine) {
  const apiKey = apiKeyLine.replace('ASAAS_API_KEY=', '');
  console.log('API Key extraída:', apiKey);
  console.log('Comprimento:', apiKey.length);
  console.log('Primeiro caractere:', apiKey[0]);
  console.log('Últimos 10 caracteres:', apiKey.slice(-10));
}
