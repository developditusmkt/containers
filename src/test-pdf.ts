// Teste simples para verificar se as bibliotecas PDF estão funcionando
import { PDFGenerator } from './services/pdfGenerator';
import type { GeneratedContract, ContractSignatory } from './types/contractSigning';

// Teste para verificar se o PDFGenerator está funcionando corretamente
export const testPDFGeneration = async () => {
  try {
    const mockContract: GeneratedContract = {
      id: 'test-contract-1',
      quoteId: 'quote-1',
      templateId: 'template-1',
      title: 'Contrato de Teste',
      content: '<h1>Teste de Contrato</h1><p>Este é um contrato de teste para verificar a geração de PDF.</p>',
      variables: {},
      status: 'pending',
      createdBy: 'test-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      signingLink: 'test-link'
    };

    const mockSignatories: ContractSignatory[] = [
      {
        id: 'sig-1',
        contractId: 'test-contract-1',
        name: 'João da Silva',
        email: 'joao@teste.com',
        isCreator: false,
        orderIndex: 1,
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        signedAt: new Date().toISOString(),
        status: 'signed'
      }
    ];

    await PDFGenerator.generateContractPDF(mockContract, mockSignatories);
    
    console.log('✅ PDFGenerator está funcionando corretamente!');
    return true;
  } catch (error) {
    console.error('❌ Erro no PDFGenerator:', error);
    return false;
  }
};
