# Guia de Testes de Segurança - Futurannet Finance

Este guia explica como testar a segurança do sistema antes de ir para produção.

## ⚠️ IMPORTANTE

Execute estes testes em um ambiente de **staging** (cópia do banco de produção) ANTES de aplicar em produção.

## Pré-requisitos

1. ✅ Banco de dados configurado com todas as tabelas
2. ✅ Script `SETUP-AUTH-PRODUCTION.sql` executado
3. ✅ RLS habilitado em todas as tabelas
4. ✅ Pelo menos 3 usuários criados:
   - 1 Admin
   - 1 Manager
   - 1 Viewer

## Teste 1: Verificar RLS Está Habilitado

Execute no Supabase SQL Editor:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'customers', 'accounts_receivable', 'accounts_payable', 'audit_log')
ORDER BY tablename;
```

**Resultado esperado:** Todas as tabelas devem ter `rowsecurity = true`

## Teste 2: Verificar Políticas RLS Estão Ativas

Execute no Supabase SQL Editor:

```sql
SELECT tablename, policyname, cmd 
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Resultado esperado:** Deve mostrar várias políticas para cada tabela

## Teste 3: Testar Acesso com Cada Role

### 3.1 Teste com Admin

1. Faça login como **admin**
2. Verifique se consegue:
   - ✅ Ver todos os clientes
   - ✅ Criar novos clientes
   - ✅ Editar clientes existentes
   - ✅ Excluir clientes
   - ✅ Ver todas as contas a receber
   - ✅ Criar/editar/excluir contas a receber
   - ✅ Ver todas as contas a pagar
   - ✅ Criar/editar/excluir contas a pagar
   - ✅ Ver menu "Usuários"
   - ✅ Criar/editar/excluir usuários
   - ✅ Ver logs de auditoria

**Resultado esperado:** Admin deve ter acesso total a tudo

### 3.2 Teste com Manager

1. Faça login como **manager**
2. Verifique se consegue:
   - ✅ Ver todos os clientes
   - ✅ Criar novos clientes
   - ✅ Editar clientes existentes
   - ❌ **NÃO** consegue excluir clientes
   - ✅ Ver todas as contas a receber
   - ✅ Criar/editar contas a receber
   - ❌ **NÃO** consegue excluir contas a receber
   - ✅ Ver todas as contas a pagar
   - ✅ Criar/editar contas a pagar
   - ❌ **NÃO** consegue excluir contas a pagar
   - ❌ **NÃO** vê menu "Usuários"
   - ❌ **NÃO** consegue acessar `/users` diretamente
   - ❌ **NÃO** consegue acessar `/audit-log` diretamente

**Resultado esperado:** Manager pode criar/editar mas não excluir nem gerenciar usuários

### 3.3 Teste com Viewer

1. Faça login como **viewer**
2. Verifique se consegue:
   - ✅ Ver todos os clientes
   - ❌ **NÃO** consegue criar clientes
   - ❌ **NÃO** consegue editar clientes
   - ❌ **NÃO** consegue excluir clientes
   - ✅ Ver todas as contas a receber
   - ❌ **NÃO** consegue criar contas a receber
   - ❌ **NÃO** consegue editar contas a receber
   - ❌ **NÃO** consegue excluir contas a receber
   - ✅ Ver todas as contas a pagar
   - ❌ **NÃO** consegue criar contas a pagar
   - ❌ **NÃO** consegue editar contas a pagar
   - ❌ **NÃO** consegue excluir contas a pagar
   - ❌ **NÃO** vê menu "Usuários"
   - ❌ **NÃO** vê menu "Auditoria"
   - ❌ **NÃO** consegue acessar `/users` diretamente
   - ❌ **NÃO** consegue acessar `/audit-log` diretamente

**Resultado esperado:** Viewer só pode visualizar, nenhuma ação de escrita

## Teste 4: Verificar Proteção de Rotas

### 4.1 Teste com Usuário Não Autenticado

