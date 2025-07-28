import React, { useState } from 'react';
import { UserPlus, Users, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const UserManagement: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { createUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await createUser(email, password, name, role);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
        // Limpar formulário
        setEmail('');
        setPassword('');
        setName('');
        setRole('user');
        setShowCreateForm(false);
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao criar usuário' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao criar usuário. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="text-[#44A17C]" size={24} />
          <h2 className="text-xl font-semibold text-[#3e514f]">Gerenciar Usuários</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-[#44A17C] text-white px-4 py-2 rounded-lg hover:bg-[#3a8d6a] transition-colors"
        >
          <UserPlus size={18} />
          Novo Usuário
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <XCircle size={18} />
          )}
          {message.text}
        </div>
      )}

      {showCreateForm && (
        <div className="border rounded-lg p-6 mb-6 bg-gray-50">
          <h3 className="text-lg font-medium text-[#3e514f] mb-4">Criar Novo Usuário</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44A17C] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44A17C] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44A17C] focus:border-transparent"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuário
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#44A17C] focus:border-transparent"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-[#44A17C] text-white px-6 py-2 rounded-lg hover:bg-[#3a8d6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Criar Usuário
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setMessage(null);
                  setEmail('');
                  setPassword('');
                  setName('');
                  setRole('user');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium text-[#3e514f] mb-4">Usuários Existentes</h3>
        <div className="text-gray-500 text-center py-8">
          <Users size={48} className="mx-auto mb-2 opacity-50" />
          <p>Lista de usuários será implementada aqui</p>
          <p className="text-sm">Conecte-se ao Supabase para ver os usuários existentes</p>
        </div>
      </div>
    </div>
  );
};
