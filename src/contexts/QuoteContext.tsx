import React, { createContext, useContext, useState, useEffect } from 'react';
import { Quote, OperationType } from '../types';
import { useOperation } from './OperationContext';
import { 
  createQuote, 
  getAllQuotes, 
  updateQuote as updateQuoteService, 
  deleteQuote as deleteQuoteService
} from '../services/quoteService';

interface QuoteContextType {
  quotes: Quote[];
  allQuotes: Quote[]; // Todos os orçamentos
  loading: boolean;
  error: string | null;
  addQuote: (quote: Quote) => Promise<Quote>;
  updateQuote: (id: string, updates: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  getQuoteById: (id: string) => Quote | undefined;
  refreshQuotes: () => Promise<void>;
  getQuotesByStatus: (status: Quote['status']) => Quote[];
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export const useQuotes = () => {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuotes must be used within a QuoteProvider');
  }
  return context;
};

export const QuoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { operationType } = useOperation();

  // Filtrar orçamentos baseado no tipo de operação
  const quotes = allQuotes.filter(quote => quote.operationType === operationType);

  // Função para buscar todos os orçamentos
  const refreshQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedQuotes = await getAllQuotes();
      
      // Se os dados não têm operationType, definir como 'venda' por padrão
      const quotesWithOperationType = fetchedQuotes.map(quote => ({
        ...quote,
        operationType: quote.operationType || 'venda' as OperationType
      }));
      
      setAllQuotes(quotesWithOperationType);
    } catch (err) {
      console.error('Erro ao buscar orçamentos:', err);
      setError('Erro ao carregar orçamentos');
      // Em caso de erro, tentar carregar do localStorage como fallback
      const savedQuotes = localStorage.getItem('alencar-quotes');
      if (savedQuotes) {
        const parsedQuotes = JSON.parse(savedQuotes);
        const quotesWithType = parsedQuotes.map((quote: any) => ({
          ...quote,
          operationType: quote.operationType || 'venda' as OperationType
        }));
        setAllQuotes(quotesWithType);
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar orçamentos ao inicializar
  useEffect(() => {
    refreshQuotes();
  }, []);

  // Função para adicionar novo orçamento
  const addQuote = async (quote: Quote): Promise<Quote> => {
    try {
      setError(null);
      
      // Garantir que tem operationType
      const quoteWithType = {
        ...quote,
        operationType: quote.operationType || operationType
      };
      
      const newQuote = await createQuote(quoteWithType);
      setAllQuotes(prev => [...prev, newQuote]);
      
      // Salvar no localStorage como backup
      const updatedQuotes = [...allQuotes, newQuote];
      localStorage.setItem('alencar-quotes', JSON.stringify(updatedQuotes));
      
      return newQuote;
    } catch (err) {
      console.error('Erro ao criar orçamento:', err);
      setError('Erro ao criar orçamento');
      throw err;
    }
  };

  // Função para atualizar orçamento
  const updateQuote = async (id: string, updates: Partial<Quote>): Promise<void> => {
    try {
      setError(null);
      await updateQuoteService(id, updates);
      
      setAllQuotes(prev => prev.map(quote => 
        quote.id === id ? { ...quote, ...updates } : quote
      ));
      
      // Atualizar localStorage
      const updatedQuotes = allQuotes.map(quote => 
        quote.id === id ? { ...quote, ...updates } : quote
      );
      localStorage.setItem('alencar-quotes', JSON.stringify(updatedQuotes));
    } catch (err) {
      console.error('Erro ao atualizar orçamento:', err);
      setError('Erro ao atualizar orçamento');
      throw err;
    }
  };

  // Função para deletar orçamento
  const deleteQuote = async (id: string): Promise<void> => {
    try {
      setError(null);
      await deleteQuoteService(id);
      
      setAllQuotes(prev => prev.filter(quote => quote.id !== id));
      
      // Atualizar localStorage
      const updatedQuotes = allQuotes.filter(quote => quote.id !== id);
      localStorage.setItem('alencar-quotes', JSON.stringify(updatedQuotes));
    } catch (err) {
      console.error('Erro ao deletar orçamento:', err);
      setError('Erro ao deletar orçamento');
      throw err;
    }
  };

  // Função para buscar orçamento por ID (considerando todos os orçamentos)
  const getQuoteById = (id: string): Quote | undefined => {
    return allQuotes.find(quote => quote.id === id);
  };

  // Função para filtrar orçamentos por status (apenas do tipo atual)
  const getQuotesByStatus = (status: Quote['status']): Quote[] => {
    return quotes.filter(quote => quote.status === status);
  };

  const value: QuoteContextType = {
    quotes,
    allQuotes,
    loading,
    error,
    addQuote,
    updateQuote,
    deleteQuote,
    getQuoteById,
    refreshQuotes,
    getQuotesByStatus
  };

  return (
    <QuoteContext.Provider value={value}>
      {children}
    </QuoteContext.Provider>
  );
};
