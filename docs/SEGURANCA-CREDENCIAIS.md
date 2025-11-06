# 🔐 Guia de Segurança - Credenciais do Supabase

## ⚠️ IMPORTANTE: Proteção de Credenciais

Este guia explica como proteger suas credenciais do Supabase ao trabalhar com Git/GitHub.

---

## 📋 Situação Atual

**Status:** As credenciais estão sendo commitadas no repositório.

**Risco:** 
- ✅ **Baixo** se o repositório for **privado**
- ⚠️ **Médio** se o repositório for **público** (mesmo que a Anon Key seja pública por design)

---

## ✅ Solução Implementada

### 1. Arquivos Protegidos

Os seguintes arquivos foram adicionados ao `.gitignore`:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

**Isso significa:** Esses arquivos não serão mais commitados automaticamente.

### 2. Arquivo de Exemplo

O arquivo `src/environments/environment.example.ts` contém apenas placeholders e pode ser commitado com segurança.

---

## 🚀 Como Configurar (Novos Desenvolvedores)

### Passo 1: Clonar o Repositório

```bash
git clone seu-repositorio
cd futurannet_finance
```

### Passo 2: Criar Arquivos de Ambiente

```bash
# Copiar arquivo de exemplo
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.prod.ts
```

### Passo 3: Preencher Credenciais

Edite `src/environments/environment.ts` e `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: false, // true para .prod.ts
  supabaseUrl: 'https://seu-projeto.supabase.co', // ← Sua URL real
  supabaseAnonKey: 'sua-chave-anon-real' // ← Sua chave real
};
```

**Onde encontrar:**
- Supabase Dashboard > Settings > API
- **URL:** Project URL
- **Anon Key:** anon/public key (NÃO use service_role!)

---

## 🔄 Se Você Já Tem Credenciais Commitadas

### Opção 1: Remover do Histórico (Recomendado para Repositórios Públicos)

⚠️ **ATENÇÃO:** Isso reescreve o histórico do Git. Use apenas se necessário.

```bash
# 1. Fazer backup dos arquivos atuais
cp src/environments/environment.ts src/environments/environment.ts.backup
cp src/environments/environment.prod.ts src/environments/environment.prod.ts.backup

# 2. Remover do Git (mas manter localmente)
git rm --cached src/environments/environment.ts
git rm --cached src/environments/environment.prod.ts

# 3. Commit
git commit -m "Remove credenciais do repositório"

# 4. Push (se for repositório público, considere forçar após avisar a equipe)
git push
```

### Opção 2: Manter Como Está (Repositório Privado)

Se o repositório for **privado**, você pode manter as credenciais commitadas. O `.gitignore` evitará commits futuros acidentais.

---

## 🛡️ Segurança das Credenciais

### Anon Key (Chave Pública)

- ✅ **Pode ser exposta** no frontend
- ✅ **Protegida por RLS** (Row Level Security)
- ✅ **Não permite acesso** sem autenticação adequada
- ⚠️ **Mesmo assim**, não é boa prática commitá-la em repositórios públicos

### Service Role Key (Chave Privada)

- ❌ **NUNCA deve ser exposta**
- ❌ **NÃO está sendo usada** no código atual (bom!)
- ⚠️ **Se precisar usar**, configure via Edge Functions no Supabase

---

## 📝 Checklist de Segurança

- [x] Arquivos de ambiente adicionados ao `.gitignore`
- [x] Arquivo de exemplo criado (`environment.example.ts`)
- [x] Documentação criada
- [ ] Credenciais removidas do histórico (se repositório público)
- [ ] Equipe informada sobre as mudanças

---

## 🆘 Precisa de Ajuda?

Se você já commitou credenciais em um repositório público:

1. **Rotacione as credenciais** no Supabase Dashboard
2. **Remova do histórico** do Git (veja Opção 1 acima)
3. **Atualize** os arquivos locais com as novas credenciais

---

## ✅ Próximos Passos Recomendados

1. **Para produção:** Configure variáveis de ambiente na Vercel
2. **Para desenvolvimento:** Mantenha arquivos locais (já protegidos pelo .gitignore)
3. **Para equipe:** Compartilhe credenciais via canal seguro (não via Git)

---

**Última atualização:** 2025-11-05

