import jsPDF from 'jspdf';
import { Quote } from '../types';

export const generateQuotePDF = (quote: Quote): void => {
  const doc = new jsPDF();
  
  // Configuração de cores
  const primaryColor = [68, 161, 124]; // #44A17C
  const secondaryColor = [62, 81, 79]; // #3e514f
  
  // Cabeçalho
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('ALENCAR EMPREENDIMENTOS', 20, 20);
  
  doc.setFontSize(12);
  doc.text('Orçamento de Container', 20, 26);
  
  // Dados do cliente
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(16);
  doc.text('Dados do Cliente', 20, 45);
  
  doc.setFontSize(11);
  let y = 55;
  doc.text(`Nome: ${quote.customer.name}`, 20, y);
  doc.text(`Telefone: ${quote.customer.phone}`, 20, y + 7);
  doc.text(`E-mail: ${quote.customer.email}`, 20, y + 14);
  doc.text(`Endereço: ${quote.customer.address}`, 20, y + 21);
  doc.text(`Data do Projeto: ${quote.customer.projectDate}`, 20, y + 28);
  doc.text(`Finalidade: ${quote.customer.purpose.join(', ')}`, 20, y + 35);
  
  // Itens selecionados
  y = 110;
  doc.setFontSize(16);
  doc.text('Itens Selecionados', 20, y);
  
  doc.setFontSize(11);
  y += 10;
  
  // Valor base
  doc.text('Container Base', 20, y);
  doc.text(`R$ ${quote.basePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 150, y);
  y += 7;
  
  // Itens adicionais
  quote.selectedItems.forEach(item => {
    doc.text(item.name, 20, y);
    doc.text(`R$ ${item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 150, y);
    y += 7;
  });
  
  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(20, y, 190, y);
  y += 10;
  
  // Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 20, y);
  doc.text(`R$ ${quote.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 150, y);
  
  // Rodapé
  y = 250;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('contato@alencarempreendimentos.com.br', 20, y);
  doc.text('WhatsApp: (11) 93499-1883', 20, y + 7);
  doc.text(`Orçamento gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, y + 14);
  
  // Download do PDF
  doc.save(`Orçamento_${quote.customer.name.replace(/\s+/g, '_')}.pdf`);
};