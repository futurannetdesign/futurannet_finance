# Configuração de Autenticação - Futurannet Finance

Este guia explica como configurar a autenticação completa no sistema.

## Passo 1: Executar Script SQL no Supabase

1. Acesse o **Supabase SQL Editor**
2. Execute o script `docs/SETUP-AUTH.sql`
3. Este script irá:
   - Criar função para criar perfil automaticamente quando um usuário é criado
   - Configurar políticas RLS para a tabela `profiles`
   - Permitir que admins gerenciem usuários

## Passo 2: Criar o Primeiro Usuário Admin

### Opção A: Via Supabase Dashboard (Recomendado)

1. Acesse **Authentication > Users** no Supabase Dashboard
2. Clique em **"Add User"** ou **"Create User"**
3. Preencha:
   - **Email**: exemplo `admin@futurannet.com`
   - **Password**: defina uma senha forte
   - **Auto Confirm User**: marque esta opção
4. Clique em **"Create User"**
5. Copie o **User ID** do usuário criado
6. No **SQL Editor**, execute:

**Se o perfil já existe** (erro de chave duplicada), use UPDATE:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = '75218dcb-0395-4b7d-919b-06b98509fb50';
```

**Se o perfil não existe**, use INSERT:

```sql
INSERT INTO public.profiles (id, email, role)
VALUES (
  '75218dcb-0395-4b7d-919b-06b98509fb50',
  'admin@futurannet.com',
  'admin'
);
```

### Opção B: Via Código (Depois de ter um admin)

1. Faça login como admin
2. Acesse **Usuários** no menu
3. Use o formulário "Novo Usuário" para criar outros usuários

## Passo 3: Testar a Autenticação

1. Inicie o servidor: `npm start`
2. Acesse `http://localhost:4200`
3. Você será redirecionado para `/login`
4. Faça login com o usuário admin criado
5. Você deve ver:
   - Seu email e perfil no header
   - Botão "Sair" no header
   - Link "Usuários" no menu (apenas para admin)
   - Botões de editar/excluir baseados no seu perfil

## Níveis de Acesso

### Admin

- ✅ Acesso total ao sistema
- ✅ Gerenciar usuários (criar, editar, excluir)
- ✅ CRUD completo em todas as entidades
- ✅ Ver link "Usuários" no menu

### Manager

- ✅ CRUD em clientes, contas a receber e contas a pagar
- ❌ Não pode gerenciar usuários
- ❌ Não pode excluir registros (apenas admin)

### Viewer

- ✅ Visualizar todos os dados
- ❌ Não pode criar, editar ou excluir
- ❌ Não pode gerenciar usuários

## Troubleshooting

### Erro: "Could not find table 'public.audit_log'"

- Execute o script `docs/CRIAR-TABELA-AUDIT-LOG.sql` no Supabase SQL Editor
- Verifique se a tabela `audit_log` existe no Supabase

### Erro: "Could not find table 'public.profiles'"

- Execute o script `docs/database-schema.sql` primeiro
- Verifique se a tabela `profiles` existe no Supabase

### Erro: "Profile not found" após login

- Execute o script `docs/SETUP-AUTH.sql`
- Verifique se criou o perfil manualmente para o primeiro usuário

### Botões não aparecem/desaparecem corretamente

- Verifique se o usuário está autenticado
- Verifique se o perfil tem o role correto na tabela `profiles`
- Veja o console do navegador para erros

## Próximos Passos

Após configurar a autenticação, você pode:

1. Criar mais usuários com diferentes perfis
2. Configurar RLS policies mais restritivas para produção
3. Implementar sistema de auditoria (próxima fase)
