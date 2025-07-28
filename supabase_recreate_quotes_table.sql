-- Script alternativo: Recriar a tabela quotes completamente
-- ATENÇÃO: Este script apaga todos os dados existentes!
-- Use apenas se não houver dados importantes na tabela

-- Fazer backup dos dados existentes (opcional)
-- CREATE TABLE quotes_backup AS SELECT * FROM quotes;

-- Apagar a tabela existente
DROP TABLE IF EXISTS quotes CASCADE;

-- Recriar a tabela com a estrutura correta
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_cep VARCHAR(10) NOT NULL,
  customer_city VARCHAR(255) NOT NULL,
  customer_state VARCHAR(100) NOT NULL,
  customer_project_date DATE NOT NULL,
  customer_purpose TEXT[] NOT NULL,
  selected_items JSONB NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'new' NOT NULL,
  assigned_to VARCHAR(255),
  internal_notes TEXT,
  final_approved_amount DECIMAL(10,2),
  contract_link TEXT,
  payment_method VARCHAR(100),
  payment_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_customer_email ON quotes(customer_email);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura/escrita para usuários autenticados
CREATE POLICY "Allow all operations for authenticated users" ON quotes
FOR ALL USING (true);

-- Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
ORDER BY ordinal_position;
