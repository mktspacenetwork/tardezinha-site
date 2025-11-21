-- =====================================================
-- ADICIONAR UNIQUE CONSTRAINT EM employee_id
-- Execute este script NO DASHBOARD DO SUPABASE (SQL Editor)
-- =====================================================

-- 1. Remover confirmações duplicadas existentes (manter apenas a mais recente)
DELETE FROM public.confirmations a
USING public.confirmations b
WHERE a.employee_id = b.employee_id
  AND a.employee_id IS NOT NULL
  AND a.created_at < b.created_at;

-- 2. Criar índice único em employee_id
CREATE UNIQUE INDEX IF NOT EXISTS confirmations_employee_id_unique 
ON public.confirmations(employee_id)
WHERE employee_id IS NOT NULL;

-- 3. Adicionar constraint única
ALTER TABLE public.confirmations 
DROP CONSTRAINT IF EXISTS confirmations_employee_id_key;

ALTER TABLE public.confirmations 
ADD CONSTRAINT confirmations_employee_id_key 
UNIQUE USING INDEX confirmations_employee_id_unique;

-- 4. Verificar constraint
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  a.attname AS column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.conrelid = 'public.confirmations'::regclass
  AND c.contype = 'u';
