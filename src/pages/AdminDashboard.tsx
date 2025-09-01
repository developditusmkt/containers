import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  FileText,
  Package,
  Kanban,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { OperationToggle } from '../components/OperationToggle';
import { CategoryManagement } from '../components/CategoryManagement';
import { KanbanBoard } from '../components/KanbanBoard';
import { UserManagement } from '../components/UserManagement';
import { QuoteManagement } from '../components/QuoteManagement';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'quotes' | 'kanban' | 'categories' | 'users'>('quotes');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'quotes' as const, label: 'Orçamentos', icon: FileText },
    { id: 'kanban' as const, label: 'Kanban', icon: Kanban },
    { id: 'categories' as const, label: 'Categorias', icon: Package },
    { id: 'users' as const, label: 'Usuários', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
              <p className="text-sm text-gray-600">Alencar Empreendimentos</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <OperationToggle />
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="mr-2" size={18} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#44A17C] text-[#44A17C]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2" size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'quotes' && <QuoteManagement />}
        {activeTab === 'kanban' && <KanbanBoard />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'users' && <UserManagement />}
      </main>
    </div>
  );
};
