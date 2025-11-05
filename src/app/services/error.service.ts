import { Injectable } from '@angular/core';
import { LogService } from './log.service';

/**
 * Tipos de erro do sistema
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Interface para mensagens de erro amigáveis
 */
export interface ErrorMessage {
  title: string;
  message: string;
  type: ErrorType;
  canRetry: boolean;
}

/**
 * Serviço centralizado para tratamento de erros
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private readonly errorMessages: Map<string, ErrorMessage> = new Map([
    ['NETWORK_ERROR', {
      title: 'Erro de Conexão',
      message: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.',
      type: ErrorType.NETWORK,
      canRetry: true
    }],
    ['TIMEOUT', {
      title: 'Tempo Esgotado',
      message: 'A operação demorou muito para responder. Tente novamente.',
      type: ErrorType.NETWORK,
      canRetry: true
    }],
    ['PERMISSION_DENIED', {
      title: 'Permissão Negada',
      message: 'Você não tem permissão para realizar esta ação. Entre em contato com o administrador.',
      type: ErrorType.PERMISSION,
      canRetry: false
    }],
    ['NOT_FOUND', {
      title: 'Não Encontrado',
      message: 'O registro solicitado não foi encontrado.',
      type: ErrorType.NOT_FOUND,
      canRetry: false
    }],
    ['VALIDATION_ERROR', {
      title: 'Erro de Validação',
      message: 'Os dados fornecidos são inválidos. Verifique os campos e tente novamente.',
      type: ErrorType.VALIDATION,
      canRetry: false
    }],
    ['TABLE_NOT_FOUND', {
      title: 'Tabela Não Encontrada',
      message: 'Tabela não encontrada no banco de dados. Execute o script SQL no Supabase para criar as tabelas necessárias.',
      type: ErrorType.SERVER,
      canRetry: false
    }]
  ]);

  constructor(private logService: LogService) {}

  /**
   * Processa um erro e retorna uma mensagem amigável
   */
  getErrorMessage(error: any): ErrorMessage {
    // Log do erro completo para debugging
    this.logService.error('Erro capturado:', error);

    // Se já for uma ErrorMessage, retornar diretamente
    if (error && typeof error === 'object' && error.title && error.message) {
      return error as ErrorMessage;
    }

    const errorString = error?.message || error?.error?.message || String(error);
    const errorCode = error?.code || error?.error?.code;

    // Verificar erros específicos do Supabase
    if (errorCode === '42P01') {
      return this.errorMessages.get('TABLE_NOT_FOUND') || this.getDefaultError();
    }

    if (errorCode === 'PGRST116' || errorString.includes('No rows returned')) {
      return this.errorMessages.get('NOT_FOUND') || this.getDefaultError();
    }

    // Verificar mensagens de erro comuns
    const lowerError = errorString.toLowerCase();

    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('connection')) {
      return this.errorMessages.get('NETWORK_ERROR') || this.getDefaultError();
    }

    if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
      return this.errorMessages.get('TIMEOUT') || this.getDefaultError();
    }

    if (lowerError.includes('permission') || lowerError.includes('unauthorized') || lowerError.includes('forbidden')) {
      return this.errorMessages.get('PERMISSION_DENIED') || this.getDefaultError();
    }

    if (lowerError.includes('validation') || lowerError.includes('invalid')) {
      return this.errorMessages.get('VALIDATION_ERROR') || this.getDefaultError();
    }

    if (lowerError.includes('not found') || lowerError.includes('não encontrado')) {
      return this.errorMessages.get('NOT_FOUND') || this.getDefaultError();
    }

    // Erro desconhecido - retornar mensagem genérica
    return this.getDefaultError(errorString);
  }

  /**
   * Retorna mensagem de erro padrão
   */
  private getDefaultError(originalMessage?: string): ErrorMessage {
    return {
      title: 'Erro ao Processar Solicitação',
      message: originalMessage || 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.',
      type: ErrorType.UNKNOWN,
      canRetry: true
    };
  }

  /**
   * Extrai mensagem de erro amigável como string
   */
  getErrorMessageString(error: any): string {
    const errorMsg = this.getErrorMessage(error);
    return errorMsg.message;
  }

  /**
   * Verifica se o erro pode ser retentado
   */
  canRetry(error: any): boolean {
    return this.getErrorMessage(error).canRetry;
  }

  /**
   * Verifica se é erro de rede
   */
  isNetworkError(error: any): boolean {
    return this.getErrorMessage(error).type === ErrorType.NETWORK;
  }
}

