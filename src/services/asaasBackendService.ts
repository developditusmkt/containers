import { Quote } from '../types';

// Configurações - usando backend como proxy
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Interface para resposta do Asaas
interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
}

interface AsaasPaymentLink {
  id: string;
  name: string;
  url: string;
  billingType: string[];
  chargeType: 'DETACHED';
  endDate: string;
  value: number;
  description?: string;
  active: boolean;
}

// Função para criar ou buscar cliente no Asaas via backend
export const createOrUpdateCustomer = async (quote: Quote): Promise<AsaasCustomer> => {
  const customerData = {
    name: quote.customer.name,
    email: quote.customer.email,
    phone: quote.customer.phone.replace(/\D/g, ''), // Remove caracteres não numéricos
    postalCode: quote.customer.cep.replace(/\D/g, ''),
    address: quote.customer.address,
    province: quote.customer.address, // Bairro - pode ser melhorado
    city: quote.customer.city,
    state: quote.customer.state,
    externalReference: `quote_${quote.id}` // Referência do orçamento
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/asaas/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao processar cliente: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na comunicação com backend:', error);
    throw new Error(`Falha ao processar cliente via backend: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

// Função para criar link de pagamento via backend
export const createPaymentLink = async (quote: Quote): Promise<AsaasPaymentLink> => {
  if (!quote.finalApprovedAmount) {
    throw new Error('Valor final aprovado não definido. Configure o valor no orçamento antes de gerar o link de pagamento.');
  }

  try {
    // Primeiro, criar ou buscar o cliente
    const customer = await createOrUpdateCustomer(quote);

    // Dados do link de pagamento
    const paymentLinkData = {
      name: `Orçamento ${quote.id} - ${quote.customer.name}`,
      billingType: ['BOLETO', 'CREDIT_CARD', 'PIX'], // Aceita múltiplas formas de pagamento
      chargeType: 'DETACHED',
      value: quote.finalApprovedAmount,
      description: `Pagamento do orçamento ${quote.id} - ${quote.customer.purpose.join(', ')}`,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
      maxInstallmentCount: 12, // Permitir parcelamento em até 12x
      dueDateLimitDays: 7, // Vencimento em 7 dias
      subscriptionCycle: null, // Pagamento único
      customer: customer.id
    };

    const response = await fetch(`${BACKEND_URL}/api/asaas/payment-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentLinkData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao criar link de pagamento: ${errorData.error || response.statusText}`);
    }

    const paymentLink = await response.json();
    return paymentLink;
  } catch (error) {
    console.error('Erro ao criar link de pagamento:', error);
    throw error;
  }
};

// Função para validar configuração - agora verifica backend
export const validateAsaasConfig = (): boolean => {
  // Para desenvolvimento, sempre retornar true se o backend estiver configurado
  const isValid = !!BACKEND_URL && BACKEND_URL.length > 0;
  console.log('Validando configuração Asaas (via backend):', {
    backendUrl: BACKEND_URL,
    isValid
  });
  return isValid;
};

// Função para testar conectividade com backend
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.ok;
  } catch (error) {
    console.error('Backend não disponível:', error);
    return false;
  }
};
