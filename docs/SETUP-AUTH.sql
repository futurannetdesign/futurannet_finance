-- ============================================
-- CONFIGURAÇÃO DE AUTENTICAÇÃO NO SUPABASE
-- Execute este script no Supabase SQL Editor
-- ============================================

-- IMPORTANTE: Para desenvolvimento, vamos desabilitar RLS temporariamente
-- Isso permite que o sistema funcione sem problemas de permissão
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 1. Criar função para criar perfil automaticamente quando um usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'viewer' -- Role padrão
  )
  ON CONFLICT (id) DO NOTHING; -- Evita erro se já existir
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Garantir que a tabela profiles existe (Execute database-schema.sql primeiro se ainda não executou)

-- 4. Políticas RLS (serão aplicadas quando habilitar RLS no futuro)
-- Descomente estas linhas quando quiser habilitar RLS para produção:

/*
-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Política para usuários verem seu próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 6. Política para admins verem todos os perfis
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Política para admins atualizarem perfis
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Política para admins inserirem perfis
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 9. Política para admins excluírem perfis
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
*/

-- ============================================
-- VERIFICAÇÃO: Verifique se o perfil admin existe
-- ============================================
-- Execute este SELECT para verificar:
-- SELECT id, email, role FROM public.profiles WHERE email = 'admin@futurannet.com';
--
-- Se não existir ou não for admin, execute:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@futurannet.com';
-- ============================================

