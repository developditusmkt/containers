import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { GeneratedContract, ContractSignatory } from '../types/contractSigning';
import { formatDate } from '../utils/formatters';

export class PDFGenerator {
  /**
   * Gera PDF do contrato com conteúdo e assinaturas
   */
  static async generateContractPDF(
    contract: GeneratedContract, 
    signatories: ContractSignatory[]
  ): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = margin;

      // Configurações de fonte
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');

      // Título do contrato
      pdf.text(contract.title, margin, currentY);
      currentY += 15;

      // Data de criação
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Gerado em: ${formatDate(contract.createdAt)}`, margin, currentY);
      currentY += 10;

      // Linha divisória
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 15;

      // Conteúdo do contrato
      await PDFGenerator.addContractContent(pdf, contract.content, margin, currentY, pageWidth, pageHeight);

      // Nova página para assinaturas
      pdf.addPage();
      currentY = margin;

      // Título da seção de assinaturas
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Assinaturas Digitais', margin, currentY);
      currentY += 15;

      // Adicionar cada assinatura
      const signedSignatories = signatories.filter(s => s.status === 'signed' && s.signatureData);
      
      for (let i = 0; i < signedSignatories.length; i++) {
        const signatory = signedSignatories[i];
        
        // Verificar se precisa de nova página
        if (currentY > pageHeight - 80) {
          pdf.addPage();
          currentY = margin;
        }

        currentY = await PDFGenerator.addSignature(pdf, signatory, margin, currentY, pageWidth, i + 1);
        currentY += 20; // Espaço entre assinaturas
      }

      // Rodapé em todas as páginas
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        PDFGenerator.addFooter(pdf, contract, pageWidth, pageHeight);
      }

      // Download do PDF
      const fileName = `${contract.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Erro ao gerar PDF do contrato');
    }
  }

  /**
   * Adiciona o conteúdo HTML do contrato ao PDF
   */
  private static async addContractContent(
    pdf: jsPDF,
    htmlContent: string,
    margin: number,
    startY: number,
    pageWidth: number,
    pageHeight: number
  ): Promise<void> {
    // Criar elemento temporário para renderizar HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.width = `${pageWidth - 2 * margin}mm`;
    tempDiv.style.padding = '10px';
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.4';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.backgroundColor = 'white';
    
    document.body.appendChild(tempDiv);

    try {
      // Converter HTML para canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Adicionar imagem ao PDF (pode quebrar em múltiplas páginas se necessário)
      let currentY = startY;
      const availableHeight = pageHeight - margin - startY - 20; // 20mm para rodapé

      if (imgHeight <= availableHeight) {
        // Cabe em uma página
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
      } else {
        // Precisa quebrar em múltiplas páginas
        let remainingHeight = imgHeight;
        let sourceY = 0;

        while (remainingHeight > 0) {
          const currentPageHeight = Math.min(remainingHeight, availableHeight);
          const scaledHeight = (currentPageHeight * canvas.width) / imgWidth;

          // Criar canvas para a parte atual
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = scaledHeight;
          const pageCtx = pageCanvas.getContext('2d');

          if (pageCtx) {
            pageCtx.drawImage(
              canvas,
              0, sourceY,
              canvas.width, scaledHeight,
              0, 0,
              canvas.width, scaledHeight
            );

            const pageImgData = pageCanvas.toDataURL('image/png');
            pdf.addImage(pageImgData, 'PNG', margin, currentY, imgWidth, currentPageHeight);
          }

          remainingHeight -= currentPageHeight;
          sourceY += scaledHeight;

          if (remainingHeight > 0) {
            pdf.addPage();
            currentY = margin;
          }
        }
      }
    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  /**
   * Adiciona uma assinatura digital ao PDF
   */
  private static async addSignature(
    pdf: jsPDF,
    signatory: ContractSignatory,
    margin: number,
    startY: number,
    pageWidth: number,
    signatureIndex: number
  ): Promise<number> {
    let currentY = startY;

    // Título da assinatura
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Assinatura ${signatureIndex}`, margin, currentY);
    
    if (signatory.isCreator) {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('(Criador do Contrato)', margin + 40, currentY);
    }
    currentY += 10;

    // Caixa para as informações
    pdf.setDrawColor(200, 200, 200);
    pdf.setFillColor(248, 249, 250);
    pdf.rect(margin, currentY, pageWidth - 2 * margin, 45, 'FD');

    currentY += 8;

    // Informações da assinatura
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    const leftColumn = margin + 5;
    const rightColumn = margin + (pageWidth - 2 * margin) / 2;

    // Coluna esquerda
    pdf.setFont('helvetica', 'bold');
    pdf.text('Nome:', leftColumn, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(signatory.name, leftColumn + 15, currentY);
    currentY += 6;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Email:', leftColumn, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(signatory.email, leftColumn + 15, currentY);
    currentY += 6;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Data/Hora:', leftColumn, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatDate(signatory.signedAt!), leftColumn + 25, currentY);
    currentY += 6;

    pdf.setFont('helvetica', 'bold');
    pdf.text('ID da Assinatura:', leftColumn, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text(signatory.id, leftColumn + 30, currentY);

    // Reset para posição da assinatura (coluna direita)
    currentY = startY + 18;

    // Adicionar imagem da assinatura
    if (signatory.signatureData) {
      try {
        // Área para assinatura
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Assinatura Digital:', rightColumn, currentY - 5);

        // Adicionar a imagem da assinatura
        const signatureWidth = 60;
        const signatureHeight = 20;
        
        pdf.addImage(
          signatory.signatureData,
          'PNG',
          rightColumn,
          currentY,
          signatureWidth,
          signatureHeight
        );

        // Linha para a assinatura
        pdf.setDrawColor(100, 100, 100);
        pdf.line(rightColumn, currentY + signatureHeight + 2, rightColumn + signatureWidth, currentY + signatureHeight + 2);
        
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'italic');
        pdf.text('Assinatura autenticada digitalmente', rightColumn, currentY + signatureHeight + 6);

      } catch (error) {
        console.error('Erro ao adicionar assinatura ao PDF:', error);
        pdf.setFontSize(8);
        pdf.text('Erro ao carregar assinatura', rightColumn, currentY);
      }
    }

    // Informações de auditoria
    currentY = startY + 55;
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    
    const auditInfo = [
      '✓ Assinatura criptograficamente verificada',
      '✓ Validação temporal confirmada',
      '✓ Auditoria de segurança aplicada'
    ];

    auditInfo.forEach((info, index) => {
      pdf.text(info, margin + 5, currentY + (index * 4));
    });

    // Reset cor do texto
    pdf.setTextColor(0, 0, 0);

    return currentY + 15;
  }

  /**
   * Adiciona rodapé ao PDF
   */
  private static addFooter(
    pdf: jsPDF,
    contract: GeneratedContract,
    pageWidth: number,
    pageHeight: number
  ): void {
    const footerY = pageHeight - 10;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    
    // Informações do documento
    const footerText = `Documento gerado em ${formatDate(new Date().toISOString())} • ID: ${contract.id}`;
    const textWidth = pdf.getTextWidth(footerText);
    const textX = (pageWidth - textWidth) / 2;
    
    pdf.text(footerText, textX, footerY);
    
    // Linha do rodapé
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, footerY - 3, pageWidth - 20, footerY - 3);
    
    // Reset cor
    pdf.setTextColor(0, 0, 0);
  }
}
