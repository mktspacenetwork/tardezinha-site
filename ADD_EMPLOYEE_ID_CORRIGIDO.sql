-- Script CORRIGIDO para adicionar campo employee_id na tabela confirmations
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Adicionar coluna employee_id (pode ser NULL inicialmente)
ALTER TABLE public.confirmations 
ADD COLUMN IF NOT EXISTS employee_id BIGINT;

-- 2. Criar foreign key para employees
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_confirmations_employee'
    ) THEN
        ALTER TABLE public.confirmations
        ADD CONSTRAINT fk_confirmations_employee
        FOREIGN KEY (employee_id) 
        REFERENCES public.employees(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Criar índice para melhorar performance de busca
CREATE INDEX IF NOT EXISTS idx_confirmations_employee_id 
ON public.confirmations(employee_id);

-- Pronto! A partir de agora, todas as novas confirmações incluirão o employee_id automaticamente.
