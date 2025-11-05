-- ============================================
-- SCRIPT DEFINITIVO - COPIE E EXECUTE NO SUPABASE
-- Execute TODO este código de uma vez no SQL Editor
-- ============================================

-- Remover tabela se existir (para recriar limpa)
DROP TABLE IF EXISTS public.accounts_payable CASCADE;

-- Criar a tabela accounts_payable
CREATE TABLE public.accounts_payable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  is_recurring BOOLEAN DEFAULT false,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desabilitar RLS completamente
ALTER TABLE public.accounts_payable DISABLE ROW LEVEL SECURITY;

-- Criar função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_accounts_payable_updated_at ON public.accounts_payable;
CREATE TRIGGER update_accounts_payable_updated_at 
  BEFORE UPDATE ON public.accounts_payable
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Verificar se foi criada
SELECT 'Tabela accounts_payable criada com sucesso!' as status, 
       COUNT(*) as total_registros 
FROM public.accounts_payable;

