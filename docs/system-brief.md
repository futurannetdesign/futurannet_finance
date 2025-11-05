# Sistema de Contas a Receber e Contas a Pagar (Futurannet Finance)

## 1. Objetivo
Gerenciar contas a receber de clientes do provedor Futurannet (planos de internet) e contas a pagar da empresa (aluguel, gás, telefone, etc.).

## 2. Requisitos Principais
- Controlar vencimentos, valores, status (verde=Pago, amarelo=Próximo vencimento, vermelho=Atrasado)
- Atualização automática de datas de vencimento para cobranças recorrentes
- Banco de dados Supabase SQL com RLS e auditoria
- 3 níveis de acesso: admin, manager e viewer
- Interface Angular moderna e responsiva

## 3. Estrutura de Banco de Dados (resumo)
- `profiles` → usuários e roles
- `customers` → clientes da internet
- `accounts_receivable` → mensalidades
- `accounts_payable` → despesas fixas e variáveis
- `audit_log` → registro de ações
- `views` → `receivables_with_status` e `payables_with_status`

## 4. Regras de Negócio
- Quando marcar como pago, se for recorrente → avançar a próxima data.
- Status calculado por diferença de dias:
  - `verde`: pago
  - `amarelo`: até 5 dias antes do vencimento
  - `vermelho`: atrasado
- Contas podem ser editadas, mas o histórico de pagamentos deve ser preservado (caso opte por histórico).

## 5. Regras de Acesso
- Admin → tudo
- Manager → CRUD em contas, mas não gerencia usuários
- Viewer → somente leitura

## 6. Integrações futuras
- Integração com Asaas para conciliação automática
- Envio de alertas via WhatsApp e email
- Relatórios em PDF e planilha

## 7. Observações
- Todo código SQL deve ser executado no Supabase SQL Editor.
- O frontend será 100% Angular + Supabase.
- Sempre preservar consistência com este documento antes de qualquer modificação.

