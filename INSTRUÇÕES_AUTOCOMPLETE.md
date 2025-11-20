# 🔧 Instruções para Ativar o Autocomplete

## Por que preciso fazer isso?

O autocomplete não está funcionando porque a tabela `employees` com os 156 colaboradores está apenas no banco de dados LOCAL do Replit, mas sua aplicação está conectada ao Supabase REMOTO.

## Passo a Passo (5 minutos)

### 1. Acesse o Dashboard do Supabase
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto: **neakoxezndartznfxgry**

### 2. Abra o SQL Editor
- No menu lateral esquerdo, clique em **SQL Editor**
- Clique em **+ New query**

### 3. Execute o Script
- Abra o arquivo `SETUP_SUPABASE.sql` que está na raiz deste projeto
- **Copie TODO o conteúdo** do arquivo
- **Cole** no editor SQL do Supabase
- Clique no botão **Run** (ou pressione Ctrl+Enter)

### 4. Aguarde a Confirmação
Você deve ver uma mensagem de sucesso:
```
Success. No rows returned
```

Isso significa que:
- ✅ Tabela `employees` foi criada
- ✅ 156 colaboradores foram inseridos
- ✅ Permissões de leitura pública foram configuradas

### 5. Teste o Autocomplete
- Volte para sua aplicação
- Recarregue a página (F5)
- Clique em "QUERO PARTICIPAR!"
- Digite alguns caracteres no campo "Nome do Colaborador"
- **As sugestões devem aparecer!** 🎉

## Problemas?

Se após executar o script o autocomplete ainda não funcionar:
1. Certifique-se de que executou o script no projeto correto (neakoxezndartznfxgry)
2. Aguarde 30 segundos e recarregue a página
3. Verifique se não há erros no console do navegador (F12 → Console)

## O que o script faz?

```sql
1. Cria a tabela employees com 5 colunas (id, name, department, role, created_at)
2. Insere todos os 156 colaboradores
3. Ativa Row Level Security (RLS)
4. Cria política de leitura pública
5. Garante permissões ao role 'anon'
```

Após executar este script uma única vez, o autocomplete funcionará permanentemente! 🚀
