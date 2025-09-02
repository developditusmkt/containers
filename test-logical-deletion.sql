-- Script para testar a exclusão lógica no Supabase
-- Execute este comando para testar se a exclusão lógica está funcionando

-- 1. Verificar orçamentos antes da exclusão (deve mostrar todos os não-deletados)
SELECT id, status, customer->>'name' as customer_name 
FROM quotes 
WHERE status != 'deleted' 
ORDER BY created_at DESC;

-- 2. Para testar, você pode criar um orçamento temporário e depois "excluí-lo"
-- INSERT INTO quotes (...) VALUES (...) -- (se necessário)

-- 3. Simular exclusão lógica de um orçamento específico
-- UPDATE quotes SET status = 'deleted' WHERE id = 'SEU_ID_AQUI';

-- 4. Verificar se o orçamento "deletado" não aparece mais na listagem
SELECT id, status, customer->>'name' as customer_name 
FROM quotes 
WHERE status != 'deleted' 
ORDER BY created_at DESC;

-- 5. Verificar orçamentos deletados (apenas para confirmar)
SELECT id, status, customer->>'name' as customer_name 
FROM quotes 
WHERE status = 'deleted' 
ORDER BY created_at DESC;
