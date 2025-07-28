/**
 * Configuração da API do Asaas
 * Centraliza todas as configurações relacionadas ao Asaas
 */

import dotenv from 'dotenv';

// Garantir que o .env seja carregado
dotenv.config();

// Configurações da API do Asaas
export const ASAAS_CONFIG = {
  // URL base da API (sandbox ou produção)
  baseURL: process.env.ASAAS_API_URL || 'https://api-sandbox.asaas.com/v3',
  
  // Chave da API
  apiKey: process.env.ASAAS_API_KEY,
  
  // Configurações de timeout
  timeout: parseInt(process.env.ASAAS_TIMEOUT) || 30000, // 30 segundos
  
  // Configurações de retry
  retryAttempts: parseInt(process.env.ASAAS_RETRY_ATTEMPTS) || 3,
  retryDelay: parseInt(process.env.ASAAS_RETRY_DELAY) || 1000, // 1 segundo
  
  // Configurações de pagamento padrão
  defaultSettings: {
    // Dias para vencimento do boleto/PIX
    dueDateDays: parseInt(process.env.ASAAS_DUE_DATE_DAYS) || 7,
    
    // Percentual de desconto para pagamento antecipado
    discountPercentage: parseFloat(process.env.ASAAS_DISCOUNT_PERCENTAGE) || 5.0,
    
    // Dias limite para desconto
    discountDueDateLimitDays: parseInt(process.env.ASAAS_DISCOUNT_DAYS) || 3,
    
    // Percentual de juros ao mês
    interestPercentage: parseFloat(process.env.ASAAS_INTEREST_PERCENTAGE) || 2.0,
    
    // Percentual de multa
    finePercentage: parseFloat(process.env.ASAAS_FINE_PERCENTAGE) || 1.0,
    
    // Máximo de parcelas para cartão de crédito
    maxInstallments: parseInt(process.env.ASAAS_MAX_INSTALLMENTS) || 12,
    
    // Valor mínimo da parcela
    minInstallmentValue: parseFloat(process.env.ASAAS_MIN_INSTALLMENT_VALUE) || 50.0
  }
};

/**
 * Valida se as configurações do Asaas estão corretas
 */
export function validateAsaasConfig() {
  const { apiKey } = ASAAS_CONFIG;
  
  console.log('🔍 validateAsaasConfig - apiKey:', apiKey ? 'PRESENTE' : 'AUSENTE');
  console.log('🔍 validateAsaasConfig - apiKey length:', apiKey?.length || 0);
  
  if (!apiKey) {
    console.log('❌ API Key não encontrada');
    return false;
  }
  
  if (apiKey.length < 20) {
    console.log('❌ API Key muito curta');
    return false;
  }
  
  console.log('✅ API Key válida');
  return true;
}

/**
 * Verifica se está em modo sandbox
 */
export function isSandboxMode() {
  return ASAAS_CONFIG.apiKey?.startsWith('$aact_') || false;
}

/**
 * Obtém headers padrão para requisições à API do Asaas
 */
export function getAsaasHeaders() {
  const apiKey = ASAAS_CONFIG.apiKey;
  
  console.log('🔑 Debug - API Key presente:', !!apiKey);
  console.log('🔑 Debug - API Key length:', apiKey ? apiKey.length : 0);
  console.log('🔑 Debug - API Key prefix:', apiKey ? apiKey.substring(0, 15) + '...' : 'undefined');
  
  if (!apiKey) {
    console.error('❌ API Key do Asaas não encontrada!');
    throw new Error('API Key do Asaas não configurada');
  }
  
  return {
    'Content-Type': 'application/json',
    'access_token': apiKey,
    'User-Agent': 'Sistema-Alencar-Orcamentos/1.0'
  };
}

/**
 * Obtém configuração completa do Axios para Asaas
 */
export function getAsaasAxiosConfig() {
  return {
    baseURL: ASAAS_CONFIG.baseURL,
    timeout: ASAAS_CONFIG.timeout,
    headers: getAsaasHeaders(),
    validateStatus: function (status) {
      return status < 500; // Não rejeitar automaticamente para erros 4xx
    }
  };
}

export default ASAAS_CONFIG;
