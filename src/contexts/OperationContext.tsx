import React, { createContext, useContext, useState, useEffect } from 'react';

export type OperationType = 'venda' | 'aluguel';

interface OperationContextType {
  operationType: OperationType;
  setOperationType: (type: OperationType) => void;
  isVenda: boolean;
  isAluguel: boolean;
}

const OperationContext = createContext<OperationContextType | undefined>(undefined);

export function OperationProvider({ children }: { children: React.ReactNode }) {
  const [operationType, setOperationType] = useState<OperationType>(() => {
    // Persistir a escolha no localStorage
    const saved = localStorage.getItem('operation-type');
    return (saved as OperationType) || 'venda';
  });

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('operation-type', operationType);
  }, [operationType]);

  const value: OperationContextType = {
    operationType,
    setOperationType,
    isVenda: operationType === 'venda',
    isAluguel: operationType === 'aluguel'
  };

  return (
    <OperationContext.Provider value={value}>
      {children}
    </OperationContext.Provider>
  );
}

export function useOperation() {
  const context = useContext(OperationContext);
  if (context === undefined) {
    throw new Error('useOperation must be used within an OperationProvider');
  }
  return context;
}
