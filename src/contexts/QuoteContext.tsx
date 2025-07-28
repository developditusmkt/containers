import React, { createContext, useContext, useState, useEffect } from 'react';
import { Quote } from '../types';

interface QuoteContextType {
  quotes: Quote[];
  addQuote: (quote: Quote) => void;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;
  getQuoteById: (id: string) => Quote | undefined;
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

  useEffect(() => {
    const savedQuotes = localStorage.getItem('alencar-quotes');
    if (savedQuotes) {
      setQuotes(JSON.parse(savedQuotes));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('alencar-quotes', JSON.stringify(quotes));
  }, [quotes]);

  const addQuote = (quote: Quote) => {
    setQuotes(prev => [...prev, quote]);
  };

  const updateQuote = (id: string, updates: Partial<Quote>) => {
    setQuotes(prev => prev.map(quote => 
      quote.id === id ? { ...quote, ...updates } : quote
    ));
  };

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(quote => quote.id !== id));
  };

  const getQuoteById = (id: string) => {
    return quotes.find(quote => quote.id === id);
  };

  return (
    <QuoteContext.Provider value={{ quotes, addQuote, updateQuote, deleteQuote, getQuoteById }}>
      {children}
    </QuoteContext.Provider>
  );
};