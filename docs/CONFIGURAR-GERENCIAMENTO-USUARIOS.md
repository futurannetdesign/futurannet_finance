# 🔐 Configuração de Gerenciamento de Usuários - Produção

## ⚠️ Problema Identificado

O componente `users.component.ts` usa `auth.admin.createUser()` e `auth.admin.deleteUser()`, que requerem a **Service Role Key** do Supabase, não a Anon Key.

**Isso significa que em produção, essas funcionalidades podem não funcionar** a menos que sejam configuradas adequadamente.

---

## 🎯 Soluções Disponíveis

### Opção 1: Criar Usuários Manualmente (RECOMENDADO para Início)

Esta é a forma mais simples e segura para começar:

1. **Criar usuário no Supabase Dashboard:**
   - Acesse **Authentication > Users** no Supabase
   - Clique em **"Add User"** ou **"Create User"**
   - Preencha email e senha
   - Marque **"Auto Confirm User"**
   - Clique em **"Create User"**

2. **Atualizar perfil no SQL Editor:**
   ```sql
   -- Atualizar role do usuário criado
   UPDATE public.profiles
   SET role = 'admin'  -- ou 'manager' ou 'viewer'
   WHERE email = 'usuario@email.com';
   ```

**Vantagens:**
- ✅ Simples e seguro
- ✅ Funciona imediatamente
- ✅ Não requer configuração adicional

**Desvantagens:**
- ❌ Não é automático
- ❌ Requer acesso ao Supabase Dashboard

---

### Opção 2: Configurar Edge Function no Supabase (RECOMENDADO para Produção)

Crie uma Edge Function que usa a Service Role Key no backend:

#### Passo 1: Criar Edge Function

1. No Supabase Dashboard, vá em **Edge Functions**
2. Crie uma nova função chamada `create-user`

#### Passo 2: Deploy da Edge Function

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref seu-project-ref

# Deploy da função
supabase functions deploy create-user
```

#### Passo 3: Atualizar Users Component

Modifique `users.component.ts` para chamar a Edge Function ao invés de `auth.admin`.

**Vantagens:**
- ✅ Seguro (Service Role Key fica no servidor)
- ✅ Funciona em produção
- ✅ Controle total sobre a criação

**Desvantagens:**
- ❌ Requer configuração adicional
- ❌ Requer Supabase CLI

---

### Opção 3: Desabilitar Criação de Usuários no Frontend

Se você não precisa de criação automática de usuários:

1. Remova ou desabilite o formulário de criação em `users.component.ts`
2. Adicione um aviso informando que usuários devem ser criados manualmente
3. Mantenha apenas a funcionalidade de atualizar roles e excluir perfis

---

## ✅ Recomendação Final

**Para começar rapidamente:**
- Use a **Opção 1** (criação manual)
- Mantenha apenas atualização de roles funcionando

**Para produção profissional:**
- Implemente a **Opção 2** (Edge Function)
- Isso garante que tudo funcione automaticamente

**Para simplificar:**
- Use a **Opção 3** (desabilitar criação)
- Foque em atualização de roles apenas

---

## 🔒 Segurança

**IMPORTANTE:** Nunca exponha a Service Role Key no frontend!

- ✅ A Service Role Key deve ficar apenas no backend (Edge Functions)
- ✅ Use Anon Key no frontend Angular
- ✅ Configure RLS (Row Level Security) adequadamente no Supabase

---

## 📝 Status Atual

O código atual tentará usar `auth.admin` APIs, mas mostrará mensagens de erro claras caso não tenha permissão. Isso permite que:

1. Funcione em desenvolvimento (se configurado localmente)
2. Mostre mensagens claras em produção sobre como resolver
3. Permita atualização de roles (que não requer Admin API)

---

## 🆘 Precisa de Ajuda?

Consulte:
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase Auth Admin: https://supabase.com/docs/reference/javascript/auth-admin-createuser
- Documentação de RLS: `docs/SETUP-AUTH-PRODUCTION.sql`

