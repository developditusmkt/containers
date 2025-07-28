import React, { createContext, useContext, useState, useEffect } from 'react';
import { Quote } from '../types';
import { 
  createQuote, 
  getAllQuotes, 
  updateQuote as updateQuoteService, 
  deleteQuote as deleteQuoteService
} from '../services/quoteService';

interface QuoteContextType {
  quotes: Quote[];
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
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar todos os orçamentos
  const refreshQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedQuotes = await getAllQuotes();
      setQuotes(fetchedQuotes);
    } catch (err) {
      console.error('Erro ao buscar orçamentos:', err);
      setError('Erro ao carregar orçamentos');
      // Em caso de erro, tentar carregar do localStorage como fallback
      const savedQuotes = localStorage.getItem('alencar-quotes');
      if (savedQuotes) {
        setQuotes(JSON.parse(savedQuotes));
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar orçamentos ao inicializar o contexto
  useEffect(() => {
    refreshQuotes();
  }, []);

  // Salvar no localStorage sempre que os quotes mudarem (backup)
  useEffect(() => {
    if (quotes.length > 0) {
      localStorage.setItem('alencar-quotes', JSON.stringify(quotes));
    }
  }, [quotes]);

  const addQuote = async (quote: Quote): Promise<Quote> => {
    try {
      setError(null);
      const newQuote = await createQuote(quote);
      setQuotes(prev => [newQuote, ...prev]);
      return newQuote;
    } catch (err) {
      console.error('Erro ao adicionar orçamento:', err);
      setError('Erro ao salvar orçamento');
      // Fallback: adicionar apenas na memória
      setQuotes(prev => [quote, ...prev]);
      return quote;
    }
  };

  const updateQuote = async (id: string, updates: Partial<Quote>): Promise<void> => {
    try {
      setError(null);
      const updatedQuote = await updateQuoteService(id, updates);
      setQuotes(prev => prev.map(quote => 
        quote.id === id ? updatedQuote : quote
      ));
    } catch (err) {
      console.error('Erro ao atualizar orçamento:', err);
      setError('Erro ao atualizar orçamento');
      // Fallback: atualizar apenas na memória
      setQuotes(prev => prev.map(quote => 
        quote.id === id ? { ...quote, ...updates } : quote
      ));
    }
  };

  const deleteQuote = async (id: string): Promise<void> => {
    try {
      setError(null);
      await deleteQuoteService(id);
      setQuotes(prev => prev.filter(quote => quote.id !== id));
    } catch (err) {
      console.error('Erro ao deletar orçamento:', err);
      setError('Erro ao deletar orçamento');
      // Fallback: remover apenas da memória
      setQuotes(prev => prev.filter(quote => quote.id !== id));
    }
  };

  const getQuoteByIdLocal = (id: string): Quote | undefined => {
    return quotes.find(quote => quote.id === id);
  };

  const getQuotesByStatusLocal = (status: Quote['status']): Quote[] => {
    return quotes.filter(quote => quote.status === status);
  };

  return (
    <QuoteContext.Provider value={{ 
      quotes, 
      loading, 
      error, 
      addQuote, 
      updateQuote, 
      deleteQuote, 
      getQuoteById: getQuoteByIdLocal, 
      refreshQuotes,
      getQuotesByStatus: getQuotesByStatusLocal
    }}>
      {children}
    </QuoteContext.Provider>
  );
};