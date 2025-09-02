import { supabase } from '../lib/supabase';
import { Quote } from '../types';

// Interface para representar o formato do banco de dados
export interface DatabaseQuote {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  customer_cep: string;
  customer_city: string;
  customer_state: string;
  customer_project_date: string;
  customer_purpose: string[];
  selected_items: any;
  base_price: number;
  total_price: number;
  operation_type: string;
  status: string;
  created_at: string;
  assigned_to: string | null;
  internal_notes: string | null;
  final_approved_amount: number | null;
  contract_link: string | null;
  payment_method: string | null;
  payment_link: string | null;
}

// Converter Quote para formato do banco de dados
const quoteToDatabase = (quote: Quote): Omit<DatabaseQuote, 'id' | 'created_at'> => ({
  customer_name: quote.customer.name,
  customer_email: quote.customer.email,
  customer_phone: quote.customer.phone,
  customer_address: quote.customer.address,
  customer_cep: quote.customer.cep,
  customer_city: quote.customer.city,
  customer_state: quote.customer.state,
  customer_project_date: quote.customer.projectDate,
  customer_purpose: quote.customer.purpose,
  selected_items: quote.selectedItems,
  base_price: quote.basePrice,
  total_price: quote.totalPrice,
  operation_type: quote.operationType,
  status: quote.status,
  assigned_to: quote.assignedTo || null,
  internal_notes: quote.internalNotes || null,
  final_approved_amount: quote.finalApprovedAmount || null,
  contract_link: quote.contractLink || null,
  payment_method: quote.paymentMethod || null,
  payment_link: quote.paymentLink || null,
});

// Converter formato do banco de dados para Quote
export const databaseToQuote = (dbQuote: DatabaseQuote): Quote => ({
  id: dbQuote.id,
  customer: {
    name: dbQuote.customer_name,
    email: dbQuote.customer_email,
    phone: dbQuote.customer_phone,
    address: dbQuote.customer_address,
    cep: dbQuote.customer_cep,
    city: dbQuote.customer_city,
    state: dbQuote.customer_state,
    projectDate: dbQuote.customer_project_date,
    purpose: dbQuote.customer_purpose,
  },
  selectedItems: dbQuote.selected_items,
  basePrice: dbQuote.base_price,
  totalPrice: dbQuote.total_price,
  operationType: dbQuote.operation_type as 'venda' | 'aluguel',
  status: dbQuote.status as Quote['status'],
  createdAt: dbQuote.created_at,
  assignedTo: dbQuote.assigned_to || undefined,
  internalNotes: dbQuote.internal_notes || undefined,
  finalApprovedAmount: dbQuote.final_approved_amount || undefined,
  contractLink: dbQuote.contract_link || undefined,
  paymentMethod: dbQuote.payment_method || undefined,
  paymentLink: dbQuote.payment_link || undefined,
});

// Criar um novo orçamento
export const createQuote = async (quote: Omit<Quote, 'id' | 'createdAt'>): Promise<Quote> => {
  const dbQuote = quoteToDatabase(quote as Quote);
  
  const { data, error } = await supabase
    .from('quotes')
    .insert(dbQuote)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar orçamento: ${error.message}`);
  }

  return databaseToQuote(data);
};

// Buscar todos os orçamentos (excluindo os deletados)
export const getAllQuotes = async (): Promise<Quote[]> => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar orçamentos: ${error.message}`);
  }

  return data.map(databaseToQuote);
};

// Buscar orçamento por ID
export const getQuoteById = async (id: string): Promise<Quote | null> => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Não encontrado
    }
    throw new Error(`Erro ao buscar orçamento: ${error.message}`);
  }

  return databaseToQuote(data);
};

// Atualizar orçamento
export const updateQuote = async (id: string, updates: Partial<Quote>): Promise<Quote> => {
  const dbUpdates: Partial<DatabaseQuote> = {};
  
  if (updates.customer) {
    if (updates.customer.name !== undefined) dbUpdates.customer_name = updates.customer.name;
    if (updates.customer.email !== undefined) dbUpdates.customer_email = updates.customer.email;
    if (updates.customer.phone !== undefined) dbUpdates.customer_phone = updates.customer.phone;
    if (updates.customer.address !== undefined) dbUpdates.customer_address = updates.customer.address;
    if (updates.customer.cep !== undefined) dbUpdates.customer_cep = updates.customer.cep;
    if (updates.customer.city !== undefined) dbUpdates.customer_city = updates.customer.city;
    if (updates.customer.state !== undefined) dbUpdates.customer_state = updates.customer.state;
    if (updates.customer.projectDate !== undefined) dbUpdates.customer_project_date = updates.customer.projectDate;
    if (updates.customer.purpose !== undefined) dbUpdates.customer_purpose = updates.customer.purpose;
  }
  
  if (updates.selectedItems !== undefined) dbUpdates.selected_items = updates.selectedItems;
  if (updates.basePrice !== undefined) dbUpdates.base_price = updates.basePrice;
  if (updates.totalPrice !== undefined) dbUpdates.total_price = updates.totalPrice;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
  if (updates.internalNotes !== undefined) dbUpdates.internal_notes = updates.internalNotes;
  if (updates.finalApprovedAmount !== undefined) dbUpdates.final_approved_amount = updates.finalApprovedAmount;
  if (updates.contractLink !== undefined) dbUpdates.contract_link = updates.contractLink;
  if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
  if (updates.paymentLink !== undefined) dbUpdates.payment_link = updates.paymentLink;

  console.log('🔍 Atualizando orçamento:', { id, dbUpdates });

  // Primeiro, vamos verificar se o orçamento existe
  const { data: existingQuote, error: checkError } = await supabase
    .from('quotes')
    .select('id, customer_name')
    .eq('id', id)
    .single();
  
  console.log('� Verificação inicial do orçamento:', { existingQuote, checkError });
  
  if (checkError || !existingQuote) {
    throw new Error(`Orçamento com ID ${id} não foi encontrado na base de dados. Erro: ${checkError?.message || 'Não encontrado'}`);
  }

  // Agora fazemos o update
  const { data, error } = await supabase
    .from('quotes')
    .update(dbUpdates)
    .eq('id', id)
    .select();

  console.log('� Resultado da atualização:', { data, error, affectedRows: data?.length });

  if (error) {
    console.error('❌ Erro no Supabase:', error);
    throw new Error(`Erro ao atualizar orçamento: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ Update retornou array vazio, buscando registro diretamente...');
    
    // Buscar o registro para verificar se existe e se foi atualizado
    const { data: currentData, error: fetchError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !currentData) {
      throw new Error(`Orçamento não encontrado após update. ID: ${id}`);
    }
    
    console.log('✅ Registro encontrado, usando dados atuais:', currentData.id);
    return databaseToQuote(currentData);
  }

  // Pega o primeiro resultado se houver múltiplos
  const updatedQuote = Array.isArray(data) ? data[0] : data;
  console.log('✅ Orçamento atualizado com sucesso:', updatedQuote);
  return databaseToQuote(updatedQuote);
};

// Deletar orçamento (exclusão lógica)
export const deleteQuote = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('quotes')
    .update({ status: 'deleted' })
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao excluir orçamento: ${error.message}`);
  }
};

// Buscar orçamentos por status
export const getQuotesByStatus = async (status: Quote['status']): Promise<Quote[]> => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar orçamentos por status: ${error.message}`);
  }

  return data.map(databaseToQuote);
};
