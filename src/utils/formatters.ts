import { Quote, Item } from '../types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
};

export const formatDate = (date: string): string => {
  if (!date || date === 'undefined' || date === 'null') {
    console.warn('⚠️ formatDate recebeu data inválida:', date);
    return 'Data não definida';
  }
  
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      console.warn('⚠️ formatDate não conseguiu parsear a data:', date);
      return 'Data inválida';
    }
    return parsedDate.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('❌ Erro ao formatar data:', error, 'Data original:', date);
    return 'Erro na data';
  }
};

export const generateWhatsAppLink = (quote: Quote): string => {
  const message = `Olá! Gostaria de mais informações sobre o orçamento de container.

*Dados do Cliente:*
Nome: ${quote.customer.name}
Telefone: ${quote.customer.phone}
E-mail: ${quote.customer.email}
Endereço: ${quote.customer.address}

*Itens Selecionados:*
${quote.selectedItems.map((item: any) => `${item.name}: ${formatCurrency(item.price)}`).join('\n')}

*Valor Total:* ${formatCurrency(quote.totalPrice)}

Aguardo contato. Obrigado!`;

  return `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
};

export const generateEmailLink = (quote: Quote): string => {
  const subject = `Orçamento Container - ${quote.customer.name}`;
  const body = `Olá,

Segue em anexo o orçamento solicitado para container personalizado.

Dados do Cliente:
Nome: ${quote.customer.name}
Telefone: ${quote.customer.phone}
E-mail: ${quote.customer.email}
Endereço: ${quote.customer.address}
Data do Projeto: ${quote.customer.projectDate}
Finalidade: ${quote.customer.purpose.join(', ')}

Resumo do Orçamento:
Container Base: ${formatCurrency(quote.basePrice)}
${quote.selectedItems.map((item: any) => `${item.name}: ${formatCurrency(item.price)}`).join('\n')}

Total: ${formatCurrency(quote.totalPrice)}

Aguardo retorno.

Atenciosamente,
Equipe Alencar Empreendimentos`;

  return `mailto:comercial@alencaremp.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};