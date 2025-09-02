// Tipos para templates de contrato
export type ContractType = 'compra-vista' | 'compra-parcelada' | 'locacao' | 'aditamento-locacao';

export interface ContractTemplate {
  id: string;
  name: string;
  type: ContractType;
  content: string; // HTML content do contrato
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Labels para os tipos de contrato
export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  'compra-vista': 'Compra à Vista',
  'compra-parcelada': 'Compra Parcelada',
  'locacao': 'Locação',
  'aditamento-locacao': 'Aditamento de Locação'
};

// Opções para o select
export const CONTRACT_TYPE_OPTIONS: { value: ContractType; label: string }[] = [
  { value: 'compra-vista', label: 'Compra à Vista' },
  { value: 'compra-parcelada', label: 'Compra Parcelada' },
  { value: 'locacao', label: 'Locação' },
  { value: 'aditamento-locacao', label: 'Aditamento de Locação' }
];
