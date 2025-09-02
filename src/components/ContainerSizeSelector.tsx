import React from 'react';
import { useOperation } from '../contexts/OperationContext';

export interface ContainerSize {
  id: string;
  size: string;
  description: string;
  vendaPrice: number;
  aluguelPrice: number;
  image: string;
}

interface ContainerSizeSelectorProps {
  selectedSize: ContainerSize | null;
  onSizeSelect: (size: ContainerSize) => void;
}

// Dados dos containers (imagens fake por enquanto)
const containerSizes: ContainerSize[] = [
  {
    id: '4m',
    size: '4 metros',
    description: 'Container compacto',
    vendaPrice: 45000,
    aluguelPrice: 750,
    image: 'https://via.placeholder.com/300x200/44A17C/FFFFFF?text=Container+4m'
  },
  {
    id: '6m', 
    size: '6 metros',
    description: 'Container médio',
    vendaPrice: 60000,
    aluguelPrice: 1000,
    image: 'https://via.placeholder.com/300x200/44A17C/FFFFFF?text=Container+6m'
  },
  {
    id: '12m',
    size: '12 metros', 
    description: 'Container grande',
    vendaPrice: 120000,
    aluguelPrice: 2500,
    image: 'https://via.placeholder.com/300x200/44A17C/FFFFFF?text=Container+12m'
  }
];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const ContainerSizeSelector: React.FC<ContainerSizeSelectorProps> = ({
  selectedSize,
  onSizeSelect
}) => {
  const { isVenda, isAluguel } = useOperation();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-[#3e514f] mb-4 text-center">
        Escolha o tamanho do seu container:
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {containerSizes.map((container) => {
          const isSelected = selectedSize?.id === container.id;
          const currentPrice = isVenda ? container.vendaPrice : container.aluguelPrice;
          const priceLabel = isAluguel ? 'mensal' : '';
          
          return (
            <button
              key={container.id}
              onClick={() => onSizeSelect(container)}
              className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                isSelected
                  ? 'border-[#44A17C] ring-2 ring-[#44A17C] ring-opacity-50'
                  : 'border-gray-200 hover:border-[#44A17C]'
              }`}
            >
              {/* Imagem do container */}
              <div className="aspect-video w-full">
                <img
                  src={container.image}
                  alt={`Container ${container.size}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Informações */}
              <div className="p-4 text-center">
                <h4 className="font-bold text-lg text-[#3e514f] mb-2">
                  {container.size}
                </h4>
                <p className="text-gray-600 text-sm mb-3">
                  {container.description}
                </p>
                <div className={`text-xl font-bold ${isSelected ? 'text-[#44A17C]' : 'text-gray-900'}`}>
                  {formatCurrency(currentPrice)}
                  {priceLabel && <span className="text-sm font-normal text-gray-600"> {priceLabel}</span>}
                </div>
              </div>
              
              {/* Indicador de seleção */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-[#44A17C] text-white rounded-full p-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedSize && (
        <div className="mt-4 text-center p-4 bg-[#44A17C] bg-opacity-10 rounded-lg">
          <p className="text-[#3e514f] font-medium">
            Container selecionado: <strong>{selectedSize.size}</strong>
          </p>
          <p className="text-[#44A17C] font-bold text-lg">
            Valor base: {formatCurrency(isVenda ? selectedSize.vendaPrice : selectedSize.aluguelPrice)}
            {isAluguel && ' mensal'}
          </p>
        </div>
      )}
    </div>
  );
};

export { containerSizes };
