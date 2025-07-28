import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, Item } from '../types';
import { categories as initialCategories } from '../data/categories';

interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addItemToCategory: (categoryId: string, item: Item) => void;
  updateItem: (categoryId: string, itemId: string, updates: Partial<Item>) => void;
  deleteItem: (categoryId: string, itemId: string) => void;
  resetToDefaults: () => void;
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

  useEffect(() => {
    const savedCategories = localStorage.getItem('alencar-categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(initialCategories);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('alencar-categories', JSON.stringify(categories));
  }, [categories]);

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(category => 
      category.id === id ? { ...category, ...updates } : category
    ));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(category => category.id !== id));
  };

  const addItemToCategory = (categoryId: string, item: Item) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? { ...category, items: [...category.items, item] }
        : category
    ));
  };

  const updateItem = (categoryId: string, itemId: string, updates: Partial<Item>) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? {
            ...category,
            items: category.items.map(item => 
              item.id === itemId ? { ...item, ...updates } : item
            )
          }
        : category
    ));
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? {
            ...category,
            items: category.items.filter(item => item.id !== itemId)
          }
        : category
    ));
  };

  const resetToDefaults = () => {
    setCategories(initialCategories);
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
      resetToDefaults
    }}>
      {children}
    </CategoryContext.Provider>
  );
};