# Futurannet Finance

Sistema de gestão de contas a receber e contas a pagar para a Futurannet.

## Requisitos

- Node.js 18+ 
- npm ou yarn

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
   - Edite o arquivo `src/environments/environment.ts`
   - Adicione sua URL do Supabase e chave anônima

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

4. Acesse `http://localhost:4200`

## Estrutura do Projeto

```
src/
├── app/
│   ├── components/          # Componentes Angular
│   │   └── customers/       # Componentes de clientes
│   ├── services/            # Serviços (Supabase, Customer, Auth)
│   ├── models/              # Modelos de dados TypeScript
│   ├── config/              # Configurações
│   ├── app.component.ts     # Componente principal
│   └── app.routes.ts        # Rotas da aplicação
├── environments/            # Configurações de ambiente
└── styles.css               # Estilos globais
```

## Funcionalidades Implementadas

- ✅ CRUD completo de clientes
- ✅ Listagem de clientes com filtros
- ✅ Formulário de criação/edição
- ✅ Visualização de detalhes
- ✅ Controle de acesso baseado em roles
- ✅ Interface moderna e responsiva

## Próximos Passos

- Implementar autenticação completa
- CRUD de contas a receber
- CRUD de contas a pagar
- Dashboard com visão geral
- Relatórios e exportações

## Configuração do Banco de Dados

Certifique-se de que o banco de dados Supabase está configurado conforme o `docs/system-brief.md`.

## Desenvolvimento

O projeto usa Angular standalone components e está configurado para trabalhar com Supabase.

Para build de produção:
```bash
npm run build
```

