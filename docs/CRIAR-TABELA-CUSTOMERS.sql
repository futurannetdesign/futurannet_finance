-- ============================================
-- SCRIPT DEFINITIVO - COPIE E EXECUTE NO SUPABASE
-- Execute TODO este código de uma vez no SQL Editor
-- ============================================

-- PASSO 1: Remover tabela se existir (para recriar limpa)
DROP TABLE IF EXISTS public.customers CASCADE;

-- PASSO 2: Criar a tabela customers
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

-- PASSO 3: Desabilitar RLS completamente
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- PASSO 4: Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 5: Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PASSO 6: Verificar se foi criada
SELECT 'Tabela customers criada com sucesso!' as status, 
       COUNT(*) as total_registros 
FROM public.customers;
