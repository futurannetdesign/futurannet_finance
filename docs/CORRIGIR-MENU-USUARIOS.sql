-- ============================================
-- SCRIPT RÁPIDO PARA CORRIGIR O PROBLEMA DO MENU USUÁRIOS
-- Execute este script no Supabase SQL Editor
-- ============================================

-- 1. Desabilitar RLS temporariamente (para desenvolvimento)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se o perfil admin existe e está correto
SELECT id, email, role 
FROM public.profiles 
WHERE email = 'admin@futurannet.com';

-- 3. Se o perfil existir mas não for admin, atualizar:
UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'admin@futurannet.com';

-- 4. Verificar novamente
SELECT id, email, role 
FROM public.profiles 
WHERE email = 'admin@futurannet.com';
-- Deve mostrar: role = 'admin'

-- ============================================
-- APÓS EXECUTAR ESTE SCRIPT:
-- 1. Faça logout na aplicação
-- 2. Faça login novamente
-- 3. O menu "Usuários" deve aparecer
-- ============================================

