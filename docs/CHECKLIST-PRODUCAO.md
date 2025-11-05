# Checklist Final Antes de Produção

Use este checklist para garantir que tudo está pronto antes de fazer deploy em produção.

## 📋 Pré-Deploy

### Banco de Dados
- [ ] Backup do banco criado
- [ ] Script `SETUP-AUTH-PRODUCTION.sql` revisado
- [ ] Todas as tabelas criadas
- [ ] Pelo menos 1 usuário admin criado

### Código
- [ ] Código compilando sem erros
- [ ] Build de produção gerado (`npm run build:prod`)
- [ ] Build testado localmente
- [ ] `environment.prod.ts` com credenciais corretas

### Testes
- [ ] Login funciona
- [ ] Dashboard funciona
- [ ] CRUD completo funciona
- [ ] Exportação funciona
- [ ] Auditoria funciona
- [ ] Controle de acesso funciona

## 🚀 Deploy

### Supabase (Produção)
- [ ] Banco de produção configurado
- [ ] Script `SETUP-AUTH-PRODUCTION.sql` executado
- [ ] RLS habilitado
- [ ] Primeiro usuário admin criado

### Servidor
- [ ] Servidor configurado
- [ ] Build feito upload
- [ ] Domínio configurado (se necessário)
- [ ] SSL/HTTPS configurado

### Testes Pós-Deploy
- [ ] Aplicação acessível
- [ ] Login funciona
- [ ] Todas as funcionalidades testadas

## 🔒 Segurança

- [ ] RLS habilitado
- [ ] Políticas aplicadas
- [ ] Credenciais não expostas

**Quando todos os itens estiverem marcados, está pronto para produção!**

