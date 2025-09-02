export interface GeneratedContract {
  id: string;
  quoteId: string;
  templateId: string;
  title: string;
  content: string; // HTML renderizado com variáveis preenchidas
  variables: Record<string, any>; // Dados das variáveis preenchidas
  status: 'pending' | 'creator_signed' | 'completed' | 'cancelled';
  createdBy: string;
  creatorSignedAt?: string;
  creatorSignatureData?: string; // Base64 da assinatura digital
  allSignedAt?: string;
  createdAt: string;
  updatedAt: string;
  signingLink?: string; // Token único para acesso público
}

export interface ContractSignatory {
  id: string;
  contractId: string;
  name: string;
  email: string;
  isCreator: boolean;
  orderIndex: number; // Ordem de assinatura (criador sempre 0)
  signedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  signatureData?: string; // Base64 da assinatura digital
  status: 'pending' | 'signed' | 'available_to_sign';
}

export interface ContractAuditLog {
  id: string;
  contractId: string;
  signatoryId?: string;
  action: string; // created, viewed, signed, link_accessed, etc
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ContractVariable {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select';
  required: boolean;
  options?: string[]; // Para tipo 'select'
  placeholder?: string;
  value?: string;
}

export interface ContractGenerationData {
  templateId: string;
  title: string;
  variables: Record<string, any>;
  signatories: Array<{
    name: string;
    email: string;
    isCreator?: boolean;
  }>;
  creatorSignature: string; // Base64 da assinatura
}

export interface PublicSigningData {
  signatoryId: string;
  name: string;
  email: string;
  signature: string; // Base64 da assinatura
}
