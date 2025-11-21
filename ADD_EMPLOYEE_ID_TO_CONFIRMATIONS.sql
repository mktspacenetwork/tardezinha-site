-- Script para adicionar campo employee_id na tabela confirmations
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Adicionar coluna employee_id (pode ser NULL inicialmente para confirmações antigas)
ALTER TABLE public.confirmations 
ADD COLUMN IF NOT EXISTS employee_id BIGINT;

-- 2. Criar foreign key para employees
ALTER TABLE public.confirmations
ADD CONSTRAINT fk_confirmations_employee
FOREIGN KEY (employee_id) 
REFERENCES public.employees(id)
ON DELETE SET NULL;

-- 3. Criar índice para melhorar performance de busca
CREATE INDEX IF NOT EXISTS idx_confirmations_employee_id 
ON public.confirmations(employee_id);

-- 4. Atualizar confirmações existentes com employee_id baseado no nome
-- (opcional - se houver confirmações antigas sem employee_id)
UPDATE public.confirmations c
SET employee_id = e.id
FROM public.employees e
WHERE c.employee_name = e.name
AND c.employee_id IS NULL;
