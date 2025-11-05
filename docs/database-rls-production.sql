-- ============================================
-- POLÍTICAS RLS PARA PRODUÇÃO
-- Execute este script após implementar autenticação
-- ============================================

-- Primeiro, remova as políticas de desenvolvimento
DROP POLICY IF EXISTS "Public access for development" ON public.customers;
DROP POLICY IF EXISTS "Public access for development" ON public.profiles;
DROP POLICY IF EXISTS "Public access for development" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Public access for development" ON public.accounts_payable;
DROP POLICY IF EXISTS "Public access for development" ON public.audit_log;

-- Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para produção

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- CUSTOMERS
-- Admin pode tudo
CREATE POLICY "Admin full access customers" ON public.customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Manager pode CRUD
CREATE POLICY "Manager CRUD access customers" ON public.customers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Viewer pode ler
CREATE POLICY "Viewer read access customers" ON public.customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'viewer'))
  );

-- ACCOUNTS_RECEIVABLE
CREATE POLICY "Admin full access receivables" ON public.accounts_receivable
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Manager CRUD access receivables" ON public.accounts_receivable
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Viewer read access receivables" ON public.accounts_receivable
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'viewer'))
  );

-- ACCOUNTS_PAYABLE
CREATE POLICY "Admin full access payables" ON public.accounts_payable
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Manager CRUD access payables" ON public.accounts_payable
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY "Viewer read access payables" ON public.accounts_payable
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'viewer'))
  );

-- AUDIT_LOG
CREATE POLICY "All authenticated users can view audit log" ON public.audit_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can insert audit log" ON public.audit_log
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

