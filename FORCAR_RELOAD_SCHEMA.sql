-- =====================================================
-- SCRIPT PARA FORÇAR RELOAD DO SCHEMA CACHE NO SUPABASE
-- Execute este script NO DASHBOARD DO SUPABASE (SQL Editor)
-- =====================================================

-- 1. Recriar a tabela confirmations com todas as colunas corretas
DROP TABLE IF EXISTS public.confirmations CASCADE;

CREATE TABLE public.confirmations (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_name TEXT NOT NULL,
  employee_rg TEXT NOT NULL,
  department TEXT NOT NULL,
  has_companions BOOLEAN DEFAULT false,
  wants_transport BOOLEAN DEFAULT false,
  total_adults INTEGER DEFAULT 0,
  total_children INTEGER DEFAULT 0,
  total_daily_passes INTEGER DEFAULT 0,
  total_transport INTEGER DEFAULT 0,
  embarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índice para employee_id
CREATE INDEX idx_confirmations_employee_id ON public.confirmations(employee_id);

-- 3. Desabilitar RLS
ALTER TABLE public.confirmations DISABLE ROW LEVEL SECURITY;

-- 4. Forçar reload do schema no PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- 5. Verificar estrutura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'confirmations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
