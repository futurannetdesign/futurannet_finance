-- ============================================
-- DESABILITAR RLS TEMPORARIAMENTE
-- Use este script se ainda tiver problemas de acesso
-- Execute no Supabase SQL Editor
-- ============================================

-- Desabilitar RLS temporariamente (APENAS PARA DESENVOLVIMENTO)
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log DISABLE ROW LEVEL SECURITY;

-- ATENÇÃO: Reabilite o RLS quando implementar autenticação!
