import { Quote } from '../types';

// Configurações do Asaas
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'; // URL do backend
const ASAAS_API_URL = import.meta.env.DEV ? '/api/asaas' : 'https://www.asaas.com/api/v3'; // Usar proxy em desenvolvimento
const ASAAS_API_KEY = import.meta.env.VITE_ASAAS_API_KEY || import.meta.env.REACT_APP_ASAAS_API_KEY || ''; // Manter para validação

// Debug: Log da chave carregada
console.log('Asaas API Key carregada:', {
  vite: import.meta.env.VITE_ASAAS_API_KEY ? `${import.meta.env.VITE_ASAAS_API_KEY.substring(0, 10)}...` : 'VAZIA',
  react: import.meta.env.REACT_APP_ASAAS_API_KEY ? `${import.meta.env.REACT_APP_ASAAS_API_KEY.substring(0, 10)}...` : 'VAZIA',
  final: ASAAS_API_KEY ? `${ASAAS_API_KEY.substring(0, 10)}...` : 'VAZIA',
  backend: BACKEND_URL,
  length: ASAAS_API_KEY.length
});

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

// Headers para as requisições
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'access_token': ASAAS_API_KEY,
  'User-Agent': 'Sistema Alencar Orçamentos'
});

// Função para criar ou buscar cliente no Asaas
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
    // Primeiro, tentar buscar cliente existente pelo email
    const searchResponse = await fetch(
      `${ASAAS_API_URL}/customers?email=${encodeURIComponent(quote.customer.email)}`,
      {
        method: 'GET',
        headers: getHeaders()
      }
    );

    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.data && searchResult.data.length > 0) {
        // Cliente já existe, retornar o primeiro encontrado
        return searchResult.data[0];
      }
    }

    // Cliente não existe, criar novo
    const createResponse = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(customerData)
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Erro ao criar cliente no Asaas: ${errorData.errors?.[0]?.description || createResponse.statusText}`);
    }

    return await createResponse.json();
  } catch (error) {
    console.error('Erro na comunicação com Asaas:', error);
    throw new Error(`Falha ao processar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

// Função para criar link de pagamento
export const createPaymentLink = async (quote: Quote): Promise<AsaasPaymentLink> => {
  if (!ASAAS_API_KEY) {
    throw new Error('Chave da API do Asaas não configurada. Verifique o arquivo .env');
  }

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

    const response = await fetch(`${ASAAS_API_URL}/paymentLinks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentLinkData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao criar link de pagamento: ${errorData.errors?.[0]?.description || response.statusText}`);
    }

    const paymentLink = await response.json();
    return paymentLink;
  } catch (error) {
    console.error('Erro ao criar link de pagamento:', error);
    throw error;
  }
};

// Função para buscar status de um pagamento
export const getPaymentStatus = async (paymentId: string) => {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar status do pagamento: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar status do pagamento:', error);
    throw error;
  }
};

// Função para listar links de pagamento
export const getPaymentLinks = async () => {
  try {
    const response = await fetch(`${ASAAS_API_URL}/paymentLinks`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar links de pagamento: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar links de pagamento:', error);
    throw error;
  }
};

// Função para validar configuração do Asaas
export const validateAsaasConfig = (): boolean => {
  const isValid = !!ASAAS_API_KEY && ASAAS_API_KEY.length > 0;
  console.log('Validando configuração Asaas:', {
    hasKey: !!ASAAS_API_KEY,
    keyLength: ASAAS_API_KEY.length,
    isValid,
    isDev: import.meta.env.DEV,
    apiUrl: ASAAS_API_URL
  });
  return isValid;
};

// Função para diagnosticar problemas de configuração
export const diagnoseAsaasConfig = (): string => {
  if (!ASAAS_API_KEY) {
    return `🔧 Configuração do Asaas necessária:

1. Crie um arquivo .env.local na raiz do projeto
2. Adicione sua chave da API do Asaas:
   VITE_ASAAS_API_KEY=sua_chave_aqui

3. Reinicie o servidor de desenvolvimento

📝 Como obter a chave:
- Acesse https://www.asaas.com
- Vá em Integrações > API
- Copie a chave de produção ou sandbox

💡 Dica: Para desenvolvimento, use a chave sandbox que começa com '$aact_'`;
  }

  if (ASAAS_API_KEY.length < 30) {
    return '⚠️ Chave da API parece inválida (muito curta). Verifique se copiou corretamente.';
  }

  return '✅ Configuração válida';
};
