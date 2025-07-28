import { Quote } from '../types';
import { createPaymentLinkMock } from './asaasMockService';

/**
 * Serviço para integração com Asaas via backend usando estrutura CURL validada
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Cria link de pagamento usando integração inteligente via backend
 */
export async function createPaymentLink(quote: Quote) {
  console.log('🚀 Iniciando criação de link via backend (estrutura CURL validada)');
  
  try {
    // Verificar se backend está disponível
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error(`Backend não está disponível - Status: ${healthResponse.status}`);
    }

    // Preparar dados na estrutura correta do Asaas
    const paymentLinkData = {
      name: `Orçamento Container - ${quote.customer.name}`,
      description: `Orçamento para container personalizado - ID: ${quote.id}`,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias a partir de hoje
      value: quote.finalApprovedAmount || quote.totalPrice,
      billingType: "UNDEFINED",
      chargeType: "DETACHED",
      maxInstallmentCount: 12,
      dueDateLimitDays: 7,
      subscriptionCycle: null,
      callback: {
        successUrl: "https://grvolt.com.br/sucesso",
        autoRedirect: true
      }
    };

    console.log('📋 Dados sendo enviados para backend:', JSON.stringify(paymentLinkData, null, 2));

    const response = await fetch(`${BACKEND_URL}/api/asaas/payment-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentLinkData)
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('📨 Resposta do backend:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      throw new Error(result.error || 'Falha ao criar link de pagamento');
    }

    console.log('✅ Link criado com sucesso via backend');
    return result.data;

  } catch (error) {
    console.error('❌ Erro na integração real:', error);
    console.log('⚠️ Fallback para modo mock');
    
    // Fallback para mock
    return await createPaymentLinkMock(quote);
  }
}

/**
 * Validação simplificada - sempre tenta usar o backend primeiro
 */
export async function validateAsaasConfig() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    return response.ok;
  } catch (error) {
    console.warn('Backend não está disponível:', error);
    return false;
  }
}

/**
 * Diagnóstico simplificado
 */
export async function diagnoseAsaasConfig() {
  const backendAvailable = await validateAsaasConfig();
  
  return {
    isConfigured: backendAvailable,
    issues: backendAvailable ? [] : ['Backend não está rodando'],
    recommendations: backendAvailable 
      ? ['Integração configurada corretamente'] 
      : ['Inicie o backend com: npm run dev']
  };
}
