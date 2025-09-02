import React, { useState, useEffect } from 'react';
import { Quote } from '../types';
import { useQuotes } from '../contexts/QuoteContext';
import { formatCurrency, formatDate, formatPhone } from '../utils/formatters';
import { Eye, Trash2, Search, Edit, FileText, CreditCard, CheckCircle, Copy, ExternalLink } from 'lucide-react';
// Usando integração inteligente (real ou mock automaticamente)
import { createPaymentLink, validateAsaasConfig, diagnoseAsaasConfig } from '../services/asaasIntegration';

export const QuoteManagement: React.FC = () => {
  const { quotes, deleteQuote, updateQuote, refreshQuotes, loading } = useQuotes();
  const [statusFilter, setStatusFilter] = useState<'all' | Quote['status']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    assignedTo: '',
    internalNotes: '',
    finalApprovedAmount: '',
    paymentMethod: '',
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPayment, setIsGeneratingPayment] = useState(false);
  const [showPaymentLinkNotification, setShowPaymentLinkNotification] = useState(false);
  const [paymentLinkData, setPaymentLinkData] = useState({ amount: '', customerName: '', link: '' });

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

  const openEditModal = (quote: Quote) => {
    setSelectedQuote(quote);
    setEditFormData({
      assignedTo: quote.assignedTo || '',
      internalNotes: quote.internalNotes || '',
      finalApprovedAmount: quote.finalApprovedAmount?.toString() || '',
      paymentMethod: quote.paymentMethod || '',
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedQuote(null);
    setEditFormData({
      assignedTo: '',
      internalNotes: '',
      finalApprovedAmount: '',
      paymentMethod: '',
    });
  };

  const handleEditFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!selectedQuote || isSaving) return;

    setIsSaving(true);
    
    try {
      const updates = {
        assignedTo: editFormData.assignedTo,
        internalNotes: editFormData.internalNotes,
        finalApprovedAmount: editFormData.finalApprovedAmount ? parseFloat(editFormData.finalApprovedAmount) : undefined,
        paymentMethod: editFormData.paymentMethod,
      };

      await updateQuote(selectedQuote.id, updates);
      closeEditModal();
      
      // Mostrar mensagem de sucesso
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000); // Esconder após 3 segundos
    } catch (error) {
      console.error('Erro ao salvar alterações:', error);
      
      // Mostrar mensagem de erro
      setErrorMessage('Erro ao salvar alterações. Tente novamente.');
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage('');
      }, 4000); // Esconder após 4 segundos
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateContract = (quote: Quote) => {
    // Função para gerar contrato - implementar integração futura
    alert(`Gerar contrato para ${quote.customer.name}\nID: ${quote.id}\nEsta funcionalidade será implementada em breve.`);
  };

  const handleGeneratePaymentLink = async (quote: Quote) => {
    // Validar configuração do Asaas
    const isConfigured = await validateAsaasConfig();
    if (!isConfigured) {
      const diagnosis = await diagnoseAsaasConfig();
      setErrorMessage(diagnosis.issues.join(', ') || 'Configuração do Asaas inválida');
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage('');
      }, 10000);
      return;
    }

    // Validar se o orçamento tem valor final aprovado
    if (!quote.finalApprovedAmount || quote.finalApprovedAmount <= 0) {
      setErrorMessage('Defina o valor final aprovado antes de gerar o link de pagamento');
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage('');
      }, 4000);
      return;
    }

    setIsGeneratingPayment(true);
    
    try {
      console.log('🚀 Gerando link de pagamento para orçamento:', quote.id);
      const paymentLink = await createPaymentLink(quote);
      console.log('💰 Link de pagamento criado:', paymentLink);
      
      // Atualizar o orçamento com o link de pagamento
      console.log('📝 Atualizando orçamento com link:', quote.id, paymentLink.url);
      await updateQuote(quote.id, {
        paymentLink: paymentLink.url
      });

      // Mostrar mensagem de sucesso e abrir o link
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      // Copiar link para a área de transferência
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(paymentLink.url);
      }

      // Configurar dados da notificação
      setPaymentLinkData({
        amount: formatCurrency(quote.finalApprovedAmount),
        customerName: quote.customer.name,
        link: paymentLink.url
      });

      // Mostrar notificação moderna
      setShowPaymentLinkNotification(true);
      setTimeout(() => {
        setShowPaymentLinkNotification(false);
      }, 6000);

      // Abrir o link em nova aba após um pequeno delay
      setTimeout(() => {
        window.open(paymentLink.url, '_blank');
      }, 1000);

    } catch (error) {
      console.error('Erro ao gerar link de pagamento:', error);
      
      let errorMsg = 'Erro ao gerar link de pagamento';
      
      // Tratamento específico para CORS
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMsg = '⚠️ Erro de CORS detectado!\n\nPara resolver este problema:\n1. Configure um backend proxy\n2. Use variáveis de ambiente corretas\n3. Verifique as chaves da API\n\nConsulte a documentação para mais detalhes.';
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage('');
      }, 8000);
    } finally {
      setIsGeneratingPayment(false);
    }
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
                    Orçamento Final Aprovado
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quote.finalApprovedAmount ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-green-600 font-semibold">
                            {formatCurrency(quote.finalApprovedAmount)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Não definido</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quote.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openQuoteDetails(quote)}
                          className="text-[#44A17C] hover:text-[#3a8f6c] flex items-center"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(quote)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="Editar informações comerciais"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleGenerateContract(quote)}
                          className="text-purple-600 hover:text-purple-900 flex items-center"
                          title="Gerar contrato"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            console.log('🔍 Quote clicado:', quote);
                            console.log('🆔 ID do quote:', quote.id);
                            console.log('📊 Tipo do ID:', typeof quote.id);
                            handleGeneratePaymentLink(quote);
                          }}
                          disabled={isGeneratingPayment}
                          className={`flex items-center ${
                            isGeneratingPayment 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-orange-600 hover:text-orange-900'
                          }`}
                          title={isGeneratingPayment ? "Gerando link de pagamento..." : "Gerar link de pagamento"}
                        >
                          {isGeneratingPayment ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Excluir orçamento"
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

      {/* Modal de Edição */}
      {showEditModal && selectedQuote && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Editar Informações Comerciais
                </h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Fechar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações do Cliente (readonly) */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Cliente</h4>
                  <p className="text-sm text-gray-700">
                    <strong>{selectedQuote.customer.name}</strong> - {selectedQuote.customer.email}
                  </p>
                  <p className="text-sm text-gray-700">
                    Total do Orçamento: <strong>{formatCurrency(selectedQuote.totalPrice)}</strong>
                  </p>
                </div>

                {/* Responsável pelo Atendimento */}
                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável pelo Atendimento
                  </label>
                  <input
                    type="text"
                    id="assignedTo"
                    value={editFormData.assignedTo}
                    onChange={(e) => handleEditFormChange('assignedTo', e.target.value)}
                    placeholder="Digite o nome do responsável pelo atendimento"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                  />
                </div>

                {/* Observações Internas */}
                <div>
                  <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Observações Internas
                  </label>
                  <textarea
                    id="internalNotes"
                    rows={4}
                    value={editFormData.internalNotes}
                    onChange={(e) => handleEditFormChange('internalNotes', e.target.value)}
                    placeholder="Adicione observações internas sobre este orçamento..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                  />
                </div>

                {/* Orçamento Final Aprovado */}
                <div>
                  <label htmlFor="finalApprovedAmount" className="block text-sm font-medium text-gray-700 mb-2">
                    Orçamento Final Aprovado
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">R$</span>
                    <input
                      type="number"
                      id="finalApprovedAmount"
                      step="0.01"
                      min="0"
                      value={editFormData.finalApprovedAmount}
                      onChange={(e) => handleEditFormChange('finalApprovedAmount', e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Valor base: {formatCurrency(selectedQuote.totalPrice)}
                  </p>
                </div>

                {/* Forma de Pagamento */}
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de Pagamento
                  </label>
                  <select
                    id="paymentMethod"
                    value={editFormData.paymentMethod}
                    onChange={(e) => handleEditFormChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                  >
                    <option value="">Selecione a forma de pagamento</option>
                    <option value="À vista - PIX">À vista - PIX</option>
                    <option value="À vista - Dinheiro">À vista - Dinheiro</option>
                    <option value="À vista - Cartão de Débito">À vista - Cartão de Débito</option>
                    <option value="Cartão de Crédito - 1x">Cartão de Crédito - 1x</option>
                    <option value="Cartão de Crédito - 2x">Cartão de Crédito - 2x</option>
                    <option value="Cartão de Crédito - 3x">Cartão de Crédito - 3x</option>
                    <option value="Cartão de Crédito - 4x">Cartão de Crédito - 4x</option>
                    <option value="Cartão de Crédito - 5x">Cartão de Crédito - 5x</option>
                    <option value="Cartão de Crédito - 6x">Cartão de Crédito - 6x</option>
                    <option value="Boleto Bancário">Boleto Bancário</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Financiamento">Financiamento</option>
                    <option value="Parcelado - 50% + 50%">Parcelado - 50% + 50%</option>
                    <option value="Parcelado - 30% + 70%">Parcelado - 30% + 70%</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#44A17C] flex items-center ${
                    isSaving 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#44A17C] hover:bg-[#3a8f6c]'
                  }`}
                >
                  {isSaving && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de Sucesso */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center animate-fade-in">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Dados salvos com sucesso!</span>
        </div>
      )}

      {/* Notificação de Link de Pagamento */}
      {showPaymentLinkNotification && (
        <div className="fixed top-4 right-4 max-w-md bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-100" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold">Link de Pagamento Gerado!</h3>
                  <Copy className="w-4 h-4 text-green-200" />
                </div>
                <div className="space-y-2 text-sm text-green-50">
                  <p><span className="font-medium">Cliente:</span> {paymentLinkData.customerName}</p>
                  <p><span className="font-medium">Valor:</span> {paymentLinkData.amount}</p>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Status:</span>
                    <span className="bg-green-400 bg-opacity-50 px-2 py-1 rounded text-xs font-medium">
                      Copiado para área de transferência
                    </span>
                  </div>
                </div>
                <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-100 font-medium">Pronto para enviar!</span>
                    <ExternalLink className="w-4 h-4 text-green-200" />
                  </div>
                  <p className="text-xs text-green-100 mt-1 opacity-90">
                    Cole o link onde desejar para compartilhar
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-green-300 to-emerald-400"></div>
        </div>
      )}

      {/* Mensagem de Erro */}
      {showErrorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center animate-fade-in">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}
    </div>
  );
};