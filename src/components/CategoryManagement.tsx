import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Package, 
  DollarSign,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useCategories } from '../contexts/CategoryContext';
import { Category, Item } from '../types';
import { formatCurrency } from '../utils/formatters';

export const CategoryManagement: React.FC = () => {
  const { 
    categories, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    addItemToCategory, 
    updateItem, 
    deleteItem,
    resetToDefaults
  } = useCategories();

  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ categoryId: string; itemId: string } | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newItem, setNewItem] = useState<{ categoryId: string; name: string; price: string }>({ 
    categoryId: '', 
    name: '', 
    price: '' 
  });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const category: Category = {
        id: Date.now().toString(),
        name: newCategory.name.trim(),
        items: []
      };
      addCategory(category);
      setNewCategory({ name: '' });
      setShowAddCategory(false);
    }
  };

  const handleAddItem = (categoryId: string) => {
    if (newItem.name.trim() && newItem.price.trim()) {
      const item: Item = {
        id: Date.now().toString(),
        name: newItem.name.trim(),
        price: parseFloat(newItem.price),
        category: categories.find(c => c.id === categoryId)?.name || ''
      };
      addItemToCategory(categoryId, item);
      setNewItem({ categoryId: '', name: '', price: '' });
      setShowAddItem(null);
    }
  };

  const handleUpdateCategory = (categoryId: string, name: string) => {
    if (name.trim()) {
      updateCategory(categoryId, { name: name.trim() });
      setEditingCategory(null);
    }
  };

  const handleUpdateItem = (categoryId: string, itemId: string, name: string, price: string) => {
    if (name.trim() && price.trim()) {
      updateItem(categoryId, itemId, { 
        name: name.trim(), 
        price: parseFloat(price) 
      });
      setEditingItem(null);
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#3e514f]">Gerenciar Categorias e Itens</h2>
          <p className="text-gray-600">Configure os itens disponíveis na calculadora</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <RefreshCw size={16} />
            Restaurar Padrão
          </button>
          <button
            onClick={() => setShowAddCategory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#44A17C] text-white rounded-lg hover:bg-[#3e514f] transition-colors"
          >
            <Plus size={16} />
            Nova Categoria
          </button>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nova Categoria</h3>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ name: e.target.value })}
              placeholder="Nome da categoria"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C] mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddCategory}
                className="flex-1 bg-[#44A17C] text-white py-2 rounded-lg hover:bg-[#3e514f] transition-colors"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategory({ name: '' });
                }}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-orange-600" size={24} />
              <h3 className="text-lg font-semibold">Confirmar Restauração</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja restaurar as categorias e itens para os valores padrão? 
              Todas as alterações personalizadas serão perdidas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Restaurar
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-lg p-6">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-4">
              {editingCategory === category.id ? (
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="text"
                    defaultValue={category.name}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateCategory(category.id, e.currentTarget.value);
                      }
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                    autoFocus
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.parentElement?.querySelector('input');
                      if (input) {
                        handleUpdateCategory(category.id, input.value);
                      }
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Save size={16} />
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Package className="text-[#44A17C]" size={20} />
                    <h3 className="text-xl font-bold text-[#3e514f]">{category.name}</h3>
                    <span className="bg-[#44A17C]/10 text-[#44A17C] px-2 py-1 rounded-full text-sm">
                      {category.items.length} itens
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddItem(category.id)}
                      className="text-[#44A17C] hover:text-[#3e514f] p-1"
                      title="Adicionar item"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => setEditingCategory(category.id)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Editar categoria"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Excluir categoria"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Add Item Form */}
            {showAddItem === category.id && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-3">Adicionar Novo Item</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do item"
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                  />
                  <input
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Preço (R$)"
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                  />
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAddItem(category.id)}
                    className="bg-[#44A17C] text-white px-4 py-2 rounded-lg hover:bg-[#3e514f] transition-colors"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={() => {
                      setShowAddItem(null);
                      setNewItem({ categoryId: '', name: '', price: '' });
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-2">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  {editingItem?.categoryId === category.id && editingItem?.itemId === item.id ? (
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="text"
                        defaultValue={item.name}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                        id={`item-name-${item.id}`}
                      />
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} className="text-gray-500" />
                        <input
                          type="number"
                          defaultValue={item.price}
                          className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                          id={`item-price-${item.id}`}
                        />
                      </div>
                      <button
                        onClick={() => {
                          const nameInput = document.getElementById(`item-name-${item.id}`) as HTMLInputElement;
                          const priceInput = document.getElementById(`item-price-${item.id}`) as HTMLInputElement;
                          if (nameInput && priceInput) {
                            handleUpdateItem(category.id, item.id, nameInput.value, priceInput.value);
                          }
                        }}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-[#44A17C] font-bold">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingItem({ categoryId: category.id, itemId: item.id })}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Editar item"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteItem(category.id, item.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Excluir item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {category.items.length === 0 && (
                <p className="text-gray-500 text-center py-4">Nenhum item nesta categoria</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};