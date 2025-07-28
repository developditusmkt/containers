import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Search, 
  Eye, 
  Download, 
  MessageCircle, 
  Mail,
  FileText,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  Users,
  Package,
  Kanban
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuotes } from '../contexts/QuoteContext';
import { formatCurrency, formatDate, generateWhatsAppLink, generateEmailLink } from '../utils/formatters';
import { generateQuotePDF } from '../services/pdfService';
import { CategoryManagement } from '../components/CategoryManagement';
import { KanbanBoard } from '../components/KanbanBoard';
import { UserManagement } from '../components/UserManagement';
import { Quote } from '../types';

// Updated status system to match Kanban
const QUOTE_STATUSES = [
  { key: 'new', label: 'Novo', color: 'bg-blue-100 text-blue-800' },
  { key: 'analyzing', label: 'Em Análise', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'negotiating', label: 'Em Negociação', color: 'bg-purple-100 text-purple-800' },
  { key: 'awaiting-signature', label: 'Aguardando Assinatura', color: 'bg-orange-100 text-orange-800' },
  { key: 'approved', label: 'Aprovado', color: 'bg-green-100 text-green-800' },
  { key: 'awaiting-payment', label: 'Aguardando Pagamento', color: 'bg-indigo-100 text-indigo-800' },
  { key: 'paid', label: 'Pagamento Efetuado', color: 'bg-emerald-100 text-emerald-800' },
  { key: 'rejected', label: 'Recusado', color: 'bg-red-100 text-red-800' },
  { key: 'completed', label: 'Finalizado', color: 'bg-gray-100 text-gray-800' },
] as const;

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  analyzing: 'bg-yellow-100 text-yellow-800',
  negotiating: 'bg-purple-100 text-purple-800',
  'awaiting-signature': 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  'awaiting-payment': 'bg-indigo-100 text-indigo-800',
  paid: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-800',
  // Legacy status mapping
  pending: 'bg-blue-100 text-blue-800',
  signed: 'bg-gray-100 text-gray-800',
};

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { quotes, updateQuote } = useQuotes();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'quotes' | 'categories' | 'kanban' | 'users'>('quotes');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'value' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Map old status values to new status system
  const mapStatusToNew = (status: Quote['status']): string => {
    switch (status) {
      case 'pending': return 'new';
      case 'analyzing': return 'analyzing';
      case 'approved': return 'approved';
      case 'negotiating': return 'negotiating';
      case 'signed': return 'completed';
      default: return 'new';
    }
  };

  // Map new status back to quote status for compatibility
  const mapNewStatusToQuote = (newStatus: string): Quote['status'] => {
    switch (newStatus) {
      case 'new': return 'pending';
      case 'analyzing': return 'analyzing';
      case 'negotiating': return 'negotiating';
      case 'approved': return 'approved';
      case 'completed': return 'signed';
      default: return 'pending';
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.phone.includes(searchTerm) ||
      quote.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const currentStatus = mapStatusToNew(quote.status);
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort quotes
  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'status':
        const statusA = mapStatusToNew(a.status);
        const statusB = mapStatusToNew(b.status);
        comparison = statusA.localeCompare(statusB);
        break;
      case 'value':
        comparison = a.totalPrice - b.totalPrice;
        break;
      case 'name':
        comparison = a.customer.name.localeCompare(b.customer.name);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleStatusUpdate = (quoteId: string, newStatus: string) => {
    const quoteStatus = mapNewStatusToQuote(newStatus);
    updateQuote(quoteId, { status: quoteStatus });
  };

  const handleViewDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowDetails(true);
  };

  const handleDownloadPDF = (quote: Quote) => {
    generateQuotePDF(quote);
  };

  const handleWhatsApp = (quote: Quote) => {
    window.open(generateWhatsAppLink(quote), '_blank');
  };

  const handleEmail = (quote: Quote) => {
    window.open(generateEmailLink(quote), '_blank');
  };

  const stats = {
    total: quotes.length,
    new: quotes.filter(q => mapStatusToNew(q.status) === 'new').length,
    approved: quotes.filter(q => ['approved', 'awaiting-payment', 'paid', 'completed'].includes(mapStatusToNew(q.status))).length,
    totalValue: quotes.reduce((sum, q) => sum + q.totalPrice, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#44A17C] to-[#3e514f] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="text-white mr-3" size={32} />
              <div>
                <h1 className="text-xl font-bold text-white">Alencar Empreendimentos</h1>
                <p className="text-white/80">Painel Administrativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white">Olá, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('quotes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'quotes'
                    ? 'border-[#44A17C] text-[#44A17C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  Orçamentos
                </div>
              </button>
              <button
                onClick={() => setActiveTab('kanban')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'kanban'
                    ? 'border-[#44A17C] text-[#44A17C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Kanban size={16} />
                  Visão Kanban
                </div>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-[#44A17C] text-[#44A17C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  Usuários
                </div>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-[#44A17C] text-[#44A17C]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package size={16} />
                  Categorias e Itens
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'quotes' ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <FileText size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Orçamentos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <Calendar size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Novos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <Users size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aprovados</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-[#44A17C]/20 text-[#44A17C]">
                    <DollarSign size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Sorting */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Buscar por nome, telefone ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                  >
                    <option value="all">Todos os Status</option>
                    {QUOTE_STATUSES.map(status => (
                      <option key={status.key} value={status.key}>{status.label}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                  >
                    <option value="date">Ordenar por Data</option>
                    <option value="status">Ordenar por Status</option>
                    <option value="value">Ordenar por Valor</option>
                    <option value="name">Ordenar por Nome</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quotes Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Orçamentos Gerados</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedQuotes.map((quote) => {
                      const currentStatus = mapStatusToNew(quote.status);
                      return (
                        <tr key={quote.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{quote.customer.name}</div>
                              <div className="text-sm text-gray-500">{quote.customer.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{quote.customer.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(quote.totalPrice)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusUpdate(quote.id, e.target.value)}
                              className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${STATUS_COLORS[currentStatus] || STATUS_COLORS.new}`}
                            >
                              {QUOTE_STATUSES.map(status => (
                                <option key={status.key} value={status.key}>{status.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(quote.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewDetails(quote)}
                                className="text-[#44A17C] hover:text-[#3e514f]"
                                title="Ver detalhes"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(quote)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Baixar PDF"
                              >
                                <Download size={16} />
                              </button>
                              <button
                                onClick={() => handleWhatsApp(quote)}
                                className="text-green-600 hover:text-green-800"
                                title="WhatsApp"
                              >
                                <MessageCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleEmail(quote)}
                                className="text-blue-600 hover:text-blue-800"
                                title="E-mail"
                              >
                                <Mail size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {sortedQuotes.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhum orçamento encontrado</p>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'kanban' ? (
          <KanbanBoard onQuoteSelect={handleViewDetails} />
        ) : activeTab === 'users' ? (
          <UserManagement />
        ) : (
          <CategoryManagement />
        )}
      </div>

      {/* Quote Details Modal */}
      {showDetails && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#44A17C] to-[#3e514f] text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Detalhes do Orçamento</h2>
                  <p className="text-white/90">ID: {selectedQuote.id}</p>
                </div>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-white hover:text-white/80 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados do Cliente */}
                <div>
                  <h3 className="text-lg font-semibold text-[#3e514f] mb-3">Dados do Cliente</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div><strong>Nome:</strong> {selectedQuote.customer.name}</div>
                    <div><strong>Telefone:</strong> {selectedQuote.customer.phone}</div>
                    <div><strong>E-mail:</strong> {selectedQuote.customer.email}</div>
                    <div><strong>Endereço:</strong> {selectedQuote.customer.address}</div>
                    <div><strong>Data do Projeto:</strong> {selectedQuote.customer.projectDate}</div>
                    <div><strong>Finalidade:</strong> {selectedQuote.customer.purpose.join(', ')}</div>
                  </div>
                </div>

                {/* Itens do Orçamento */}
                <div>
                  <h3 className="text-lg font-semibold text-[#3e514f] mb-3">Itens do Orçamento</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Container Base:</span>
                        <span className="font-semibold">{formatCurrency(selectedQuote.basePrice)}</span>
                      </div>
                      {selectedQuote.selectedItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.name}:</span>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold text-[#44A17C]">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedQuote.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-[#3e514f] mb-3">Status do Orçamento</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Status Atual:</label>
                    <select
                      value={mapStatusToNew(selectedQuote.status)}
                      onChange={(e) => handleStatusUpdate(selectedQuote.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                    >
                      {QUOTE_STATUSES.map(status => (
                        <option key={status.key} value={status.key}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Campos Internos */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-[#3e514f] mb-3">Informações Internas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsável pelo Atendimento
                    </label>
                    <input
                      type="text"
                      value={selectedQuote.assignedTo || ''}
                      onChange={(e) => updateQuote(selectedQuote.id, { assignedTo: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Final Aprovado
                    </label>
                    <input
                      type="number"
                      value={selectedQuote.finalApprovedAmount || ''}
                      onChange={(e) => updateQuote(selectedQuote.id, { finalApprovedAmount: Number(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link do Contrato
                    </label>
                    <input
                      type="url"
                      value={selectedQuote.contractLink || ''}
                      onChange={(e) => updateQuote(selectedQuote.id, { contractLink: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={selectedQuote.paymentMethod || ''}
                      onChange={(e) => updateQuote(selectedQuote.id, { paymentMethod: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                    >
                      <option value="">Selecione...</option>
                      <option value="pix">PIX</option>
                      <option value="boleto">Boleto</option>
                      <option value="cartao">Cartão de Crédito</option>
                      <option value="transferencia">Transferência</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações Internas
                    </label>
                    <textarea
                      value={selectedQuote.internalNotes || ''}
                      onChange={(e) => updateQuote(selectedQuote.id, { internalNotes: e.target.value })}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                      placeholder="Observações internas..."
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Integração */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <FileText size={16} />
                  Gerar Contrato (Zapsign)
                </button>
                <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  <CreditCard size={16} />
                  Gerar Link de Pagamento (ASAAS)
                </button>
                <button 
                  onClick={() => handleDownloadPDF(selectedQuote)}
                  className="flex items-center gap-2 bg-[#44A17C] text-white px-4 py-2 rounded-lg hover:bg-[#3e514f] transition-colors"
                >
                  <Download size={16} />
                  Baixar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};