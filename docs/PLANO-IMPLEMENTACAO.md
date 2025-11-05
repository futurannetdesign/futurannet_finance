# Plano de Implementação - Futurannet Finance

Baseado no `docs/system-brief.md`, este documento define a sequência de implementação do sistema.

## Status Atual

### ✅ CONCLUÍDO:
1. **CRUD de Clientes** - Completo
   - Listagem de clientes
   - Criação de clientes
   - Edição de clientes
   - Visualização de detalhes
   - Exclusão de clientes
   - Estrutura de banco de dados criada

### 🔄 PRÓXIMAS IMPLEMENTAÇÕES (Em ordem):

## Fase 1: Contas a Receber (Priority 1)

### 1.1 CRUD Básico de Contas a Receber
- [ ] Criar serviço `AccountsReceivableService`
- [ ] Componente de listagem com filtros
- [ ] Componente de formulário (criar/editar)
- [ ] Componente de detalhes
- [ ] Integração com tabela `customers` (seleção de cliente)

### 1.2 Regras de Negócio
- [ ] Campo `is_recurring` (recorrente)
- [ ] Campo `paid_date` (data de pagamento)
- [ ] Quando marcar como pago E for recorrente → avançar próxima data automaticamente
- [ ] Cálculo de status baseado em dias:
  - Verde: `paid_date IS NOT NULL` (pago)
  - Amarelo: até 5 dias antes do vencimento
  - Vermelho: vencido (due_date < CURRENT_DATE)

### 1.3 Visualização
- [ ] Listagem com cores de status (verde/amarelo/vermelho)
- [ ] Botão para marcar como pago
- [ ] Indicador visual de contas recorrentes

## Fase 2: Contas a Pagar (Priority 2)

### 2.1 CRUD Básico de Contas a Pagar
- [ ] Criar serviço `AccountsPayableService`
- [ ] Componente de listagem com filtros
- [ ] Componente de formulário (criar/editar)
- [ ] Componente de detalhes
- [ ] Campo `category` para categorização

### 2.2 Regras de Negócio
- [ ] Campo `is_recurring` (recorrente)
- [ ] Campo `paid_date` (data de pagamento)
- [ ] Quando marcar como pago E for recorrente → avançar próxima data automaticamente
- [ ] Cálculo de status igual ao de contas a receber

### 2.3 Visualização
- [ ] Listagem com cores de status
- [ ] Botão para marcar como pago
- [ ] Filtros por categoria

## Fase 3: Dashboard (Priority 3)

### 3.1 Visão Geral
- [ ] Resumo financeiro (total a receber, total a pagar, saldo)
- [ ] Gráficos de status (verde/amarelo/vermelho)
- [ ] Lista de contas próximas do vencimento
- [ ] Lista de contas atrasadas

### 3.2 Métricas
- [ ] Total de clientes ativos
- [ ] Total de contas a receber
- [ ] Total de contas a pagar
- [ ] Contas vencendo em 5 dias

## Fase 4: Autenticação e Controle de Acesso (Priority 4)

### 4.1 Autenticação Completa
- [ ] Tela de login
- [ ] Gerenciamento de sessão
- [ ] Guard de rotas protegidas

### 4.2 Controle de Acesso por Roles
- [ ] Admin: acesso total
- [ ] Manager: CRUD em contas, sem gerenciar usuários
- [ ] Viewer: somente leitura

### 4.3 Gerenciamento de Usuários (Admin apenas)
- [ ] Listagem de usuários
- [ ] Criação de usuários
- [ ] Edição de roles

## Fase 5: Auditoria (Priority 5)

### 5.1 Sistema de Log
- [ ] Registrar ações no `audit_log`
- [ ] Log de criações, edições, exclusões
- [ ] Visualização de histórico de ações

## Estrutura de Arquivos Sugerida

```
src/app/
├── components/
│   ├── customers/          ✅ Completo
│   ├── accounts-receivable/ 🔄 Próximo
│   ├── accounts-payable/    ⏳ Depois
│   ├── dashboard/           ⏳ Depois
│   └── auth/                ⏳ Depois
├── services/
│   ├── customer.service.ts           ✅ Completo
│   ├── accounts-receivable.service.ts 🔄 Próximo
│   ├── accounts-payable.service.ts   ⏳ Depois
│   └── auth.service.ts               ⏳ Melhorar
└── models/
    └── customer.model.ts ✅ Completo
```

## Próximo Passo Recomendado

**Implementar CRUD de Contas a Receber** seguindo o mesmo padrão usado em Clientes.

Motivos:
1. É a funcionalidade central do sistema
2. Permite testar as regras de negócio principais
3. Estabelece padrão para Contas a Pagar
4. Necessário para o Dashboard

## Observações Importantes

- Sempre seguir o padrão estabelecido em `docs/system-brief.md`
- Manter consistência com a estrutura de banco de dados
- Implementar RLS (Row Level Security) quando autenticação estiver pronta
- Status calculado pela view `receivables_with_status` e `payables_with_status`

