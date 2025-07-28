import React, { useState, useEffect } from 'react';
import { Quote } from '../types';
import { useQuotes } from '../contexts/QuoteContext';
import { formatCurrency, formatDate, formatPhone } from '../utils/formatters';
import { User, Phone, Mail, DollarSign, Calendar, Eye } from 'lucide-react';

const KANBAN_COLUMNS = [
  { id: 'new', title: 'Novos', color: 'bg-blue-100 border-blue-300' },
  { id: 'analyzing', title: 'Analisando', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'negotiating', title: 'Negociando', color: 'bg-orange-100 border-orange-300' },
  { id: 'awaiting-signature', title: 'Aguardando Assinatura', color: 'bg-purple-100 border-purple-300' },
  { id: 'approved', title: 'Aprovado', color: 'bg-green-100 border-green-300' },
  { id: 'awaiting-payment', title: 'Aguardando Pagamento', color: 'bg-indigo-100 border-indigo-300' },
  { id: 'paid', title: 'Pago', color: 'bg-emerald-100 border-emerald-300' },
  { id: 'rejected', title: 'Rejeitado', color: 'bg-red-100 border-red-300' },
  { id: 'completed', title: 'Concluído', color: 'bg-gray-100 border-gray-300' },
];

interface QuoteCardProps {
  quote: Quote;
  onViewDetails: (quote: Quote) => void;
  onDragStart: (e: React.DragEvent, quote: Quote) => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, onViewDetails, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, quote)}
      className="bg-white rounded-lg shadow-md p-4 mb-3 border-l-4 border-[#44A17C] cursor-move hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <User className="h-4 w-4 text-gray-500 mr-2" />
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {quote.customer.name}
          </h3>
        </div>
        <button
          onClick={() => onViewDetails(quote)}
          className="text-[#44A17C] hover:text-[#3e514f] p-1 rounded"
          title="Ver detalhes"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center">
          <Phone className="h-3 w-3 mr-2" />
          <span className="truncate">{formatPhone(quote.customer.phone)}</span>
        </div>
        <div className="flex items-center">
          <Mail className="h-3 w-3 mr-2" />
          <span className="truncate">{quote.customer.email}</span>
        </div>
        <div className="flex items-center">
          <DollarSign className="h-3 w-3 mr-2" />
          <span className="font-semibold text-[#44A17C]">
            {formatCurrency(quote.totalPrice)}
          </span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-2" />
          <span>{formatDate(quote.createdAt)}</span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {quote.selectedItems.length} itens • {quote.customer.city}/{quote.customer.state}
        </div>
      </div>
    </div>
  );
};

export const KanbanBoard: React.FC = () => {
  const { quotes, updateQuote, refreshQuotes } = useQuotes();
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [draggedQuote, setDraggedQuote] = useState<Quote | null>(null);

  useEffect(() => {
    refreshQuotes();
  }, []);

  const getQuotesByStatus = (status: string): Quote[] => {
    return quotes.filter(quote => quote.status === status);
  };

  const handleDragStart = (e: React.DragEvent, quote: Quote) => {
    setDraggedQuote(quote);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    
    if (draggedQuote && draggedQuote.status !== newStatus) {
      try {
        await updateQuote(draggedQuote.id, { 
          status: newStatus as Quote['status'] 
        });
      } catch (error) {
        console.error('Erro ao atualizar status do kanban:', error);
      }
    }
    setDraggedQuote(null);
  };

  const handleViewDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowModal(true);
  };

    const getStatusColor = (status: Quote['status']) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'analyzing': 'bg-yellow-100 text-yellow-800',
      'negotiating': 'bg-orange-100 text-orange-800',
      'awaiting-signature': 'bg-purple-100 text-purple-800',
      'approved': 'bg-green-100 text-green-800',
      'awaiting-payment': 'bg-indigo-100 text-indigo-800',
      'paid': 'bg-emerald-100 text-emerald-800',
      'rejected': 'bg-red-100 text-red-800',
      'completed': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Kanban de Orçamentos</h2>
        <button
          onClick={refreshQuotes}
          className="bg-[#44A17C] text-white px-4 py-2 rounded-lg hover:bg-[#3e514f] transition-colors"
        >
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 overflow-x-auto">
        {KANBAN_COLUMNS.map((column) => {
          const columnQuotes = getQuotesByStatus(column.id);
          
          return (
            <div key={column.id} className="min-w-[280px]">
              <div 
                className={`rounded-lg border-2 ${column.color} p-4 min-h-[400px]`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {column.title}
                  </h3>
                  <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full">
                    {columnQuotes.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnQuotes.map((quote) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      onViewDetails={handleViewDetails}
                      onDragStart={handleDragStart}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalhes */}
      {showModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Detalhes do Orçamento - {selectedQuote.customer.name}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados do Cliente */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Dados do Cliente</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {selectedQuote.customer.name}</p>
                    <p><strong>Telefone:</strong> {formatPhone(selectedQuote.customer.phone)}</p>
                    <p><strong>E-mail:</strong> {selectedQuote.customer.email}</p>
                    <p><strong>CEP:</strong> {selectedQuote.customer.cep}</p>
                    <p><strong>Endereço:</strong> {selectedQuote.customer.address}</p>
                    <p><strong>Cidade/Estado:</strong> {selectedQuote.customer.city}/{selectedQuote.customer.state}</p>
                    <p><strong>Data do Projeto:</strong> {formatDate(selectedQuote.customer.projectDate)}</p>
                    <p><strong>Finalidade:</strong> {selectedQuote.customer.purpose.join(', ')}</p>
                  </div>
                </div>

                {/* Dados do Orçamento */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Dados do Orçamento</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Valor Base:</strong> {formatCurrency(selectedQuote.basePrice)}</p>
                    <p><strong>Valor Total:</strong> {formatCurrency(selectedQuote.totalPrice)}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedQuote.status)}`}>
                        {selectedQuote.status}
                      </span>
                    </p>
                    <p><strong>Data de Criação:</strong> {formatDate(selectedQuote.createdAt)}</p>
                  </div>
                </div>

                {/* Itens Selecionados */}
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Itens Selecionados</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedQuote.selectedItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{item.category}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;