# 🔐 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE - PRODUÇÃO

## ⚠️ IMPORTANTE: Segurança

**NUNCA commite credenciais reais do Supabase no código-fonte!**

Este guia explica como configurar suas credenciais de forma segura para produção.

---

## 📋 Configuração para Desenvolvimento Local

Para desenvolvimento local, você pode manter suas credenciais em `src/environments/environment.ts`.

**Este arquivo não deve ser commitado com credenciais reais** se o repositório for público.

---

## 🚀 Configuração para Produção

### Opção 1: Substituição Manual Antes do Build (RECOMENDADO - SIMPLES)

**Esta é a forma mais simples e recomendada:**

1. Antes de fazer o build de produção, edite `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  supabaseUrl: 'https://seu-projeto.supabase.co',  // ← Sua URL real
  supabaseAnonKey: 'sua-chave-anon-real'          // ← Sua chave real
};
```

2. Faça o build:
```bash
npm run build:prod
```

3. **IMPORTANTE:** Depois do build, remova as credenciais reais de `environment.prod.ts` antes de commitar!

4. Faça o deploy do conteúdo da pasta `dist/futurannet-finance`

---

### Opção 2: Script de Build Automático com Variáveis de Ambiente

Se você quiser usar variáveis de ambiente do sistema:

1. Instale `replace-in-file`:
```bash
npm install --save-dev replace-in-file
npm install --save-dev @types/node
```

2. Crie um script `scripts/replace-env.js`:
```javascript
const replace = require('replace-in-file');

const supabaseUrl = process.env.SUPABASE_URL || 'SUA_URL_SUPABASE_PRODUCAO';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'SUA_CHAVE_ANON_SUPABASE_PRODUCAO';

const options = {
  files: 'src/environments/environment.prod.ts',
  from: [
    /SUA_URL_SUPABASE_PRODUCAO/g,
    /SUA_CHAVE_ANON_SUPABASE_PRODUCAO/g
  ],
  to: [
    supabaseUrl,
    supabaseKey
  ]
};

replace(options)
  .then(results => {
    console.log('✅ Variáveis substituídas com sucesso');
    console.log('URL:', supabaseUrl.substring(0, 30) + '...');
  })
  .catch(err => {
    console.error('❌ Erro ao substituir variáveis:', err);
    process.exit(1);
  });
```

3. Atualize `package.json`:
```json
{
  "scripts": {
    "build:prod": "node scripts/replace-env.js && ng build --configuration production"
  }
}
```

4. Configure variáveis de ambiente no servidor antes do build:
```bash
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_ANON_KEY="sua-chave-anon"
npm run build:prod
```

---

## 🌐 Configuração por Plataforma de Hospedagem

### Vercel

**Método 1: Via Interface Web**
1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione:
   - `SUPABASE_URL` = sua URL do Supabase
   - `SUPABASE_ANON_KEY` = sua chave anon do Supabase
4. Configure para **Production** environment
5. Use a Opção 2 acima (script de build)

**Método 2: Manual**
- Use a Opção 1 (substituição manual) antes de fazer push

---

### Netlify

1. Acesse seu projeto no Netlify
2. Vá em **Site settings** → **Environment variables**
3. Adicione `SUPABASE_URL` e `SUPABASE_ANON_KEY`
4. Use a Opção 2 acima (script de build)

---

### Firebase Hosting

1. Use a Opção 1 (substituição manual)
2. Ou configure variáveis de ambiente via Firebase Functions (se usar)

---

### GitHub Pages

1. Use a Opção 1 (substituição manual)
2. Configure um GitHub Action para substituir automaticamente antes do build

---

## ✅ Checklist de Segurança

- [ ] `environment.prod.ts` não contém credenciais reais no repositório
- [ ] Variáveis de ambiente configuradas no servidor de hospedagem (se usar Opção 2)
- [ ] `.gitignore` está configurado corretamente
- [ ] Credenciais de produção são diferentes das de desenvolvimento
- [ ] RLS (Row Level Security) habilitado no Supabase

---

## 📝 Notas Importantes

1. **A chave "anon" do Supabase é relativamente segura** - ela pode ser exposta no frontend, mas deve ter RLS (Row Level Security) habilitado no banco de dados.

2. **Para máxima segurança**, use RLS no Supabase e configure políticas adequadas (veja `docs/SETUP-AUTH-PRODUCTION.sql`).

3. **Nunca exponha a Service Role Key** - esta chave deve permanecer apenas no backend.

4. **Desenvolvimento vs Produção**: Use credenciais diferentes para desenvolvimento e produção.

---

## 🆘 Precisa de Ajuda?

- Vercel: https://vercel.com/docs/environment-variables
- Netlify: https://docs.netlify.com/environment-variables/overview/
- Firebase: https://firebase.google.com/docs/functions/config-env
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security

---

## 🔄 Workflow Recomendado

1. **Desenvolvimento Local:**
   - Mantenha credenciais em `environment.ts`
   - Este arquivo pode ficar no repositório (com cuidado se for público)

2. **Build de Produção:**
   - Substitua valores em `environment.prod.ts` (Opção 1)
   - OU configure variáveis de ambiente e use script (Opção 2)
   - Execute `npm run build:prod`

3. **Antes de Commitar:**
   - Remova credenciais reais de `environment.prod.ts`
   - Restaure os placeholders: `SUA_URL_SUPABASE_PRODUCAO`

4. **Deploy:**
   - Faça deploy apenas da pasta `dist/futurannet-finance`
   - NUNCA faça deploy com credenciais no código

