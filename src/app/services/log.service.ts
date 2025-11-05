import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Serviço de logging centralizado
 * 
 * Em produção, os logs são desabilitados automaticamente para:
 * - Melhorar performance
 * - Evitar expor informações sensíveis no console do navegador
 * - Reduzir tamanho do bundle
 */
@Injectable({
  providedIn: 'root'
})
export class LogService {
  private isProduction = environment.production;

  /**
   * Log de informação (equivalente a console.log)
   * Desabilitado em produção
   */
  log(...args: any[]): void {
    if (!this.isProduction) {
      console.log(...args);
    }
  }

  /**
   * Log de informação (sempre ativo, mesmo em produção)
   * Use com cuidado - apenas para informações críticas que precisam ser sempre visíveis
   */
  logAlways(...args: any[]): void {
    console.log(...args);
  }

  /**
   * Log de erro (sempre ativo)
   * Erros devem ser sempre visíveis para debugging
   */
  error(...args: any[]): void {
    console.error(...args);
  }

  /**
   * Log de aviso (sempre ativo)
   * Avisos devem ser sempre visíveis
   */
  warn(...args: any[]): void {
    console.warn(...args);
  }

  /**
   * Log de informação (equivalente a console.info)
   * Desabilitado em produção
   */
  info(...args: any[]): void {
    if (!this.isProduction) {
      console.info(...args);
    }
  }

  /**
   * Log de debug (equivalente a console.debug)
   * Desabilitado em produção
   */
  debug(...args: any[]): void {
    if (!this.isProduction) {
      console.debug(...args);
    }
  }

  /**
   * Log de tabela (equivalente a console.table)
   * Desabilitado em produção
   */
  table(...args: any[]): void {
    if (!this.isProduction) {
      console.table(...args);
    }
  }
}

