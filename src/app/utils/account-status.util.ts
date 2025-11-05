/**
 * Utilitário para cálculo de status de contas (receber/pagar)
 * 
 * Lógica de Status:
 * - VERDE: Conta paga (tem paidDate válido) OU em dia (mais de 5 dias antes do vencimento)
 * - AMARELO: Próximo do vencimento (0 a 5 dias antes do vencimento, não paga)
 * - VERMELHO: Atrasada (vencida e não paga)
 */

export type AccountStatus = 'verde' | 'amarelo' | 'vermelho';

/**
 * Calcula o status de uma conta baseado na data de vencimento e data de pagamento
 * 
 * @param dueDate Data de vencimento da conta (formato ISO string ou Date)
 * @param paidDate Data de pagamento da conta (opcional, formato ISO string ou Date)
 * @returns Status da conta: 'verde' (pago/em dia), 'amarelo' (próximo), 'vermelho' (atrasado)
 */
export function calculateAccountStatus(
  dueDate: string | Date,
  paidDate?: string | Date | null
): AccountStatus {
  // Verificar se tem data de pagamento válida
  const hasPaidDate = isValidPaidDate(paidDate);

  // Se tem data de pagamento válida, a conta está paga
  if (hasPaidDate) {
    return 'verde'; // Pago
  }

  // Se não tem data de pagamento, calcular baseado na data de vencimento
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'vermelho'; // Atrasado (vencido e não pago)
  } else if (diffDays <= 5) {
    return 'amarelo'; // Próximo do vencimento (até 5 dias)
  } else {
    return 'verde'; // Em dia (mais de 5 dias antes do vencimento)
  }
}

/**
 * Verifica se uma data de pagamento é válida
 * 
 * @param paidDate Data de pagamento a ser validada
 * @returns true se a data é válida, false caso contrário
 */
function isValidPaidDate(paidDate?: string | Date | null): boolean {
  if (!paidDate) {
    return false;
  }

  // Se for Date, converter para string
  if (paidDate instanceof Date) {
    return !isNaN(paidDate.getTime());
  }

  // Se for string, verificar se não é vazia, null, undefined ou apenas espaços
  if (typeof paidDate === 'string') {
    const trimmed = paidDate.trim();
    return trimmed !== '' && 
           trimmed !== 'null' && 
           trimmed !== 'undefined' &&
           !isNaN(new Date(trimmed).getTime()); // Verificar se é uma data válida
  }

  return false;
}

/**
 * Obtém o rótulo legível do status
 * 
 * @param status Status da conta
 * @param paidDate Data de pagamento (opcional)
 * @returns Rótulo legível do status
 */
export function getStatusLabel(status: AccountStatus, paidDate?: string | Date | null): string {
  const hasPaidDate = isValidPaidDate(paidDate);
  
  if (status === 'verde' && hasPaidDate) {
    return 'Pago';
  } else if (status === 'verde' && !hasPaidDate) {
    return 'Em Dia';
  } else if (status === 'amarelo') {
    return 'Próximo';
  } else if (status === 'vermelho') {
    return 'Atrasado';
  }
  
  return status;
}

