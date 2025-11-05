-- ============================================
-- CONFIGURAÇÃO PARA PRODUÇÃO - FUTURANNET FINANCE
-- Execute este script no Supabase SQL Editor ANTES de ir para produção
-- ============================================

-- ⚠️ ATENÇÃO: Este script habilita RLS e políticas de segurança
-- ⚠️ Certifique-se de ter testado em ambiente de staging primeiro
-- ⚠️ Faça backup do banco antes de executar

-- ============================================
-- PARTE 1: Habilitar RLS em todas as tabelas
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 2: Políticas para Profiles
-- ============================================

-- Usuários podem ver seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins podem ver todos os perfis
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins podem atualizar perfis
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins podem inserir perfis
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins podem excluir perfis (exceto o próprio)
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
    AND id != auth.uid()
  );

-- ============================================
-- PARTE 3: Políticas para Customers
-- ============================================

-- Todos os usuários autenticados podem ver clientes
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
CREATE POLICY "Authenticated users can view customers" ON public.customers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin e Manager podem inserir clientes
DROP POLICY IF EXISTS "Admin and Manager can insert customers" ON public.customers;
CREATE POLICY "Admin and Manager can insert customers" ON public.customers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admin e Manager podem atualizar clientes
DROP POLICY IF EXISTS "Admin and Manager can update customers" ON public.customers;
CREATE POLICY "Admin and Manager can update customers" ON public.customers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Apenas Admin pode excluir clientes
DROP POLICY IF EXISTS "Admin can delete customers" ON public.customers;
CREATE POLICY "Admin can delete customers" ON public.customers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PARTE 4: Políticas para Accounts Receivable
-- ============================================

-- Todos os usuários autenticados podem ver contas a receber
DROP POLICY IF EXISTS "Authenticated users can view receivables" ON public.accounts_receivable;
CREATE POLICY "Authenticated users can view receivables" ON public.accounts_receivable
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin e Manager podem inserir contas a receber
DROP POLICY IF EXISTS "Admin and Manager can insert receivables" ON public.accounts_receivable;
CREATE POLICY "Admin and Manager can insert receivables" ON public.accounts_receivable
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admin e Manager podem atualizar contas a receber
DROP POLICY IF EXISTS "Admin and Manager can update receivables" ON public.accounts_receivable;
CREATE POLICY "Admin and Manager can update receivables" ON public.accounts_receivable
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Apenas Admin pode excluir contas a receber
DROP POLICY IF EXISTS "Admin can delete receivables" ON public.accounts_receivable;
CREATE POLICY "Admin can delete receivables" ON public.accounts_receivable
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PARTE 5: Políticas para Accounts Payable
-- ============================================

-- Todos os usuários autenticados podem ver contas a pagar
DROP POLICY IF EXISTS "Authenticated users can view payables" ON public.accounts_payable;
CREATE POLICY "Authenticated users can view payables" ON public.accounts_payable
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin e Manager podem inserir contas a pagar
DROP POLICY IF EXISTS "Admin and Manager can insert payables" ON public.accounts_payable;
CREATE POLICY "Admin and Manager can insert payables" ON public.accounts_payable
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Admin e Manager podem atualizar contas a pagar
DROP POLICY IF EXISTS "Admin and Manager can update payables" ON public.accounts_payable;
CREATE POLICY "Admin and Manager can update payables" ON public.accounts_payable
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Apenas Admin pode excluir contas a pagar
DROP POLICY IF EXISTS "Admin can delete payables" ON public.accounts_payable;
CREATE POLICY "Admin can delete payables" ON public.accounts_payable
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PARTE 6: Políticas para Audit Log
-- ============================================

-- Todos podem inserir logs (para auditoria)
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_log;
CREATE POLICY "Anyone can insert audit logs" ON public.audit_log
  FOR INSERT WITH CHECK (true);

-- Apenas Admin pode ver logs
DROP POLICY IF EXISTS "Admin can view audit logs" ON public.audit_log;
CREATE POLICY "Admin can view audit logs" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ninguém pode atualizar ou excluir logs (imutável)
DROP POLICY IF EXISTS "No one can update audit logs" ON public.audit_log;
CREATE POLICY "No one can update audit logs" ON public.audit_log
  FOR UPDATE USING (false);

DROP POLICY IF EXISTS "No one can delete audit logs" ON public.audit_log;
CREATE POLICY "No one can delete audit logs" ON public.audit_log
  FOR DELETE USING (false);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se RLS está habilitado
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'customers', 'accounts_receivable', 'accounts_payable', 'audit_log')
ORDER BY tablename;

-- Ver todas as políticas criadas
SELECT 
  tablename, 
  policyname, 
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- PRONTO! 
-- ============================================
-- Após executar este script:
-- 1. Teste login com cada tipo de usuário
-- 2. Verifique se todas as funcionalidades funcionam
-- 3. Monitore logs de erro no Supabase
-- ============================================

