import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { useQuotes } from '../contexts/QuoteContext';
import { Quote } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

const KANBAN_STATUSES = [
  { key: 'new', label: 'Novo', color: 'bg-blue-100 border-blue-300' },
  { key: 'analyzing', label: 'Em Análise', color: 'bg-yellow-100 border-yellow-300' },
  { key: 'negotiating', label: 'Em Negociação', color: 'bg-purple-100 border-purple-300' },
  { key: 'awaiting-signature', label: 'Aguardando Assinatura', color: 'bg-orange-100 border-orange-300' },
  { key: 'approved', label: 'Aprovado', color: 'bg-green-100 border-green-300' },
  { key: 'awaiting-payment', label: 'Aguardando Pagamento', color: 'bg-indigo-100 border-indigo-300' },
  { key: 'paid', label: 'Pagamento Efetuado', color: 'bg-emerald-100 border-emerald-300' },
  { key: 'rejected', label: 'Recusado', color: 'bg-red-100 border-red-300' },
  { key: 'completed', label: 'Finalizado', color: 'bg-gray-100 border-gray-300' },
] as const;

interface KanbanBoardProps {
  onQuoteSelect: (quote: Quote) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onQuoteSelect }) => {
  const { quotes, updateQuote } = useQuotes();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [draggedQuote, setDraggedQuote] = useState<Quote | null>(null);

  // Map old status values to new kanban status values
  const mapStatusToKanban = (status: Quote['status']): string => {
    switch (status) {
      case 'pending': return 'new';
      case 'analyzing': return 'analyzing';
      case 'approved': return 'approved';
      case 'negotiating': return 'negotiating';
      case 'signed': return 'completed';
      default: return 'new';
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.phone.includes(searchTerm) ||
      quote.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const kanbanStatus = mapStatusToKanban(quote.status);
    const matchesStatus = statusFilter === 'all' || kanbanStatus === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const quoteDate = new Date(quote.createdAt);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - quoteDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = daysDiff === 0;
          break;
        case 'week':
          matchesDate = daysDiff <= 7;
          break;
        case 'month':
          matchesDate = daysDiff <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getQuotesByStatus = (status: string) => {
    return filteredQuotes.filter(quote => mapStatusToKanban(quote.status) === status);
  };

  const handleDragStart = (e: React.DragEvent, quote: Quote) => {
    setDraggedQuote(quote);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedQuote) {
      // Map kanban status back to quote status
      let quoteStatus: Quote['status'];
      switch (newStatus) {
        case 'new': quoteStatus = 'pending'; break;
        case 'analyzing': quoteStatus = 'analyzing'; break;
        case 'negotiating': quoteStatus = 'negotiating'; break;
        case 'approved': quoteStatus = 'approved'; break;
        case 'completed': quoteStatus = 'signed'; break;
        default: quoteStatus = 'pending';
      }
      
      updateQuote(draggedQuote.id, { status: quoteStatus });
      setDraggedQuote(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedQuote(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#3e514f]">Visão Kanban</h2>
          <p className="text-gray-600">Gerencie orçamentos por status</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
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
              {KANBAN_STATUSES.map(status => (
                <option key={status.key} value={status.key}>{status.label}</option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
            >
              <option value="all">Todos os Períodos</option>
              <option value="today">Hoje</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_STATUSES.map((status) => {
            const statusQuotes = getQuotesByStatus(status.key);
            
            return (
              <div
                key={status.key}
                className="flex-shrink-0 w-80"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status.key)}
              >
                {/* Column Header */}
                <div className={`p-3 rounded-t-lg border-2 ${status.color}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">{status.label}</h3>
                    <span className="bg-white px-2 py-1 rounded-full text-sm font-medium">
                      {statusQuotes.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className="border-2 border-t-0 border-gray-200 rounded-b-lg min-h-[500px] p-3 space-y-3 bg-gray-50">
                  {statusQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, quote)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white rounded-lg shadow-sm border p-4 cursor-move hover:shadow-md transition-shadow ${
                        draggedQuote?.id === quote.id ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Quote Card Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {quote.customer.name}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Calendar size={12} />
                            {formatDate(quote.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => onQuoteSelect(quote)}
                          className="text-[#44A17C] hover:text-[#3e514f] p-1"
                          title="Ver detalhes"
                        >
                          <Eye size={16} />
                        </button>
                      </div>

                      {/* Quote Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={12} />
                          <span className="truncate">{quote.customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={12} />
                          <span className="truncate">{quote.customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-bold text-[#44A17C] mt-3">
                          <DollarSign size={16} />
                          <span>{formatCurrency(quote.totalPrice)}</span>
                        </div>
                      </div>

                      {/* Quote Items Count */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          {quote.selectedItems.length} itens selecionados
                        </p>
                      </div>
                    </div>
                  ))}

                  {statusQuotes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Nenhum orçamento</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-[#44A17C]">
            {filteredQuotes.length}
          </div>
          <div className="text-sm text-gray-600">Total de Orçamentos</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {getQuotesByStatus('approved').length + getQuotesByStatus('paid').length + getQuotesByStatus('completed').length}
          </div>
          <div className="text-sm text-gray-600">Aprovados/Finalizados</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {getQuotesByStatus('new').length + getQuotesByStatus('analyzing').length + getQuotesByStatus('negotiating').length}
          </div>
          <div className="text-sm text-gray-600">Em Andamento</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-[#44A17C]">
            {formatCurrency(filteredQuotes.reduce((sum, q) => sum + q.totalPrice, 0))}
          </div>
          <div className="text-sm text-gray-600">Valor Total</div>
        </div>
      </div>
    </div>
  );
};