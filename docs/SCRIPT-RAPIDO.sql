-- SCRIPT SIMPLIFICADO - COPIE E COLE NO SUPABASE SQL EDITOR
-- Execute este script COMPLETO de uma vez

-- 1. Criar tabela de clientes
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

-- 2. Desabilitar RLS temporariamente (para desenvolvimento)
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se a tabela foi criada
SELECT 'Tabela customers criada com sucesso!' as status;

-- 4. (OPCIONAL) Inserir dados de teste
INSERT INTO public.customers (name, email, phone, plan_value, plan_description, is_active) VALUES
  ('João Silva', 'joao@email.com', '(11) 99999-9999', 99.90, 'Plano 100MB', true),
  ('Maria Santos', 'maria@email.com', '(11) 88888-8888', 149.90, 'Plano 200MB', true)
ON CONFLICT DO NOTHING;

-- 5. Verificar os dados inseridos
SELECT * FROM public.customers;

