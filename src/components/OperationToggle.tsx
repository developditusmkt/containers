import { useOperation } from '../contexts/OperationContext';
import { ShoppingCart, Home } from 'lucide-react';

export function OperationToggle() {
  const { setOperationType, isVenda, isAluguel } = useOperation();

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setOperationType('venda')}
        className={`
          flex items-center px-4 py-2 rounded-md transition-all duration-200
          ${isVenda 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }
        `}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Venda
      </button>
      
      <button
        onClick={() => setOperationType('aluguel')}
        className={`
          flex items-center px-4 py-2 rounded-md transition-all duration-200 ml-1
          ${isAluguel 
            ? 'bg-green-600 text-white shadow-md' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }
        `}
      >
        <Home className="w-4 h-4 mr-2" />
        Aluguel
      </button>
    </div>
  );
}
