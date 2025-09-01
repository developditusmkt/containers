-- Atualização das tabelas para suportar sistema dual (Venda/Aluguel)

-- Adicionar campo operation_type na tabela categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS operation_type VARCHAR(20) DEFAULT 'venda' NOT NULL;

-- Adicionar campo operation_type na tabela items
ALTER TABLE items ADD COLUMN IF NOT EXISTS operation_type VARCHAR(20) DEFAULT 'venda' NOT NULL;

-- Adicionar campo operation_type na tabela quotes
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS operation_type VARCHAR(20) DEFAULT 'venda' NOT NULL;

-- Criar índices para os novos campos
CREATE INDEX IF NOT EXISTS idx_categories_operation_type ON categories(operation_type);
CREATE INDEX IF NOT EXISTS idx_items_operation_type ON items(operation_type);
CREATE INDEX IF NOT EXISTS idx_quotes_operation_type ON quotes(operation_type);

-- Adicionar restrições para garantir que operation_type seja 'venda' ou 'aluguel'
-- Remover constraints existentes (se houver) e recriar
DO $$ 
BEGIN
    -- Constraint para categories
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'chk_categories_operation_type' 
               AND table_name = 'categories') THEN
        ALTER TABLE categories DROP CONSTRAINT chk_categories_operation_type;
    END IF;
    ALTER TABLE categories ADD CONSTRAINT chk_categories_operation_type 
        CHECK (operation_type IN ('venda', 'aluguel'));
    
    -- Constraint para items
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'chk_items_operation_type' 
               AND table_name = 'items') THEN
        ALTER TABLE items DROP CONSTRAINT chk_items_operation_type;
    END IF;
    ALTER TABLE items ADD CONSTRAINT chk_items_operation_type 
        CHECK (operation_type IN ('venda', 'aluguel'));
    
    -- Constraint para quotes
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'chk_quotes_operation_type' 
               AND table_name = 'quotes') THEN
        ALTER TABLE quotes DROP CONSTRAINT chk_quotes_operation_type;
    END IF;
    ALTER TABLE quotes ADD CONSTRAINT chk_quotes_operation_type 
        CHECK (operation_type IN ('venda', 'aluguel'));
END $$;

-- Atualizar dados existentes (se houver)
UPDATE categories SET operation_type = 'venda' WHERE operation_type IS NULL;
UPDATE items SET operation_type = 'venda' WHERE operation_type IS NULL;
UPDATE quotes SET operation_type = 'venda' WHERE operation_type IS NULL;
