import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, OperationType } from '../types';
import { CategoryService, ItemService } from '../services/categoryService';
import { categories as fallbackCategories } from '../data/categories';
import { useOperation } from './OperationContext';

interface CategoryContextType {
  categories: Category[];
  allCategories: Category[]; // Todas as categorias (para admin)
  addCategory: (name: string, operationType?: OperationType) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addItemToCategory: (categoryId: string, name: string, price: number) => Promise<void>;
  updateItem: (itemId: string, name: string, price: number) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { operationType } = useOperation();

  // Filtrar categorias baseado no tipo de operação
  const categories = allCategories.filter(category => category.operationType === operationType);

  // Carregar categorias do Supabase
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await CategoryService.getAllCategories();
      
      // Se os dados não têm operationType, definir como 'venda' por padrão
      const dataWithOperationType = data.map(cat => ({
        ...cat,
        operationType: cat.operationType || 'venda' as OperationType,
        items: cat.items.map(item => ({
          ...item,
          operationType: item.operationType || 'venda' as OperationType
        }))
      }));
      
      setAllCategories(dataWithOperationType);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias do banco de dados');
      
      // Fallback para dados locais em caso de erro - adicionar operationType
      const fallbackWithType = fallbackCategories.map(cat => ({
        ...cat,
        operationType: 'venda' as OperationType,
        items: cat.items.map(item => ({
          ...item,
          operationType: 'venda' as OperationType
        }))
      }));
      
      setAllCategories(fallbackWithType);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCategories = async () => {
    await loadCategories();
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const addCategory = async (name: string, operationType: OperationType = 'venda'): Promise<void> => {
    try {
      setError(null);
      const newCategory = await CategoryService.createCategory(name, operationType);
      setAllCategories(prev => [...prev, newCategory]);
    } catch (err) {
      console.error('Erro ao adicionar categoria:', err);
      setError('Erro ao adicionar categoria');
      throw err;
    }
  };

  const updateCategory = async (id: string, name: string): Promise<void> => {
    try {
      setError(null);
      await CategoryService.updateCategory(id, name);
      setAllCategories(prev => prev.map(category => 
        category.id === id ? { ...category, name } : category
      ));
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      setError('Erro ao atualizar categoria');
      throw err;
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      setError(null);
      await CategoryService.deleteCategory(id);
      setAllCategories(prev => prev.filter(category => category.id !== id));
    } catch (err) {
      console.error('Erro ao deletar categoria:', err);
      setError('Erro ao deletar categoria');
      throw err;
    }
  };

  const addItemToCategory = async (categoryId: string, name: string, price: number): Promise<void> => {
    try {
      setError(null);
      
      // Encontrar a categoria para usar seu operationType
      const category = allCategories.find(cat => cat.id === categoryId);
      const currentOperationType = category?.operationType || operationType;
      
      const newItem = await ItemService.createItem(categoryId, name, price, currentOperationType);
      
      setAllCategories(prev => prev.map(category => 
        category.id === categoryId 
          ? { ...category, items: [...category.items, newItem] }
          : category
      ));
    } catch (err) {
      console.error('Erro ao adicionar item:', err);
      setError('Erro ao adicionar item');
      throw err;
    }
  };

  const updateItem = async (itemId: string, name: string, price: number): Promise<void> => {
    try {
      setError(null);
      await ItemService.updateItem(itemId, name, price);
      setAllCategories(prev => prev.map(category => ({
        ...category,
        items: category.items.map(item => 
          item.id === itemId 
            ? { ...item, name, price }
            : item
        )
      })));
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      setError('Erro ao atualizar item');
      throw err;
    }
  };

  const deleteItem = async (itemId: string): Promise<void> => {
    try {
      setError(null);
      await ItemService.deleteItem(itemId);
      setAllCategories(prev => prev.map(category => ({
        ...category,
        items: category.items.filter(item => item.id !== itemId)
      })));
    } catch (err) {
      console.error('Erro ao deletar item:', err);
      setError('Erro ao deletar item');
      throw err;
    }
  };

  return (
    <CategoryContext.Provider value={{ 
      categories, 
      allCategories,
      addCategory,
      updateCategory,
      deleteCategory,
      addItemToCategory,
      updateItem,
      deleteItem,
      isLoading,
      error,
      refreshCategories
    }}>
      {children}
    </CategoryContext.Provider>
  );
};
