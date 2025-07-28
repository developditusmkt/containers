import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Download, MessageCircle, Mail, Eye, Calculator } from 'lucide-react';
import { CategorySection } from '../components/CategorySection';
import { QuoteModal } from '../components/QuoteModal';
import { useCategories } from '../contexts/CategoryContext';
import { Customer, Item, Quote } from '../types';
import { formatCurrency, generateWhatsAppLink, generateEmailLink } from '../utils/formatters';
import { generateQuotePDF } from '../services/pdfService';
import { fetchCEP } from '../services/cepService';
import { useQuotes } from '../contexts/QuoteContext';
import { applyPhoneMask, applyCepMask, removeMask } from '../utils/maskUtils';

const BASE_PRICE = 30000;
const PURPOSE_OPTIONS = ['Pessoal', 'Comercial', 'Locação para Airbnb'];

export const PublicQuote: React.FC = () => {
  const { addQuote } = useQuotes();
  const { categories } = useCategories();
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressInfo, setAddressInfo] = useState({ city: '', state: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<Customer>();

  const watchedCEP = watch('cep');

  const handleItemToggle = (item: Item) => {
    setSelectedItems(prev => {
      const exists = prev.find(selected => selected.id === item.id);
      if (exists) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleCEPChange = async (cep: string) => {
    if (cep.replace(/\D/g, '').length === 8) {
      const cepData = await fetchCEP(cep);
      if (cepData) {
        const fullAddress = `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}/${cepData.uf}`;
        setValue('address', fullAddress);
        setAddressInfo({ city: cepData.localidade, state: cepData.uf });
      }
    }
  };

  const totalPrice = BASE_PRICE + selectedItems.reduce((sum, item) => sum + item.price, 0);

  const createQuote = (customerData: Customer): Quote => {
    const quote: Quote = {
      id: Date.now().toString(),
      customer: {
        ...customerData,
        city: addressInfo.city,
        state: addressInfo.state,
      },
      selectedItems,
      basePrice: BASE_PRICE,
      totalPrice,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    addQuote(quote);
    return quote;
  };

  const onSubmit = (data: Customer) => {
    const quote = createQuote(data);
    setCurrentQuote(quote);
  };

  const handleDownloadPDF = () => {
    if (currentQuote) {
      generateQuotePDF(currentQuote);
    }
  };

  const handleWhatsApp = () => {
    if (currentQuote) {
      window.open(generateWhatsAppLink(currentQuote), '_blank');
    }
  };

  const handleEmail = () => {
    if (currentQuote) {
      window.open(generateEmailLink(currentQuote), '_blank');
    }
  };

  const handleViewDetails = () => {
    if (currentQuote) {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#a2b2b0] to-[#44A17C]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h1 className="text-4xl font-bold text-[#3e514f] mb-2">
              Calculadora de Preços
            </h1>
            <h2 className="text-2xl text-[#44A17C] mb-4">Alencar Empreendimentos</h2>
            <div className="flex items-center justify-center gap-2 text-lg">
              <Calculator className="text-[#44A17C]" size={24} />
              <span className="text-gray-600">Valor base do container:</span>
              <span className="text-[#44A17C] font-bold text-xl">
                {formatCurrency(BASE_PRICE)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Items Selection */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-6">Selecione os itens desejados:</h3>
            {categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                selectedItems={selectedItems}
                onItemToggle={handleItemToggle}
              />
            ))}
          </div>

          {/* Right Column - Form and Summary */}
          <div className="space-y-6">
            {/* Price Summary - Sticky */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="text-xl font-bold text-[#3e514f] mb-4">Resumo do Orçamento</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Container base:</span>
                  <span className="font-semibold">{formatCurrency(BASE_PRICE)}</span>
                </div>
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span>{item.name}:</span>
                    <span>{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 mb-6">
                <div className="flex justify-between text-xl font-bold text-[#44A17C]">
                  <span>Total:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Customer Form - Now inside the sticky container */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-bold text-[#3e514f] mb-4">Seus Dados</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Nome é obrigatório' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                      placeholder="Digite seu nome completo"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone com DDD *
                    </label>
                    <InputMask
                      mask="(99) 99999-9999"
                      {...register('phone', { required: 'Telefone é obrigatório' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                      placeholder="(11) 99999-9999"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'E-mail é obrigatório',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'E-mail inválido'
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                      placeholder="seu@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP *
                    </label>
                    <InputMask
                      mask="99999-999"
                      {...register('cep', { required: 'CEP é obrigatório' })}
                      onChange={(e) => {
                        const value = e.target.value;
                        setValue('cep', value);
                        handleCEPChange(value);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                      placeholder="00000-000"
                    />
                    {errors.cep && (
                      <p className="text-red-500 text-sm mt-1">{errors.cep.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço da instalação *
                    </label>
                    <input
                      type="text"
                      {...register('address', { required: 'Endereço é obrigatório' })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                      placeholder="Endereço será preenchido automaticamente"
                      readOnly
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data prevista para o projeto *
                    </label>
                    <input
                      type="date"
                      {...register('projectDate', { required: 'Data é obrigatória' })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44A17C] focus:border-[#44A17C]"
                    />
                    {errors.projectDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.projectDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Finalidade de uso do container * (múltipla escolha)
                    </label>
                    <div className="space-y-2">
                      {PURPOSE_OPTIONS.map((purpose) => (
                        <label key={purpose} className="flex items-center">
                          <input
                            type="checkbox"
                            value={purpose}
                            {...register('purpose', { required: 'Selecione pelo menos uma finalidade' })}
                            className="mr-2 w-4 h-4 text-[#44A17C] rounded focus:ring-[#44A17C]"
                          />
                          <span className="text-sm text-gray-700">{purpose}</span>
                        </label>
                      ))}
                    </div>
                    {errors.purpose && (
                      <p className="text-red-500 text-sm mt-1">{errors.purpose.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#44A17C] to-[#3e514f] text-white py-4 rounded-lg hover:from-[#3e514f] hover:to-[#44A17C] transition-all font-semibold text-lg shadow-lg"
                  >
                    Gerar Orçamento
                  </button>
                </form>
              </div>

              {/* Action Buttons - Also inside sticky container */}
              {currentQuote && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-xl font-bold text-[#3e514f] mb-4">Orçamento Gerado!</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleDownloadPDF}
                      className="w-full flex items-center justify-center gap-2 bg-[#44A17C] text-white py-3 rounded-lg hover:bg-[#3e514f] transition-colors"
                    >
                      <Download size={20} />
                      Gerar PDF
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle size={20} />
                      Enviar via WhatsApp
                    </button>
                    <button
                      onClick={handleEmail}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Mail size={20} />
                      Enviar por E-mail
                    </button>
                    <button
                      onClick={handleViewDetails}
                      className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Eye size={20} />
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quote Modal */}
      {currentQuote && (
        <QuoteModal
          quote={currentQuote}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};