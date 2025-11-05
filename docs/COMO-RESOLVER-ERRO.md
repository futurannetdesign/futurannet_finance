# INSTRUÇÕES RÁPIDAS PARA RESOLVER O ERRO

## Erro: "Could not find the table 'public.customers'"

### SOLUÇÃO RÁPIDA (3 PASSOS):

1. **Abra o Supabase Dashboard**
   - Acesse: https://supabase.com/dashboard
   - Entre no seu projeto

2. **Vá para SQL Editor**
   - No menu lateral esquerdo, clique em "SQL Editor"
   - Clique no botão "New Query"

3. **Cole e Execute este Script:**

```sql
-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  document TEXT,
  address TEXT,
  plan_value DECIMAL(10, 2) NOT NULL,
  plan_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desabilitar RLS temporariamente
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
```

4. **Clique em "RUN" ou pressione Ctrl+Enter**

5. **Verifique se funcionou:**
   - No menu lateral, clique em "Table Editor"
   - Você deve ver a tabela "customers" listada
   - Se quiser, pode inserir dados de teste manualmente

6. **Recarregue a aplicação Angular**
   - Volte para sua aplicação Angular
   - Recarregue a página (F5)
   - O botão "Novo Cliente" deve aparecer agora

### Se ainda não funcionar:

Execute também este comando no SQL Editor:

```sql
-- Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'customers';
```

Se não retornar nada, a tabela não foi criada. Execute o script novamente.

### Arquivo com Script Completo:

Você também pode copiar o conteúdo completo do arquivo `docs/SCRIPT-RAPIDO.sql` e executar no Supabase.

