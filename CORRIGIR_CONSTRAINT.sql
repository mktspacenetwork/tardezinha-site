-- =====================================================
-- SCRIPT CORRIGIDO: CONSTRAINT ÚNICA EM employee_id
-- Execute este script NO DASHBOARD DO SUPABASE (SQL Editor)
-- =====================================================
-- 
-- Este script corrige o erro "partial index" e garante que:
-- 1. Cada colaborador só pode confirmar presença UMA VEZ
-- 2. Duplicatas antigas são removidas (mantém apenas a mais recente)
-- 3. Sistema de anti-duplicação funciona perfeitamente
-- =====================================================

-- Passo 1: Remover constraint/index anterior (se existir)
DROP INDEX IF EXISTS confirmations_employee_id_unique;
ALTER TABLE public.confirmations DROP CONSTRAINT IF EXISTS confirmations_employee_id_key;

-- Passo 2: Remover confirmações duplicadas (manter apenas a mais recente por employee_id)
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY employee_id 
      ORDER BY created_at DESC, id DESC
    ) as rn
  FROM public.confirmations
  WHERE employee_id IS NOT NULL
)
DELETE FROM public.confirmations
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Passo 3: Criar constraint ÚNICA (NÃO usar índice parcial)
ALTER TABLE public.confirmations 
ADD CONSTRAINT confirmations_employee_id_key 
UNIQUE (employee_id);

-- Passo 4: Verificar se a constraint foi criada corretamente
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  a.attname AS column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
WHERE c.conrelid = 'public.confirmations'::regclass
  AND c.contype = 'u'
  AND c.conname = 'confirmations_employee_id_key';

-- ✅ RESULTADO ESPERADO:
-- constraint_name              | constraint_type | column_name
-- -----------------------------|-----------------|-------------
-- confirmations_employee_id_key| u               | employee_id
--
-- ✅ NOTA: PostgreSQL permite múltiplos valores NULL em colunas UNIQUE,
-- então colaboradores sem employee_id ainda podem ser inseridos.
