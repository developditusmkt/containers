import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category } from '../types';
import { CategoryService, ItemService } from '../services/categoryService';
import { categories as fallbackCategories } from '../data/categories';

interface CategoryContextType {
  categories: Category[];
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addItemToCategory: (categoryId: string, name: string, price: number) => Promise<void>;
  updateItem: (itemId: string, name: string, price: number) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  resetToDefaults: () => void;
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar categorias do Supabase
  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias do banco de dados');
      // Fallback para dados locais em caso de erro
      setCategories(fallbackCategories);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const refreshCategories = async () => {
    await loadCategories();
  };

  const addCategory = async (name: string): Promise<void> => {
    try {
      setError(null);
      const newCategory = await CategoryService.createCategory(name);
      setCategories(prev => [...prev, newCategory]);
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
      setCategories(prev => prev.map(category => 
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
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (err) {
      console.error('Erro ao deletar categoria:', err);
      setError('Erro ao deletar categoria');
      throw err;
    }
  };

  const addItemToCategory = async (categoryId: string, name: string, price: number): Promise<void> => {
    try {
      setError(null);
      const newItem = await ItemService.createItem(categoryId, name, price);
      setCategories(prev => prev.map(category => 
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
      setCategories(prev => prev.map(category => ({
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
      setCategories(prev => prev.map(category => ({
        ...category,
        items: category.items.filter(item => item.id !== itemId)
      })));
    } catch (err) {
      console.error('Erro ao deletar item:', err);
      setError('Erro ao deletar item');
      throw err;
    }
  };

  const resetToDefaults = () => {
    setCategories(fallbackCategories);
    // Opcionalmente, você pode também recriar os dados no banco
  };

  return (
    <CategoryContext.Provider value={{ 
      categories, 
      addCategory,
      updateCategory,
      deleteCategory,
      addItemToCategory,
      updateItem,
      deleteItem,
      resetToDefaults,
      isLoading,
      error,
      refreshCategories
    }}>
      {children}
    </CategoryContext.Provider>
  );
};
