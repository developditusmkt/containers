# 🚀 Atualização do Sistema Dual - Banco de Dados

## ❗ AÇÃO NECESSÁRIA - Atualizar Banco de Dados

Para que o sistema de **Aluguel/Compra** funcione corretamente na área admin, você precisa executar a atualização do banco de dados no Supabase.

### 📋 Passos para Atualização:

1. **Acesse o Supabase Dashboard**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Entre no seu projeto

2. **Execute o Script SQL**
   - Vá para a seção **SQL Editor** no painel lateral
   - Copie e execute o conteúdo do arquivo `supabase_update_operation_type.sql`
   - Ou execute os comandos abaixo:

```sql
-- Adicionar campo operation_type nas tabelas
ALTER TABLE categories ADD COLUMN IF NOT EXISTS operation_type VARCHAR(20) DEFAULT 'venda' NOT NULL;
ALTER TABLE items ADD COLUMN IF NOT EXISTS operation_type VARCHAR(20) DEFAULT 'venda' NOT NULL;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS operation_type VARCHAR(20) DEFAULT 'venda' NOT NULL;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_categories_operation_type ON categories(operation_type);
CREATE INDEX IF NOT EXISTS idx_items_operation_type ON items(operation_type);
CREATE INDEX IF NOT EXISTS idx_quotes_operation_type ON quotes(operation_type);

-- Adicionar restrições
ALTER TABLE categories ADD CONSTRAINT IF NOT EXISTS chk_categories_operation_type 
  CHECK (operation_type IN ('venda', 'aluguel'));
ALTER TABLE items ADD CONSTRAINT IF NOT EXISTS chk_items_operation_type 
  CHECK (operation_type IN ('venda', 'aluguel'));
ALTER TABLE quotes ADD CONSTRAINT IF NOT EXISTS chk_quotes_operation_type 
  CHECK (operation_type IN ('venda', 'aluguel'));
```

3. **Verificar se funcionou**
   - Após executar os comandos, teste criando uma nova categoria no admin
   - Altere entre os modos "Venda" e "Aluguel" e verifique se as categorias aparecem separadamente

### 🔧 O que foi Corrigido:

- ✅ **CategoryContext**: Atualizado para usar operationType nos serviços
- ✅ **CategoryService**: Incluído operation_type em todas as operações CRUD
- ✅ **QuoteService**: Atualizado para suportar operation_type
- ✅ **Calculadora Pública**: Implementado toggle Aluguel/Compra
- ✅ **Estrutura do Banco**: Script SQL criado para adicionar campos necessários

### 📱 Funcionalidades Implementadas:

1. **Admin Dashboard**:
   - Toggle entre Venda/Aluguel
   - Categorias e itens separados por tipo de operação
   - Persistência no banco de dados com operation_type

2. **Calculadora Pública**:
   - Seletor Aluguel/Compra no topo
   - Filtragem automática de categorias/itens por tipo
   - Orçamentos salvos com operationType correto

### ⚠️ Importante:

- **Execute o script SQL ANTES** de testar o sistema
- Dados existentes serão marcados como 'venda' por padrão
- O sistema funcionará mesmo sem a atualização, mas não persistirá corretamente

---
**Status**: ✅ Código atualizado | 🔄 Pendente: Atualização do banco de dados
