import React from 'react';
import { Category, Item } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CategorySectionProps {
  category: Category;
  selectedItems: Item[];
  onItemToggle: (item: Item) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  selectedItems,
  onItemToggle,
}) => {
  const isSelected = (item: Item) => selectedItems.some(selected => selected.id === item.id);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-[#3e514f] mb-4">{category.name}</h3>
      <div className="space-y-3">
        {category.items.map((item) => (
          <label
            key={item.id}
            className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
              isSelected(item)
                ? 'border-[#44A17C] bg-[#44A17C]/5'
                : 'border-gray-200 hover:border-[#44A17C]/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isSelected(item)}
                onChange={() => onItemToggle(item)}
                className="w-5 h-5 text-[#44A17C] rounded focus:ring-[#44A17C] focus:ring-2"
              />
              <span className="text-gray-700 font-medium">{item.name}</span>
            </div>
            <span className="text-[#44A17C] font-bold text-lg">
              {formatCurrency(item.price)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};