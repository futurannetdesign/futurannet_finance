-- ============================================
-- SCRIPT DEFINITIVO - COPIE E EXECUTE NO SUPABASE
-- Execute TODO este código de uma vez no SQL Editor
-- IMPORTANTE: Certifique-se de que a tabela customers já existe!
-- ============================================

-- Remover tabela se existir (para recriar limpa)
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

-- Verificar se foi criada
SELECT 'Tabela accounts_receivable criada com sucesso!' as status, 
       COUNT(*) as total_registros 
FROM public.accounts_receivable;
