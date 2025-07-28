-- Script para atualizar a tabela quotes se ela já existir
-- Execute este script no SQL Editor do Supabase se a tabela já foi criada

-- Verificar se a coluna customer_project_date existe, se não, adicioná-la
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'customer_project_date'
    ) THEN
        ALTER TABLE quotes ADD COLUMN customer_project_date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Verificar se a coluna customer_purpose existe, se não, adicioná-la
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'customer_purpose'
    ) THEN
        ALTER TABLE quotes ADD COLUMN customer_purpose TEXT[] NOT NULL DEFAULT '{}';
    END IF;
END $$;

-- Verificar se outras colunas necessárias existem
DO $$
BEGIN
    -- selected_items
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'selected_items'
    ) THEN
        ALTER TABLE quotes ADD COLUMN selected_items JSONB NOT NULL DEFAULT '[]';
    END IF;

    -- base_price
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'base_price'
    ) THEN
        ALTER TABLE quotes ADD COLUMN base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00;
    END IF;

    -- total_price
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'total_price'
    ) THEN
        ALTER TABLE quotes ADD COLUMN total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00;
    END IF;

    -- assigned_to
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'assigned_to'
    ) THEN
        ALTER TABLE quotes ADD COLUMN assigned_to VARCHAR(255);
    END IF;

    -- internal_notes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'internal_notes'
    ) THEN
        ALTER TABLE quotes ADD COLUMN internal_notes TEXT;
    END IF;

    -- final_approved_amount
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'final_approved_amount'
    ) THEN
        ALTER TABLE quotes ADD COLUMN final_approved_amount DECIMAL(10,2);
    END IF;

    -- contract_link
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'contract_link'
    ) THEN
        ALTER TABLE quotes ADD COLUMN contract_link TEXT;
    END IF;

    -- payment_method
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE quotes ADD COLUMN payment_method VARCHAR(100);
    END IF;

    -- payment_link
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' 
        AND column_name = 'payment_link'
    ) THEN
        ALTER TABLE quotes ADD COLUMN payment_link TEXT;
    END IF;
END $$;

-- Atualizar a coluna status se necessário para usar o valor padrão correto
UPDATE quotes SET status = 'new' WHERE status IS NULL OR status = '';

-- Criar índices para melhor performance se não existirem
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_email ON quotes(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);

-- Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
ORDER BY ordinal_position;
