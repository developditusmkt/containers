import { Quote } from '../types';
import { DatabaseQuote, databaseToQuote } from './quoteService';
import { supabase } from '../lib/supabase';

// Função simplificada para teste
export const updateQuoteSimple = async (id: string, updates: Partial<Quote>): Promise<Quote> => {
  console.log('🔧 TESTE: Atualizando orçamento ID:', id);
  console.log('🔧 TESTE: Updates:', updates);
  
  // Converter updates para formato do banco
  const dbUpdates: Partial<DatabaseQuote> = {};
  
  if (updates.paymentLink !== undefined) {
    dbUpdates.payment_link = updates.paymentLink;
  }
  
  console.log('🔧 TESTE: DB Updates:', dbUpdates);

  // Fazer update simples sem select
  const { error: updateError } = await supabase
    .from('quotes')
    .update(dbUpdates)
    .eq('id', id);

  if (updateError) {
    console.error('❌ TESTE: Erro no update:', updateError);
    throw new Error(`Erro ao atualizar orçamento: ${updateError.message}`);
  }

  console.log('✅ TESTE: Update executado com sucesso');

  // Buscar o registro atualizado
  const { data: updatedData, error: selectError } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single();

  if (selectError || !updatedData) {
    console.error('❌ TESTE: Erro ao buscar registro:', selectError);
    throw new Error(`Erro ao buscar orçamento atualizado: ${selectError?.message || 'Não encontrado'}`);
  }

  console.log('✅ TESTE: Registro encontrado:', updatedData.id);
  return databaseToQuote(updatedData);
};