1. Faça logout
2. Tente acessar diretamente:
   - `http://localhost:4200/dashboard`
   - `http://localhost:4200/customers`
   - `http://localhost:4200/users`
   - `http://localhost:4200/audit-log`

**Resultado esperado:** Todas devem redirecionar para `/login`

### 4.2 Teste com Manager Tentando Acessar Rotas Admin

1. Faça login como **manager**
2. Tente acessar diretamente:
   - `http://localhost:4200/users`
   - `http://localhost:4200/audit-log`

**Resultado esperado:** Deve redirecionar para `/dashboard` ou mostrar erro de acesso negado

### 4.3 Teste com Viewer Tentando Acessar Rotas Admin

1. Faça login como **viewer**
2. Tente acessar diretamente:
   - `http://localhost:4200/users`
   - `http://localhost:4200/audit-log`
   - `http://localhost:4200/customers/new`

**Resultado esperado:** Deve redirecionar para `/dashboard` ou mostrar erro de acesso negado

## Teste 5: Verificar Auditoria

### 5.1 Criar Registro e Verificar Log

1. Faça login como **admin**
2. Crie um novo cliente
3. Vá para "Auditoria"
4. Verifique se aparece um log de CREATE para `customers`

**Resultado esperado:** Deve aparecer log com ação CREATE

### 5.2 Editar Registro e Verificar Log

1. Edite um cliente existente
2. Vá para "Auditoria"
3. Verifique se aparece um log de UPDATE
4. Clique em "Ver" no log
5. Verifique se mostra `old_data` e `new_data`

**Resultado esperado:** Deve aparecer log com ação UPDATE e dados antigos/novos

### 5.3 Excluir Registro e Verificar Log

1. Exclua um cliente
2. Vá para "Auditoria"
3. Verifique se aparece um log de DELETE
4. Clique em "Ver" no log
5. Verifique se mostra `old_data` e `new_data` é null

**Resultado esperado:** Deve aparecer log com ação DELETE e dados antigos

## Teste 6: Verificar Acesso Direto ao Banco (Opcional)

Execute no Supabase SQL Editor logado como um usuário não-admin:

```sql
-- Tentar inserir diretamente (deve falhar se RLS estiver ativo)
INSERT INTO public.customers (name, plan_value) 
VALUES ('Teste RLS', 100);
```

**Resultado esperado:** Se RLS estiver ativo e você não for admin/manager, deve dar erro de permissão

## Teste 7: Verificar Exportação

1. Faça login como **admin**
2. Vá para "Contas a Receber"
3. Clique em "Excel" ou "PDF"
4. Verifique se o arquivo é baixado corretamente
5. Abra o arquivo e verifique se os dados estão corretos

**Resultado esperado:** Arquivo deve ser baixado e conter dados corretos

## Checklist Final

Antes de ir para produção, marque todos os itens:

- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS aplicadas e testadas
- [ ] Admin tem acesso total (testado)
- [ ] Manager pode criar/editar mas não excluir (testado)
- [ ] Viewer só pode visualizar (testado)
- [ ] Rotas protegidas funcionando (testado)
- [ ] Auditoria registrando ações (testado)
- [ ] Exportação funcionando (testado)
- [ ] Build de produção gerado e testado
- [ ] Nenhum erro no console do navegador
- [ ] Todas as funcionalidades principais funcionando

## Próximos Passos Após Testes

Se todos os testes passarem:

1. ✅ Faça backup do banco de dados
2. ✅ Documente todas as configurações
3. ✅ Prepare ambiente de produção
4. ✅ Execute script `SETUP-AUTH-PRODUCTION.sql` no banco de produção
5. ✅ Faça deploy do build de produção
6. ✅ Teste novamente em produção

## Suporte

Se encontrar problemas durante os testes:
1. Verifique os logs do Supabase
2. Verifique o console do navegador
3. Verifique se as políticas RLS estão corretas
4. Consulte a documentação do Supabase sobre RLS

