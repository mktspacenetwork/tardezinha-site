# ⚠️ INSTRUÇÕES CRÍTICAS - RESOLVER ERRO DE SCHEMA CACHE

## O Problema
O erro `Could not find the 'employee_name' column of 'confirmations' in the schema cache` acontece porque o cache do PostgREST (API do Supabase) está desatualizado e não reconhece as colunas da tabela.

## Solução DEFINITIVA

### Passo 1: Acesse o Dashboard do Supabase
1. Abra https://supabase.com/dashboard
2. Selecione seu projeto: **neakoxezndartznfxgry**
3. No menu lateral, clique em **SQL Editor**

### Passo 2: Execute o Script de Reload
1. Abra o arquivo `FORCAR_RELOAD_SCHEMA.sql` aqui no Replit
2. **COPIE TODO o conteúdo** do arquivo
3. **COLE** no SQL Editor do Supabase
4. Clique em **RUN** (ou pressione Ctrl+Enter)

### Passo 3: Aguarde a Confirmação
Você deve ver uma tabela mostrando todas as colunas:
```
column_name         | data_type | is_nullable | column_default
--------------------|-----------|-------------|---------------
id                  | bigint    | NO          | nextval(...)
employee_id         | bigint    | YES         | 
employee_name       | text      | NO          |
employee_rg         | text      | NO          |
department          | text      | NO          |
has_companions      | boolean   | YES         | false
wants_transport     | boolean   | YES         | false
...
```

### Passo 4: Teste a Aplicação
1. Volte para o site
2. Clique em "QUERO PARTICIPAR"
3. Preencha o formulário
4. Deve funcionar SEM ERROS!

## ⚠️ IMPORTANTE
Este script **RECRIA** a tabela `confirmations`, o que significa que **todos os dados existentes serão perdidos**. Como estamos em fase de testes, isso não é problema. Mas se você já tem confirmações reais, me avise ANTES de executar.

## Se Ainda Der Erro
Se mesmo assim o erro persistir, o problema é no servidor do Supabase. Nesse caso:
1. Vá em **Settings** > **API** no Dashboard
2. Clique em "Restart PostgREST server"
3. Aguarde 30 segundos
4. Teste novamente
