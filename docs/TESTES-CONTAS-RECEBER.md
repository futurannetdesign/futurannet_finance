# Checklist de Testes - Contas a Receber

## ✅ Testes Realizados

### 1. Formulário de Criação
- [x] Formulário aparece corretamente
- [x] Campos obrigatórios validados
- [x] Seleção de cliente funciona
- [x] Validação de valor (> 0.01)
- [x] Validação de data de vencimento
- [x] Campo recorrente funciona
- [x] Botão "Criar" habilitado quando form válido
- [x] Botão "Criar" desabilitado quando form inválido
- [x] Logs de debug adicionados

### 2. Serviço de Criação
- [x] Método create implementado
- [x] Dados limpos antes de enviar
- [x] Tratamento de erros
- [x] Logs de debug

### 3. Correções Aplicadas
- [x] Corrigida condição do formulário (*ngIf)
- [x] Valor inicial do campo amount ajustado (de 0 para '')
- [x] Logs de debug adicionados para facilitar troubleshooting
- [x] Botão de debug temporário adicionado

### 4. Fluxo Completo
- [x] Submissão do formulário
- [x] Validação antes de enviar
- [x] Chamada ao serviço
- [x] Tratamento de sucesso/erro
- [x] Navegação após sucesso

## 🧪 Como Testar

1. **Acesse:** `/accounts-receivable/new`
2. **Preencha:**
   - Cliente: selecione um cliente
   - Valor: digite um valor > 0 (ex: 100.50)
   - Data de vencimento: selecione uma data futura
   - Recorrente: opcional
3. **Clique em "Criar"**
4. **Verifique:**
   - Console do navegador (F12) para logs
   - Mensagem de sucesso aparece
   - Redireciona para lista após 1.5s
   - Conta aparece na lista

## 🐛 Se Não Funcionar

1. Clique no botão "Debug" para ver estado do formulário
2. Abra o console (F12) e verifique:
   - Erros do Supabase
   - Estado do formulário
   - Dados sendo enviados
3. Verifique se:
   - Tabela `accounts_receivable` existe no Supabase
   - RLS está desabilitado
   - Cliente selecionado existe no banco

