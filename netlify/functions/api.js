import axios from 'axios';

export const handler = async (event, context) => {
  console.log('🚀 Netlify Function chamada:', event.path, event.httpMethod);
  
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, access_token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api', '');
    console.log('📍 Path processado:', path);
    
    // Health check
    if (path === '/health' || path === '' || path === '/') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Backend Alencar Orçamentos - Netlify Functions',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          apiKeyConfigured: !!process.env.ASAAS_API_KEY,
          receivedPath: path,
          originalPath: event.path
        })
      };
    }

    // Payment links endpoint
    if (path === '/asaas/payment-links' && event.httpMethod === 'POST') {
      console.log('🎯 Criando payment link');
      
      if (!process.env.ASAAS_API_KEY) {
        return {
          statusCode: 503,
          headers,
          body: JSON.stringify({
            success: false,
            error: {
              message: 'API Key do Asaas não configurada',
              code: 'ASAAS_NOT_CONFIGURED'
            }
          })
        };
      }

      if (!event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Body da requisição não encontrado'
          })
        };
      }

      const paymentData = JSON.parse(event.body);
      
      console.log('📋 Dados para Asaas:', paymentData);
      
      const response = await axios.post(
        'https://api-sandbox.asaas.com/v3/paymentLinks',
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'access_token': process.env.ASAAS_API_KEY.replace(/"/g, '') // Remove aspas se houver
          }
        }
      );
      
      console.log('✅ Response Asaas:', response.data);
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          data: response.data
        })
      };
    }

    // Endpoint não encontrado
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        error: `Endpoint não encontrado: ${path}`,
        availableEndpoints: ['/health', '/asaas/payment-links'],
        receivedMethod: event.httpMethod,
        receivedPath: path
      })
    };

  } catch (error) {
    console.error('💥 Erro na function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          message: error.response?.data?.description || error.message,
          details: error.response?.data || 'Erro interno',
          asaasError: error.response?.data
        }
      })
    };
  }
};
