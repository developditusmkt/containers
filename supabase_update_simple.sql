-- Versão simples da atualização (sem constraints CHECK)

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

-- Atualizar dados existentes (se houver)
UPDATE categories SET operation_type = 'venda' WHERE operation_type IS NULL;
UPDATE items SET operation_type = 'venda' WHERE operation_type IS NULL;
UPDATE quotes SET operation_type = 'venda' WHERE operation_type IS NULL;
