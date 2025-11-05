# Instruções para Configurar o Banco de Dados

## Problema: "Could not find the table 'public.customers'"

Este erro ocorre porque a tabela `customers` não existe no banco de dados Supabase ou as políticas RLS estão bloqueando o acesso.

## Solução Passo a Passo

### 1. Executar o Script Principal

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor** (no menu lateral)
3. Clique em **New Query**
4. Copie e cole TODO o conteúdo do arquivo `docs/database-schema.sql`
5. Clique em **Run** (ou pressione Ctrl+Enter)

Este script irá:
- Criar todas as tabelas necessárias
- Criar views para status calculado
- Criar triggers para atualizar `updated_at`
- Configurar RLS com políticas permissivas para desenvolvimento

### 2. Se Ainda Não Funcionar - Desabilitar RLS Temporariamente

Se ainda tiver problemas de acesso, execute também o script `docs/database-disable-rls.sql`:

1. No **SQL Editor**, crie uma nova query
2. Copie e cole o conteúdo de `docs/database-disable-rls.sql`
3. Execute

⚠️ **ATENÇÃO**: Isso desabilita o RLS completamente. Use apenas para desenvolvimento!

### 3. Verificar se as Tabelas Foram Criadas

1. No Supabase Dashboard, vá em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - `customers`
   - `profiles`
   - `accounts_receivable`
   - `accounts_payable`
   - `audit_log`

### 4. Testar no Frontend

Após executar os scripts:
1. Verifique se o arquivo `src/environments/environment.ts` está configurado com suas credenciais do Supabase
2. Recarregue a aplicação Angular
3. Tente criar um cliente novo

### 5. Dados de Teste (Opcional)

Para inserir dados de teste, execute no SQL Editor:

```sql
INSERT INTO public.customers (name, email, phone, plan_value, plan_description, is_active) VALUES
  ('João Silva', 'joao@email.com', '(11) 99999-9999', 99.90, 'Plano 100MB', true),
  ('Maria Santos', 'maria@email.com', '(11) 88888-8888', 149.90, 'Plano 200MB', true),
  ('Pedro Oliveira', 'pedro@email.com', '(11) 77777-7777', 79.90, 'Plano 50MB', false);
```

## Troubleshooting

### Erro: "relation does not exist"
- Certifique-se de executar o script completo do `database-schema.sql`
- Verifique se está usando o schema `public.` (ex: `public.customers`)

### Erro: "permission denied"
- Execute o script `database-disable-rls.sql` para desabilitar RLS temporariamente
- Ou verifique se as políticas RLS estão configuradas corretamente

### Tabelas não aparecem no Table Editor
- Recarregue a página do Supabase Dashboard
- Verifique se executou o script sem erros no SQL Editor

## Para Produção

Quando implementar autenticação, execute o script `docs/database-rls-production.sql` para configurar as políticas RLS adequadas para produção.

