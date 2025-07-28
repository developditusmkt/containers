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
  return new Date(date).toLocaleDateString('pt-BR');
};

export const generateWhatsAppLink = (quote: Quote): string => {
  const message = `Olá! Gostaria de mais informações sobre o orçamento de container.

*Dados do Cliente:*
Nome: ${quote.customer.name}
Telefone: ${quote.customer.phone}
E-mail: ${quote.customer.email}
Endereço: ${quote.customer.address}
Data do Projeto: ${quote.customer.projectDate}
Finalidade: ${quote.customer.purpose.join(', ')}

*Resumo do Orçamento:*
Container Base: ${formatCurrency(quote.basePrice)}
${quote.selectedItems.map(item => `${item.name}: ${formatCurrency(item.price)}`).join('\n')}

*Total: ${formatCurrency(quote.totalPrice)}*

Aguardo retorno. Obrigado!`;

  return `https://wa.me/5511934991883?text=${encodeURIComponent(message)}`;
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
${quote.selectedItems.map(item => `${item.name}: ${formatCurrency(item.price)}`).join('\n')}

Total: ${formatCurrency(quote.totalPrice)}

Aguardo retorno.

Atenciosamente,
Equipe Alencar Empreendimentos`;

  return `mailto:comercial@alencaremp.com.br?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};