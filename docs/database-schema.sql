-- ============================================
-- SCRIPT COMPLETO DE CRIAÇÃO DO BANCO DE DADOS
-- Futurannet Finance - Sistema de Contas
-- Execute este script no Supabase SQL Editor
-- ============================================

-- 1. Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de clientes
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

-- 3. Tabela de contas a receber
CREATE TABLE IF NOT EXISTS public.accounts_receivable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de contas a pagar
CREATE TABLE IF NOT EXISTS public.accounts_payable (
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

-- 5. Tabela de auditoria
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Views para status calculado
CREATE OR REPLACE VIEW public.receivables_with_status AS
SELECT 
  ar.*,
  CASE 
    WHEN ar.paid_date IS NOT NULL THEN 'verde'
    WHEN ar.due_date < CURRENT_DATE THEN 'vermelho'
    WHEN ar.due_date <= CURRENT_DATE + INTERVAL '5 days' THEN 'amarelo'
    ELSE 'verde'
  END as status
FROM public.accounts_receivable ar;

CREATE OR REPLACE VIEW public.payables_with_status AS
SELECT 
  ap.*,
  CASE 
    WHEN ap.paid_date IS NOT NULL THEN 'verde'
    WHEN ap.due_date < CURRENT_DATE THEN 'vermelho'
    WHEN ap.due_date <= CURRENT_DATE + INTERVAL '5 days' THEN 'amarelo'
    ELSE 'verde'
  END as status
FROM public.accounts_payable ap;

-- 7. Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_receivable_updated_at ON public.accounts_receivable;
CREATE TRIGGER update_accounts_receivable_updated_at 
  BEFORE UPDATE ON public.accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_payable_updated_at ON public.accounts_payable;
CREATE TRIGGER update_accounts_payable_updated_at 
  BEFORE UPDATE ON public.accounts_payable
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. RLS (Row Level Security) - CONFIGURAÇÃO PARA DESENVOLVIMENTO
-- ATENÇÃO: Para produção, ajuste as políticas conforme necessário

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admin full access" ON public.customers;
DROP POLICY IF EXISTS "Manager CRUD access" ON public.customers;
DROP POLICY IF EXISTS "Viewer read access" ON public.customers;
DROP POLICY IF EXISTS "Public access for development" ON public.customers;
DROP POLICY IF EXISTS "Public access for development" ON public.profiles;
DROP POLICY IF EXISTS "Public access for development" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Public access for development" ON public.accounts_payable;

-- Políticas RLS para desenvolvimento (permitem acesso público temporariamente)
-- IMPORTANTE: Remova ou ajuste estas políticas para produção!

-- Política temporária: permite acesso público completo para desenvolvimento
CREATE POLICY "Public access for development" ON public.customers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public access for development" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public access for development" ON public.accounts_receivable
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public access for development" ON public.accounts_payable
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public access for development" ON public.audit_log
  FOR ALL USING (true) WITH CHECK (true);

