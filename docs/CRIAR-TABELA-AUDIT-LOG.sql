-- ============================================
-- CRIAR TABELA AUDIT_LOG
-- Execute este script no Supabase SQL Editor
-- ============================================

-- Criar tabela audit_log se não existir
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

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);

-- Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE public.audit_log DISABLE ROW LEVEL SECURITY;

-- Comentários para documentação
COMMENT ON TABLE public.audit_log IS 'Tabela para registro de auditoria de todas as ações no sistema';
COMMENT ON COLUMN public.audit_log.user_id IS 'ID do usuário que executou a ação';
COMMENT ON COLUMN public.audit_log.action IS 'Tipo de ação: CREATE, UPDATE, DELETE, VIEW';
COMMENT ON COLUMN public.audit_log.table_name IS 'Nome da tabela afetada';
COMMENT ON COLUMN public.audit_log.record_id IS 'ID do registro afetado';
COMMENT ON COLUMN public.audit_log.old_data IS 'Dados antes da alteração (JSON)';
COMMENT ON COLUMN public.audit_log.new_data IS 'Dados depois da alteração (JSON)';

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Execute este SELECT para verificar se a tabela foi criada:
-- SELECT * FROM public.audit_log LIMIT 1;
-- ============================================

