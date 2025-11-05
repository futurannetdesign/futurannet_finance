# 🚨 SOLUÇÃO RÁPIDA: Criar Tabela accounts_receivable

## Erro: "Could not find the table 'public.accounts_receivable' in the schema cache"

A tabela `accounts_receivable` não existe no seu banco de dados Supabase.

## ✅ SOLUÇÃO (3 PASSOS):

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Faça login e selecione seu projeto

### 2. Execute o Script SQL

**No SQL Editor, copie e cole TODO este código:**

```sql
-- Remover tabela se existir
DROP TABLE IF EXISTS public.accounts_receivable CASCADE;

-- Criar a tabela accounts_receivable
CREATE TABLE public.accounts_receivable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desabilitar RLS completamente
ALTER TABLE public.accounts_receivable DISABLE ROW LEVEL SECURITY;

-- Criar função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_accounts_receivable_updated_at ON public.accounts_receivable;
CREATE TRIGGER update_accounts_receivable_updated_at 
  BEFORE UPDATE ON public.accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### 3. Clique em "RUN" (ou Ctrl+Enter)

### 4. Verifique se Funcionou

**No Table Editor do Supabase:**
- Você deve ver a tabela **"accounts_receivable"** listada
- Clique nela para verificar

**Ou execute no SQL Editor:**
```sql
SELECT * FROM public.accounts_receivable;
```

### 5. Teste na Aplicação
- Volte para sua aplicação Angular
- Recarregue a página (F5)
- Tente criar uma nova conta a receber

## ⚠️ IMPORTANTE:

- **Certifique-se de que a tabela `customers` já existe antes de executar este script**
- Se a tabela `customers` não existir, execute primeiro: `docs/CRIAR-TABELA-CUSTOMERS.sql`

## 📝 Arquivo Completo:

Você também pode copiar o conteúdo completo do arquivo `docs/CRIAR-TABELA-ACCOUNTS-RECEIVABLE.sql` e executar no Supabase.

