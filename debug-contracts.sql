-- Script para verificar os dados dos contratos no Supabase
-- Execute este comando para verificar se os dados estão sendo salvos corretamente

-- 1. Verificar estrutura da tabela generated_contracts
\d generated_contracts;

-- 2. Verificar dados básicos dos contratos
SELECT 
  id,
  title,
  status,
  created_at,
  updated_at,
  signing_link
FROM generated_contracts 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Verificar se há dados com status nulo ou undefined
SELECT 
  id,
  title,
  CASE 
    WHEN status IS NULL THEN 'NULL'
    WHEN status = '' THEN 'EMPTY'
    ELSE status
  END as status_check,
  created_at,
  updated_at
FROM generated_contracts 
WHERE status IS NULL OR status = '' OR status = 'undefined'
ORDER BY created_at DESC;

-- 4. Contar contratos por status
SELECT 
  COALESCE(status, 'NULL') as status,
  COUNT(*) as count
FROM generated_contracts 
GROUP BY status 
ORDER BY count DESC;
