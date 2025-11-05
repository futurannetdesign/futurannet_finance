# Como Testar Build de Produção Localmente

Este guia explica como testar o build de produção localmente antes de fazer deploy.

## Passo 1: Gerar Build de Produção

Execute o comando:

```bash
npm run build:prod
```

Isso irá:
- Compilar o código com otimizações
- Minificar e comprimir arquivos
- Usar `environment.prod.ts` ao invés de `environment.ts`
- Gerar arquivos na pasta `dist/futurannet-finance/`

## Passo 2: Servir os Arquivos Localmente

### Opção A: Usando http-server (Recomendado)

1. Instale o http-server globalmente (se ainda não tiver):
```bash
npm install -g http-server
```

2. Entre na pasta de build:
```bash
cd dist/futurannet-finance
```

3. Inicie o servidor:
```bash
http-server -p 8080
```

4. Acesse no navegador: `http://localhost:8080`

### Opção B: Usando Python

Se você tem Python instalado:

```bash
cd dist/futurannet-finance
python -m http.server 8080
```

### Opção C: Usando Node.js serve

```bash
npm install -g serve
cd dist/futurannet-finance
serve -s . -l 8080
```

## Passo 3: Testar Funcionalidades

Ao acessar `http://localhost:8080`, teste:

1. ✅ Login funciona
2. ✅ Dashboard carrega
3. ✅ CRUD de clientes funciona
4. ✅ CRUD de contas a receber funciona
5. ✅ CRUD de contas a pagar funciona
6. ✅ Exportação Excel/PDF funciona
7. ✅ Menu de usuários aparece (se admin)
8. ✅ Logs de auditoria funcionam (se admin)
9. ✅ Logout funciona

## Passo 4: Verificar Console do Navegador

1. Abra DevTools (F12)
2. Vá na aba Console
3. Verifique se não há erros
4. Verifique se não há warnings críticos

## Diferenças entre Desenvolvimento e Produção

### Desenvolvimento (`npm start`)
- Arquivos não minificados
- Source maps habilitados
- Hot reload ativo
- Usa `environment.ts`

### Produção (`npm run build:prod`)
- Arquivos minificados e otimizados
- Source maps desabilitados
- Sem hot reload
- Usa `environment.prod.ts`
- Hash nos nomes dos arquivos para cache busting

## Troubleshooting

### Erro: "Cannot find module 'environment'"
- Verifique se `environment.prod.ts` existe
- Verifique se `angular.json` tem `fileReplacements` configurado

### Erro: "Failed to load resource"
- Verifique se está servindo da pasta `dist/futurannet-finance`
- Verifique se os arquivos foram gerados corretamente

