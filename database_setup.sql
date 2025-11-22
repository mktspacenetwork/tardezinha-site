-- Script para criar a tabela companions e a função upsert_companions no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase

-- 1. Criar a tabela companions
CREATE TABLE IF NOT EXISTS companions (
  id BIGSERIAL PRIMARY KEY,
  confirmation_id BIGINT REFERENCES confirmations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  document TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('adult', 'child')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_companions_confirmation_id ON companions(confirmation_id);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE companions ENABLE ROW LEVEL SECURITY;

-- 4. Criar política para permitir leitura pública
CREATE POLICY "Enable read access for all users" ON companions
  FOR SELECT USING (true);

-- 5. Criar política para permitir inserção pública
CREATE POLICY "Enable insert for all users" ON companions
  FOR INSERT WITH CHECK (true);

-- 6. Criar política para permitir atualização pública
CREATE POLICY "Enable update for all users" ON companions
  FOR UPDATE USING (true);

-- 7. Criar política para permitir exclusão pública
CREATE POLICY "Enable delete for all users" ON companions
  FOR DELETE USING (true);

-- 8. Criar a função RPC upsert_companions
CREATE OR REPLACE FUNCTION upsert_companions(
  companions_json JSONB,
  conf_id BIGINT
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Deletar todos os companions existentes desta confirmação
  DELETE FROM companions WHERE confirmation_id = conf_id;
  
  -- Inserir os novos companions
  INSERT INTO companions (confirmation_id, name, age, document, type)
  SELECT 
    conf_id,
    (value->>'name')::TEXT,
    (value->>'age')::INTEGER,
    (value->>'document')::TEXT,
    (value->>'type')::TEXT
  FROM jsonb_array_elements(companions_json);
END;
$$;
