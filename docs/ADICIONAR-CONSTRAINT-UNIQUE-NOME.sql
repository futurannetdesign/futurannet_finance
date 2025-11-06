-- ============================================
-- SCRIPT PARA ADICIONAR CONSTRAINT UNIQUE NO NOME
-- Execute este código no SQL Editor do Supabase
-- ============================================

-- Criar índice único case-insensitive no nome
-- Isso garante que não haverá duplicatas mesmo se a validação do frontend falhar

-- Primeiro, remover duplicatas existentes (manter apenas o mais antigo)
WITH ranked_customers AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(name)) 
      ORDER BY created_at ASC
    ) as rn
  FROM customers
)
DELETE FROM customers
WHERE id IN (
  SELECT id FROM ranked_customers WHERE rn > 1
);

-- Criar índice único case-insensitive
-- Usando expressão para normalizar o nome (trim + lowercase)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_name_unique 
ON customers (LOWER(TRIM(name)));

-- Verificar se foi criado
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'customers' 
AND indexname = 'idx_customers_name_unique';

