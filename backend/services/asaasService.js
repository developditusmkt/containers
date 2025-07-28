/**
 * Serviço para comunicação com a API do Asaas
 * Implementa todas as funcionalidades necessárias com retry, cache e error handling
 */

import axios from 'axios';
import winston from 'winston';
import { getAsaasAxiosConfig, ASAAS_CONFIG, getAsaasHeaders } from '../config/asaas.js';
import { AsaasError } from '../middleware/errorMiddleware.js';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/asaas.log' })
  ]
});

/**
 * Cliente Axios configurado para Asaas
 */
const asaasClient = axios.create({
  baseURL: ASAAS_CONFIG.baseURL,
  timeout: ASAAS_CONFIG.timeout,
  validateStatus: function (status) {
    return status < 500; // Não rejeitar automaticamente para erros 4xx
  }
});

/**
 * Interceptor para adicionar headers dinamicamente a cada requisição
 */
asaasClient.interceptors.request.use(
  (config) => {
    // Adicionar headers dinamicamente a cada requisição para garantir API key atualizada
    config.headers = {
      ...config.headers,
      ...getAsaasHeaders()
    };
    
    logger.info(`Asaas Request: ${config.method?.toUpperCase()} ${config.url}`, {
      method: config.method,
      url: config.url,
      params: config.params,
      hasAccessToken: !!config.headers['access_token']
    });
    return config;
  },
  (error) => {
    logger.error('Asaas Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor para logging de responses
 */
asaasClient.interceptors.response.use(
  (response) => {
    logger.info(`Asaas Response: ${response.status} ${response.config.url}`, {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error(`Asaas Error Response: ${error.response.status} ${error.config?.url}`, {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else {
      logger.error('Asaas Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Função para fazer requisições com retry automático
 */
async function makeRequestWithRetry(requestFn, maxAttempts = ASAAS_CONFIG.retryAttempts) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Não retry para erros 4xx (exceto 429 - rate limit)
      if (error.response?.status && error.response.status < 500 && error.response.status !== 429) {
        break;
      }
      
      if (attempt < maxAttempts) {
        const delay = ASAAS_CONFIG.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        logger.warn(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms`, {
          error: error.message,
          attempt,
          maxAttempts
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Função para tratar erros da API do Asaas
 */
function handleAsaasError(error) {
  if (error.response) {
    const { status, data } = error.response;
    const message = data.errors?.[0]?.description || data.message || 'Erro na API do Asaas';
    const errors = data.errors || null;
    
    throw new AsaasError(message, status, errors);
  } else if (error.request) {
    throw new AsaasError('Falha na comunicação com Asaas', 503);
  } else {
    throw new AsaasError(error.message, 500);
  }
}

/**
 * Busca ou cria um cliente no Asaas
 */
export async function findOrCreateCustomer(customerData) {
  try {
    // Primeiro, tentar buscar cliente existente pelo email
    const searchResponse = await makeRequestWithRetry(async () => {
      return await asaasClient.get('/customers', {
        params: {
          email: customerData.email,
          limit: 1
        }
      });
    });

    if (searchResponse.data.data && searchResponse.data.data.length > 0) {
      const existingCustomer = searchResponse.data.data[0];
      logger.info(`Cliente encontrado: ${existingCustomer.id}`, { email: customerData.email });
      
      // Atualizar dados do cliente existente
      const updateResponse = await makeRequestWithRetry(async () => {
        return await asaasClient.put(`/customers/${existingCustomer.id}`, {
          name: customerData.name,
          phone: customerData.phone,
          mobilePhone: customerData.phone,
          postalCode: customerData.postalCode,
          address: customerData.address,
          city: customerData.city,
          state: customerData.state,
          observations: customerData.observations
        });
      });
      
      return updateResponse.data;
    } else {
      // Cliente não existe, criar novo
      const createResponse = await makeRequestWithRetry(async () => {
        return await asaasClient.post('/customers', customerData);
      });
      
      logger.info(`Cliente criado: ${createResponse.data.id}`, { email: customerData.email });
      return createResponse.data;
    }
  } catch (error) {
    handleAsaasError(error);
  }
}

/**
 * Cria um pagamento no Asaas
 */
export async function createPayment(paymentData) {
  try {
    const response = await makeRequestWithRetry(async () => {
      return await asaasClient.post('/payments', paymentData);
    });
    
    logger.info(`Pagamento criado: ${response.data.id}`, {
      paymentId: response.data.id,
      value: paymentData.value,
      customer: paymentData.customer
    });
    
    return response.data;
  } catch (error) {
    handleAsaasError(error);
  }
}

/**
 * Gera link de pagamento para um pagamento
 */
export async function createPaymentLink(paymentId) {
  try {
    const response = await makeRequestWithRetry(async () => {
      return await asaasClient.post(`/payments/${paymentId}/paymentLink`);
    });
    
    logger.info(`Link de pagamento criado para: ${paymentId}`, {
      paymentId,
      linkId: response.data.id,
      url: response.data.url
    });
    
    return response.data;
  } catch (error) {
    handleAsaasError(error);
  }
}

/**
 * Cria um payment link diretamente (sem criar cliente)
 * Endpoint: POST /v3/paymentLinks
 */
export async function createDirectPaymentLink(paymentLinkData) {
  try {
    const response = await makeRequestWithRetry(async () => {
      return await asaasClient.post('/paymentLinks', paymentLinkData);
    });
    
    logger.info(`Payment Link criado diretamente: ${response.data.id}`, {
      linkId: response.data.id,
      name: paymentLinkData.name,
      value: paymentLinkData.value,
      url: response.data.url
    });
    
    return response.data;
  } catch (error) {
    handleAsaasError(error);
  }
}

/**
 * Busca informações de um pagamento
 */
export async function getPayment(paymentId) {
  try {
    const response = await makeRequestWithRetry(async () => {
      return await asaasClient.get(`/payments/${paymentId}`);
    });
    
    return response.data;
  } catch (error) {
    handleAsaasError(error);
  }
}

/**
 * Lista pagamentos de um cliente
 */
export async function getCustomerPayments(customerId, options = {}) {
  try {
    const params = {
      customer: customerId,
      limit: options.limit || 50,
      offset: options.offset || 0,
      ...options
    };
    
    const response = await makeRequestWithRetry(async () => {
      return await asaasClient.get('/payments', { params });
    });
    
    return response.data;
  } catch (error) {
    handleAsaasError(error);
  }
}

/**
 * Cancela um pagamento
 */
export async function cancelPayment(paymentId) {
  try {
    const response = await makeRequestWithRetry(async () => {
      return await asaasClient.delete(`/payments/${paymentId}`);
    });
    
    logger.info(`Pagamento cancelado: ${paymentId}`);
    return response.data;
  } catch (error) {
    handleAsaasError(error);
  }
}

/**
 * Busca informações de um cliente
 */
export async function getCustomer(customerId) {
  try {
    const response = await makeRequestWithRetry(async () => {
      return await asaasClient.get(`/customers/${customerId}`);
    });
    
    return response.data;
  } catch (error) {
    handleAsaasError(error);
  }
}

/**
 * Testa a conectividade com a API do Asaas
 */
export async function testConnection() {
  try {
    const response = await asaasClient.get('/customers', {
      params: { limit: 1 }
    });
    
    logger.info('Teste de conexão com Asaas bem-sucedido');
    return {
      success: true,
      status: response.status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Teste de conexão com Asaas falhou:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
