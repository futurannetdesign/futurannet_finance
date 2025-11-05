# Guia de Hospedagem - Futurannet Finance

## 🚀 Plataformas Recomendadas

### 1. **Vercel** ⭐ **RECOMENDADO**
**Por quê escolher:**
- ✅ Deploy automático com GitHub
- ✅ Gratuito para projetos pessoais
- ✅ Otimizado para Angular/SPA
- ✅ SSL automático
- ✅ CDN global (rápido em qualquer lugar)
- ✅ Configuração simples (zero config)
- ✅ Preview de branches
- ✅ Domínio personalizado gratuito

**Custo:** Gratuito (plano Hobby)

**Como fazer deploy:**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Na pasta do projeto
vercel

# Ou conecte direto no GitHub pela interface web
```

**Links:**
- Site: https://vercel.com
- Docs Angular: https://vercel.com/docs/frameworks/angular

---

### 2. **Netlify**
**Por quê escolher:**
- ✅ Deploy automático com GitHub
- ✅ Gratuito para projetos pessoais
- ✅ Boa para SPAs (Angular)
- ✅ SSL automático
- ✅ CDN global
- ✅ Formulários e funções serverless inclusas

**Custo:** Gratuito (plano Starter)

**Como fazer deploy:**
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Build do projeto
npm run build:prod

# Deploy
netlify deploy --prod --dir=dist/futurannet-finance
```

**Links:**
- Site: https://netlify.com
- Docs Angular: https://docs.netlify.com/integrations/frameworks/angular/

---

### 3. **Firebase Hosting** (Google)
**Por quê escolher:**
- ✅ Gratuito (plano Spark)
- ✅ Integração fácil com serviços Google
- ✅ SSL automático
- ✅ CDN global
- ✅ Deploy simples
- ✅ Bom para começar

**Custo:** Gratuito até 10GB de armazenamento

**Como fazer deploy:**
```bash
# Instalar Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Deploy
npm run build:prod
firebase deploy
```

**Links:**
- Site: https://firebase.google.com/products/hosting
- Docs: https://firebase.google.com/docs/hosting

---

### 4. **GitHub Pages**
**Por quê escolher:**
- ✅ Completamente gratuito
- ✅ Integrado com GitHub
- ✅ SSL automático
- ⚠️ Mais limitado (sem servidor)
- ⚠️ Requer configuração extra para Angular

**Custo:** Gratuito

**Como fazer deploy:**
- Requer script específico para Angular (base-href)
- Configurar GitHub Actions para build automático

**Links:**
- Site: https://pages.github.com

---

## 📊 Comparação Rápida

| Plataforma | Facilidade | Custo | Performance | Recomendação |
|------------|------------|-------|-------------|--------------|
| **Vercel** | ⭐⭐⭐⭐⭐ | Gratuito | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Netlify** | ⭐⭐⭐⭐⭐ | Gratuito | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Firebase** | ⭐⭐⭐⭐ | Gratuito | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **GitHub Pages** | ⭐⭐⭐ | Gratuito | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 **MINHA RECOMENDAÇÃO: VERCEL**

### Por quê Vercel?
1. **Mais fácil:** Zero configuração necessária
2. **Mais rápido:** CDN otimizado especificamente para frameworks modernos
3. **Melhor para Angular:** Criado pela equipe que fez Next.js, entendem bem SPAs
4. **Deploy automático:** Conecta com GitHub e faz deploy a cada push
5. **Gratuito e generoso:** Plano gratuito é suficiente para começar

### Como fazer deploy na Vercel:

#### Opção 1: Via Interface Web (Mais Fácil)
1. Acesse https://vercel.com
2. Faça login com GitHub
3. Clique em "New Project"
4. Importe seu repositório
5. Configure:
   - **Framework Preset:** Angular
   - **Build Command:** `npm run build:prod`
   - **Output Directory:** `dist/futurannet-finance`
6. Clique em "Deploy"
7. Pronto! 🎉

#### Opção 2: Via CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (primeira vez)
cd "H:\sistema de pagamento"
vercel

# Deploy de produção
vercel --prod
```

---

## ⚙️ Configuração Necessária

### 1. Arquivo `vercel.json` (se usar Vercel)
Crie na raiz do projeto:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Atualizar `angular.json` (Build de Produção)
Já está configurado! ✅

### 3. Variáveis de Ambiente
- Configure no painel da plataforma escolhida:
  - `SUPABASE_URL` = sua URL do Supabase
  - `SUPABASE_ANON_KEY` = sua chave anon do Supabase

Ou atualize `environment.prod.ts` com as credenciais de produção.

---

## 🚀 Próximos Passos Após Escolher Plataforma

1. ✅ Criar conta na plataforma escolhida
2. ✅ Fazer build de produção: `npm run build:prod`
3. ✅ Fazer deploy inicial
4. ✅ Configurar domínio personalizado (opcional)
5. ✅ Testar em produção
6. ✅ Configurar variáveis de ambiente

---

## 💡 Dica Final

**Para começar:** Use **Vercel** - é a mais fácil e rápida.

**Para produção profissional:** Vercel ou Netlify são excelentes escolhas.

**Orçamento zero:** GitHub Pages funciona, mas requer mais configuração.

---

## 📝 Nota Importante

O Supabase já está hospedado na nuvem, então você só precisa hospedar o **frontend Angular**. O banco de dados e autenticação continuam no Supabase.

**Arquitetura:**
```
Frontend (Angular) → Vercel/Netlify
        ↓
Backend (Supabase) → Supabase Cloud
```

Boa sorte com o deploy! 🚀

