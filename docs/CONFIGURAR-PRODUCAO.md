# Configuração para Produção - Futurannet Finance

Este guia explica como configurar o sistema para produção com segurança adequada.

## ⚠️ IMPORTANTE: Diferenças entre Desenvolvimento e Produção

### Desenvolvimento
- RLS desabilitado para facilitar testes
- Acesso completo sem restrições
- Políticas de segurança comentadas

### Produção
- RLS habilitado em todas as tabelas
- Políticas de segurança ativas
- Controle de acesso baseado em roles
- Auditoria de ações

## Passo 1: Preparar o Script de Produção

Execute o script `docs/SETUP-AUTH-PRODUCTION.sql` no Supabase SQL Editor.

## Passo 2: Habilitar RLS em Todas as Tabelas

Execute este script para habilitar RLS:

```sql
-- Habilitar RLS em todas as tabelas principais
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
```

## Passo 3: Configurar Políticas de Segurança

### 3.1 Políticas para Profiles

```sql
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
    AND id != auth.uid() -- Não pode excluir a si mesmo
  );
```

### 3.2 Políticas para Customers

```sql
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
```

### 3.3 Políticas para Accounts Receivable

```sql
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
```

### 3.4 Políticas para Accounts Payable

```sql
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
```

### 3.5 Políticas para Audit Log

```sql
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
```

## Passo 4: Testar em Ambiente de Staging

Antes de aplicar em produção:

1. **Crie um ambiente de staging** (cópia do banco de produção)
2. **Aplique todas as políticas**
3. **Teste com diferentes usuários** (admin, manager, viewer)
4. **Verifique se todas as funcionalidades funcionam**

## Passo 5: Checklist de Segurança

Antes de ir para produção, verifique:

- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas de segurança aplicadas
- [ ] Apenas usuários autenticados podem acessar dados
- [ ] Roles funcionando corretamente (admin, manager, viewer)
- [ ] Testes feitos com cada tipo de usuário
- [ ] Backup do banco antes de aplicar mudanças
- [ ] Documentação atualizada
- [ ] Variáveis de ambiente configuradas (não usar chaves de desenvolvimento)

## Passo 6: Monitoramento

Após aplicar em produção:

1. **Monitore logs de erro** no Supabase
2. **Verifique se os usuários conseguem acessar** suas funcionalidades
3. **Revise logs de auditoria** regularmente
4. **Faça backup regular** do banco de dados

## Comandos Úteis

### Verificar status do RLS:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'customers', 'accounts_receivable', 'accounts_payable', 'audit_log');
```

### Ver todas as políticas ativas:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Desabilitar RLS temporariamente (emergência):
```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log DISABLE ROW LEVEL SECURITY;
```

## Avisos Importantes

⚠️ **NUNCA desabilite RLS em produção** sem motivo extremo
⚠️ **Sempre teste em staging primeiro**
⚠️ **Mantenha backups antes de mudanças**
⚠️ **Documente todas as mudanças**

## Suporte

Se encontrar problemas ao aplicar em produção:
1. Verifique os logs do Supabase
2. Teste as políticas individualmente
3. Verifique se os usuários têm os roles corretos
4. Consulte a documentação do Supabase sobre RLS

