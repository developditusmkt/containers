import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ContractTemplate } from '../types/contract';
import { ContractService } from '../services/contractService';

interface ContractContextType {
  contracts: ContractTemplate[];
  loading: boolean;
  error: string | null;
  fetchContracts: () => Promise<void>;
  createContract: (contract: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ContractTemplate>;
  updateContract: (id: string, updates: Partial<Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<ContractTemplate>;
  deleteContract: (id: string) => Promise<void>;
  toggleContractStatus: (id: string, isActive: boolean) => Promise<void>;
  getContractById: (id: string) => ContractTemplate | undefined;
  getContractsByType: (type: string) => ContractTemplate[];
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export const useContract = () => {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};

interface ContractProviderProps {
  children: React.ReactNode;
}

export const ContractProvider: React.FC<ContractProviderProps> = ({ children }) => {
  const [contracts, setContracts] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ContractService.getAllTemplates();
      setContracts(data);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createContract = useCallback(async (contractData: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newContract = await ContractService.createTemplate(contractData);
      setContracts(prev => [newContract, ...prev]);
      return newContract;
    } catch (err) {
      console.error('Error creating contract:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar contrato');
      throw err;
    }
  }, []);

  const updateContract = useCallback(async (id: string, updates: Partial<Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const updatedContract = await ContractService.updateTemplate(id, updates);
      setContracts(prev => prev.map(contract => 
        contract.id === id ? updatedContract : contract
      ));
      return updatedContract;
    } catch (err) {
      console.error('Error updating contract:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar contrato');
      throw err;
    }
  }, []);

  const deleteContract = useCallback(async (id: string) => {
    try {
      await ContractService.deleteTemplate(id);
      setContracts(prev => prev.filter(contract => contract.id !== id));
    } catch (err) {
      console.error('Error deleting contract:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir contrato');
      throw err;
    }
  }, []);

  const toggleContractStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      const updatedContract = await ContractService.toggleTemplateStatus(id, isActive);
      setContracts(prev => prev.map(contract => 
        contract.id === id ? updatedContract : contract
      ));
    } catch (err) {
      console.error('Error toggling contract status:', err);
      setError(err instanceof Error ? err.message : 'Erro ao alterar status do contrato');
      throw err;
    }
  }, []);

  const getContractById = useCallback((id: string) => {
    return contracts.find(contract => contract.id === id);
  }, [contracts]);

  const getContractsByType = useCallback((type: string) => {
    return contracts.filter(contract => contract.type === type && contract.isActive);
  }, [contracts]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const value = {
    contracts,
    loading,
    error,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    toggleContractStatus,
    getContractById,
    getContractsByType,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};
