import React, { useState, useEffect } from 'react';
import { Quote } from '../types';
import { useQuotes } from '../contexts/QuoteContext';
import { formatCurrency, formatDate, formatPhone } from '../utils/formatters';
import { Eye, Trash2, Search } from 'lucide-react';

export const QuoteManagement: React.FC = () => {
  const { quotes, deleteQuote, updateQuote, refreshQuotes, loading } = useQuotes();
  const [statusFilter, setStatusFilter] = useState<'all' | Quote['status']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    refreshQuotes();
  }, []);

  const filteredQuotes = quotes.filter(quote => {
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    const matchesSearch = 
      quote.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customer.phone.includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (quoteId: string, newStatus: Quote['status']) => {
    try {
      await updateQuote(quoteId, { status: newStatus });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este orçamento?')) {
      try {
        await deleteQuote(quoteId);
      } catch (error) {
        console.error('Erro ao deletar orçamento:', error);
      }
    }
  };

  const openQuoteDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQuote(null);
  };

  const getStatusColor = (status: Quote['status']): string => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'analyzing': 'bg-yellow-100 text-yellow-800',
      'negotiating': 'bg-orange-100 text-orange-800',
      'awaiting-signature': 'bg-purple-100 text-purple-800',
      'approved': 'bg-green-100 text-green-800',
      'awaiting-payment': 'bg-indigo-100 text-indigo-800',
      'paid': 'bg-emerald-100 text-emerald-800',
      'rejected': 'bg-red-100 text-red-800',
      'completed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: Quote['status']): string => {
    const labels = {
      'new': 'Novo',
      'analyzing': 'Analisando',
      'negotiating': 'Negociando',
      'awaiting-signature': 'Aguardando Assinatura',
      'approved': 'Aprovado',
      'awaiting-payment': 'Aguardando Pagamento',
      'paid': 'Pago',
      'rejected': 'Rejeitado',
      'completed': 'Concluído'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#44A17C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Orçamentos</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filtro de Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | Quote['status'])}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#44A17C]"
          >
            <option value="all">Todos os Status</option>
            <option value="new">Novo</option>
            <option value="analyzing">Analisando</option>
            <option value="negotiating">Negociando</option>
            <option value="awaiting-signature">Aguardando Assinatura</option>
            <option value="approved">Aprovado</option>
            <option value="awaiting-payment">Aguardando Pagamento</option>
            <option value="paid">Pago</option>
            <option value="rejected">Rejeitado</option>
            <option value="completed">Concluído</option>
          </select>

          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#44A17C] w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Lista de Orçamentos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {quotes.length === 0 ? 'Nenhum orçamento encontrado.' : 'Nenhum orçamento corresponde aos filtros selecionados.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quote.customer.name}</div>
                      <div className="text-sm text-gray-500">{quote.customer.email}</div>
                      <div className="text-sm text-gray-500">{formatPhone(quote.customer.phone)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={quote.status}
                        onChange={(e) => handleStatusChange(quote.id, e.target.value as Quote['status'])}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-[#44A17C] ${getStatusColor(quote.status)}`}
                      >
                        <option value="new">Novo</option>
                        <option value="analyzing">Analisando</option>
                        <option value="negotiating">Negociando</option>
                        <option value="awaiting-signature">Aguardando Assinatura</option>
                        <option value="approved">Aprovado</option>
                        <option value="awaiting-payment">Aguardando Pagamento</option>
                        <option value="paid">Pago</option>
                        <option value="rejected">Rejeitado</option>
                        <option value="completed">Concluído</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(quote.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quote.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openQuoteDetails(quote)}
                          className="text-[#44A17C] hover:text-[#3a8f6c] flex items-center"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showModal && selectedQuote && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalhes do Orçamento
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações do Cliente */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Informações do Cliente</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Nome:</strong> {selectedQuote.customer.name}</p>
                      <p><strong>Email:</strong> {selectedQuote.customer.email}</p>
                      <p><strong>Telefone:</strong> {formatPhone(selectedQuote.customer.phone)}</p>
                    </div>
                    <div>
                      <p><strong>Endereço:</strong> {selectedQuote.customer.address}</p>
                      <p><strong>CEP:</strong> {selectedQuote.customer.cep}</p>
                      <p><strong>Cidade:</strong> {selectedQuote.customer.city}</p>
                      <p><strong>Estado:</strong> {selectedQuote.customer.state}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <p><strong>Data do Projeto:</strong> {formatDate(selectedQuote.customer.projectDate)}</p>
                    <p><strong>Finalidade:</strong> {selectedQuote.customer.purpose.join(', ')}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Status do Orçamento</h4>
                  <p><strong>Status:</strong>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedQuote.status)}`}>
                      {getStatusLabel(selectedQuote.status)}
                    </span>
                  </p>
                </div>

                {/* Itens Selecionados */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Itens Selecionados</h4>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedQuote.selectedItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-500">{item.category}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Resumo Financeiro */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Resumo Financeiro</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Preço Base:</strong> {formatCurrency(selectedQuote.basePrice)}</p>
                    <p><strong>Preço Total:</strong> {formatCurrency(selectedQuote.totalPrice)}</p>
                    {selectedQuote.finalApprovedAmount && (
                      <p><strong>Valor Final Aprovado:</strong> {formatCurrency(selectedQuote.finalApprovedAmount)}</p>
                    )}
                    {selectedQuote.paymentMethod && (
                      <p><strong>Método de Pagamento:</strong> {selectedQuote.paymentMethod}</p>
                    )}
                  </div>
                </div>

                {/* Informações Adicionais */}
                {(selectedQuote.assignedTo || selectedQuote.internalNotes || selectedQuote.contractLink || selectedQuote.paymentLink) && (
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Informações Adicionais</h4>
                    <div className="text-sm space-y-1">
                      {selectedQuote.assignedTo && (
                        <p><strong>Responsável:</strong> {selectedQuote.assignedTo}</p>
                      )}
                      {selectedQuote.internalNotes && (
                        <p><strong>Notas Internas:</strong> {selectedQuote.internalNotes}</p>
                      )}
                      {selectedQuote.contractLink && (
                        <p><strong>Link do Contrato:</strong> 
                          <a href={selectedQuote.contractLink} target="_blank" rel="noopener noreferrer" className="ml-1 text-[#44A17C] hover:underline">
                            Visualizar
                          </a>
                        </p>
                      )}
                      {selectedQuote.paymentLink && (
                        <p><strong>Link de Pagamento:</strong> 
                          <a href={selectedQuote.paymentLink} target="_blank" rel="noopener noreferrer" className="ml-1 text-[#44A17C] hover:underline">
                            Pagar
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Data de Criação */}
                <div className="text-sm text-gray-500">
                  <p><strong>Criado em:</strong> {formatDate(selectedQuote.createdAt)}</p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
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