import { Injectable } from '@angular/core';
import { LogService } from './log.service';

/**
 * Interface para itens do cache
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Serviço de cache simples para otimizar requisições
 */
@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutos em milissegundos

  constructor(private logService: LogService) {
    // Limpar cache expirado a cada minuto
    setInterval(() => this.cleanExpired(), 60 * 1000);
  }

  /**
   * Armazena dados no cache com TTL (Time To Live) padrão de 5 minutos
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;

    this.cache.set(key, {
      data,
      timestamp,
      expiresAt
    });

    this.logService.debug(`Cache: Dados armazenados para "${key}"`);
  }

  /**
   * Recupera dados do cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.logService.debug(`Cache: Chave "${key}" não encontrada`);
      return null;
    }

    // Verificar se expirou
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.logService.debug(`Cache: Chave "${key}" expirada e removida`);
      return null;
    }

    this.logService.debug(`Cache: Dados recuperados para "${key}"`);
    return item.data as T;
  }

  /**
   * Verifica se uma chave existe e não está expirada
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove uma chave específica do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.logService.debug(`Cache: Chave "${key}" removida`);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    this.logService.debug('Cache: Todo o cache foi limpo');
  }

  /**
   * Remove itens expirados do cache
   */
  private cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logService.debug(`Cache: ${cleaned} item(s) expirado(s) removido(s)`);
    }
  }

  /**
   * Invalida cache por padrão de chave (prefixo)
   */
  invalidatePattern(pattern: string): void {
    let invalidated = 0;

    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    if (invalidated > 0) {
      this.logService.debug(`Cache: ${invalidated} item(s) invalidado(s) pelo padrão "${pattern}"`);
    }
  }

  /**
   * Retorna estatísticas do cache
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

