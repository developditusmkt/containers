// Usar fetch nativo ao invés de axios para evitar problemas de dependências
export const handler = async (event, context) => {
  console.log('🚀 Function iniciada');
  console.log('📍 Path completo:', event.path);
  console.log('🔧 Método HTTP:', event.httpMethod);
  
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, access_token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('✅ Respondendo preflight OPTIONS');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Processar path - remover prefixo da function
    const path = event.path.replace('/.netlify/functions/api', '') || '/';
    console.log('🎯 Path processado:', path);
    
    // Health check - aceitar várias variações
    if (path === '/health' || path === '' || path === '/' || event.path.includes('health')) {
      console.log('❤️ Health check solicitado');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Backend Alencar Orçamentos - Netlify Functions',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          apiKeyConfigured: !!process.env.ASAAS_API_KEY,
          receivedPath: event.path,
          processedPath: path,
          method: event.httpMethod
        })
      };
    }

    // Debug: mostrar todas as informações da requisição
    console.log('🔍 Debug completo:', {
      originalPath: event.path,
      processedPath: path,
      method: event.httpMethod,
      hasBody: !!event.body,
      bodyLength: event.body?.length || 0
    });

    // Payment links endpoint - ser mais flexível na detecção
    if ((path.includes('payment-links') || path.includes('asaas')) && event.httpMethod === 'POST') {
      console.log('🎯 Endpoint payment-links detectado');
      
      if (!process.env.ASAAS_API_KEY) {
        console.log('❌ API Key não configurada');
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
        console.log('❌ Body não encontrado');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Body da requisição não encontrado'
          })
        };
      }

      let paymentData;
      try {
        paymentData = JSON.parse(event.body);
        console.log('📋 Dados recebidos:', paymentData);
      } catch (parseError) {
        console.log('❌ Erro ao fazer parse do JSON:', parseError);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'JSON inválido'
          })
        };
      }
      
      console.log('🌐 Fazendo requisição para Asaas com fetch...');
      
      // Usar fetch nativo ao invés de axios
      const asaasResponse = await fetch('https://api-sandbox.asaas.com/v3/paymentLinks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': process.env.ASAAS_API_KEY.replace(/"/g, '') // Remove aspas se houver
        },
        body: JSON.stringify(paymentData)
      });
      
      console.log('📡 Status da resposta Asaas:', asaasResponse.status);
      
      if (!asaasResponse.ok) {
        const errorData = await asaasResponse.json();
        console.log('❌ Erro Asaas:', errorData);
        
        return {
          statusCode: asaasResponse.status,
          headers,
          body: JSON.stringify({
            success: false,
            error: errorData
          })
        };
      }
      
      const responseData = await asaasResponse.json();
      console.log('✅ Response Asaas recebida com sucesso');
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          data: responseData
        })
      };
    }

    // Endpoint não encontrado
    console.log('❌ Endpoint não encontrado:', path);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Endpoint não encontrado',
        receivedPath: event.path,
        processedPath: path,
        method: event.httpMethod,
        availableEndpoints: ['/health', '/asaas/payment-links (POST)']
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
          message: error.message,
          stack: error.stack
        }
      })
    };
  }
};
