import dotenv from 'dotenv';

// Carregar .env
dotenv.config();

console.log('🔍 Debug da API Key:');
console.log('Valor bruto:', process.env.ASAAS_API_KEY);
console.log('Tipo:', typeof process.env.ASAAS_API_KEY);
console.log('Comprimento:', process.env.ASAAS_API_KEY?.length || 0);
console.log('Undefined?', process.env.ASAAS_API_KEY === undefined);
console.log('String vazia?', process.env.ASAAS_API_KEY === '');

// Verificar todas as variáveis ASAAS
console.log('\n📋 Todas as variáveis ASAAS:');
Object.keys(process.env)
  .filter(key => key.startsWith('ASAAS'))
  .forEach(key => {
    console.log(`${key}: ${process.env[key]}`);
  });
