import { Quote } from '../types';
import { formatCurrency } from '../utils/formatters';

// Mock service para simular integração Asaas enquanto não temos backend
export const createPaymentLinkMock = async (quote: Quote) => {
  if (!quote.finalApprovedAmount) {
    throw new Error('Valor final aprovado não definido. Configure o valor no orçamento antes de gerar o link de pagamento.');
  }

  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Gera URL de demonstração local
  const demoUrl = new URL('/payment-demo.html', window.location.origin);
  demoUrl.searchParams.set('customer', quote.customer.name);
  demoUrl.searchParams.set('amount', formatCurrency(quote.finalApprovedAmount));
  demoUrl.searchParams.set('description', `Orçamento #${quote.id.substring(0, 8)}`);

  // Simular resposta do Asaas
  const mockPaymentLink = {
    id: `mock_${Date.now()}`,
    name: `Orçamento ${quote.id} - ${quote.customer.name}`,
    url: demoUrl.toString(),
    billingType: ['BOLETO', 'CREDIT_CARD', 'PIX'],
    chargeType: 'DETACHED' as const,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: quote.finalApprovedAmount,
    description: `Pagamento do orçamento ${quote.id} - ${quote.customer.purpose.join(', ')}`,
    active: true
  };

  return mockPaymentLink;
};

export const validateAsaasConfigMock = (): boolean => {
  console.log('Usando modo MOCK para Asaas - Para produção, implemente backend');
  return true;
};
