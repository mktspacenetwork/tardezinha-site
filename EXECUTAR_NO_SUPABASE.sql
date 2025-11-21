-- =====================================================
-- AÇÃO NECESSÁRIA: Execute este script NO DASHBOARD DO SUPABASE
-- =====================================================
-- 
-- IMPORTANTE: Este script é obrigatório para ativar o sistema
-- de anti-duplicação. Sem ele, colaboradores poderão confirmar
-- múltiplas vezes.
--
-- Como executar:
-- 1. Acesse https://supabase.com/dashboard
-- 2. Selecione seu projeto: neakoxezndartznfxgry
-- 3. No menu lateral, clique em "SQL Editor"
-- 4. Cole TODO este script
-- 5. Clique em "RUN" (ou Ctrl+Enter)
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

-- 4. Verificar constraint (deve retornar uma linha com o constraint criado)
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  a.attname AS column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.conrelid = 'public.confirmations'::regclass
  AND c.contype = 'u';

-- ✅ RESULTADO ESPERADO:
-- constraint_name              | constraint_type | column_name
-- -----------------------------|-----------------|-------------
-- confirmations_employee_id_key| u               | employee_id
