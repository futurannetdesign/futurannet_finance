# 🚨 SOLUÇÃO DEFINITIVA PARA O ERRO

## Erro: "Could not find the table 'public.customers' in the schema cache"

Este erro acontece porque a tabela **não existe** no seu banco de dados Supabase.

## ✅ SOLUÇÃO PASSO A PASSO:

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Faça login
- Selecione seu projeto

### 2. Abra o SQL Editor
- No menu lateral esquerdo, clique em **"SQL Editor"**
- Clique no botão **"New Query"** (ou use o botão "+ New Query")

### 3. Execute o Script Completo

**COPIE TODO O CÓDIGO DO ARQUIVO: `docs/CRIAR-TABELA-CUSTOMERS.sql`**

Ou cole este código diretamente:

```sql
-- Remover tabela se existir
DROP TABLE IF EXISTS public.customers CASCADE;

-- Criar a tabela customers
CREATE TABLE public.customers (
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

-- Desabilitar RLS completamente
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### 4. Execute o Script
- Clique no botão **"RUN"** (ou pressione **Ctrl+Enter**)
- Aguarde a mensagem de sucesso

### 5. Verifique se Funcionou

**Opção A - No SQL Editor:**
Execute esta query para verificar:
```sql
SELECT * FROM public.customers;
```

**Opção B - No Table Editor:**
- No menu lateral, clique em **"Table Editor"**
- Você deve ver a tabela **"customers"** listada
- Clique nela para ver os dados

### 6. Teste na Aplicação
- Volte para sua aplicação Angular
- Recarregue a página (F5)
- Tente criar um novo cliente

## 🔍 Se AINDA não funcionar:

### Verificar se a tabela existe:
Execute no SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'customers';
```

Se retornar vazio, a tabela não foi criada. Execute o script novamente.

### Verificar RLS:
Execute no SQL Editor:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'customers';
```

Se `rowsecurity` for `true`, execute:
```sql
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
```

### Limpar cache do Supabase:
- No Supabase Dashboard, vá em **Settings** → **API**
- Role até o final e clique em **"Clear cache"** ou **"Refresh schema cache"**

## 📝 IMPORTANTE:

- Execute o script **COMPLETO** de uma vez
- Não execute apenas partes do script
- Certifique-se de que não há erros na execução
- Se houver erros, copie a mensagem de erro completa

## 🆘 Ainda com problemas?

Se mesmo após seguir todos os passos ainda não funcionar:
1. Verifique se você está no projeto correto do Supabase
2. Verifique se as credenciais em `src/environments/environment.ts` estão corretas
3. Verifique o console do navegador (F12) para ver erros detalhados

