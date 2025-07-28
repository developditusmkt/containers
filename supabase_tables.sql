-- SQL para criar tabelas de categorias e itens no Supabase

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de itens
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);

-- Criar tabela de orçamentos
CREATE TABLE IF NOT EXISTS quotes (
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
);

-- Criar índices para a tabela de orçamentos
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_email ON quotes(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir leitura pública para categorias/itens, criação pública para orçamentos)
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write access" ON categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access" ON items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated write access" ON items FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para orçamentos (permitir criação pública, mas visualização/edição apenas para autenticados)
CREATE POLICY "Allow public create quotes" ON quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated read quotes" ON quotes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update quotes" ON quotes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete quotes" ON quotes FOR DELETE USING (auth.role() = 'authenticated');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
