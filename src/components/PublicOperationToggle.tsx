import React from 'react';
import { ShoppingCart, Home } from 'lucide-react';
import { useOperation } from '../contexts/OperationContext';

export const PublicOperationToggle: React.FC = () => {
  const { setOperationType, isVenda, isAluguel } = useOperation();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
        Selecione o tipo de operação:
      </h3>
      
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setOperationType('venda')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isVenda
              ? 'bg-blue-500 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ShoppingCart size={20} />
          Compra
        </button>

        <button
          onClick={() => setOperationType('aluguel')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isAluguel
              ? 'bg-green-500 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Home size={20} />
          Aluguel
        </button>
      </div>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Modo atual: 
          <span className={`font-semibold ml-1 ${isVenda ? 'text-blue-500' : 'text-green-500'}`}>
            {isVenda ? 'Compra' : 'Aluguel'}
          </span>
        </p>
      </div>
    </div>
  );
};
