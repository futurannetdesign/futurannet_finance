import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuditService } from './audit.service';
import { LogService } from './log.service';
import { ErrorService } from './error.service';
import { CacheService } from './cache.service';
import { Customer } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly CACHE_KEY_ALL = 'customers:all';
  private readonly CACHE_KEY_PREFIX = 'customers:';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor(
    private supabase: SupabaseService,
    private auditService: AuditService,
    private logService: LogService,
    private errorService: ErrorService,
    private cacheService: CacheService
  ) {}

  async getAll(): Promise<Customer[]> {
    try {
      // Buscar sempre do banco para garantir dados atualizados
      // Não usar cache para evitar problemas de sincronização
      const { data, error } = await this.supabase.client
        .from('customers')
        .select('*');

      if (error) {
        this.logService.error('Erro do Supabase ao buscar clientes:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      const customers = data || [];
      
      // SEMPRE ordenar alfabeticamente no cliente (não confiar no Supabase)
      const sortedCustomers = this.sortCustomersAlphabetically(customers);
      
      // Armazenar no cache já ordenado
      this.cacheService.set(this.CACHE_KEY_ALL, sortedCustomers, this.CACHE_TTL);
      
      this.logService.log(`Clientes carregados e ordenados: ${sortedCustomers.length} registros`);
      
      return sortedCustomers;
    } catch (err: any) {
      this.logService.error('Erro ao carregar clientes:', err);
      // Se já for um Error com mensagem do ErrorService, apenas relançar
      if (err instanceof Error && err.message) {
        throw err;
      }
      // Caso contrário, transformar em mensagem amigável
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  /**
   * Ordena clientes alfabeticamente por nome (case-insensitive)
   * Usa localeCompare com pt-BR para ordenação correta
   */
  private sortCustomersAlphabetically(customers: Customer[]): Customer[] {
    if (!customers || customers.length === 0) {
      return customers;
    }
    
    // Criar cópia para não modificar o array original
    const sorted = [...customers].sort((a, b) => {
      const nameA = (a.name || '').trim();
      const nameB = (b.name || '').trim();
      
      // Se algum nome estiver vazio, colocar no final
      if (!nameA && !nameB) return 0;
      if (!nameA) return 1;
      if (!nameB) return -1;
      
      // Ordenar usando localeCompare (case-insensitive, respeitando acentos)
      return nameA.localeCompare(nameB, 'pt-BR', { 
        sensitivity: 'base', // Ignora case e acentos na comparação
        numeric: true // Ordena números corretamente
      });
    });
    
    return sorted;
  }

  async getById(id: string): Promise<Customer | null> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
    
    // Verificar cache primeiro
    const cached = this.cacheService.get<Customer>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await this.supabase.client
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logService.error('Erro ao buscar cliente por ID:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      if (data) {
        // Armazenar no cache
        this.cacheService.set(cacheKey, data, this.CACHE_TTL);
      }
      
      return data;
    } catch (err: any) {
      this.logService.error('Erro ao buscar cliente:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  /**
   * Verifica se já existe um cliente com o mesmo nome (case-insensitive)
   * SEMPRE busca do banco (ignora cache) para garantir dados atualizados
   */
  async checkDuplicateName(name: string, excludeId?: string): Promise<boolean> {
    try {
      if (!name || !name.trim()) {
        return false;
      }

      const normalizedName = name.trim().toLowerCase();
      this.logService.log(`Verificando duplicata para: "${name}" (normalizado: "${normalizedName}")`);
      
      // SEMPRE buscar do banco diretamente (ignorar cache) para garantir dados atualizados
      const { data, error } = await this.supabase.client
        .from('customers')
        .select('id, name');

      if (error) {
        this.logService.error('Erro ao verificar nome duplicado:', error);
        // Em caso de erro, lançar exceção para bloquear criação
        throw new Error('Erro ao verificar se o nome já existe. Tente novamente.');
      }

      if (!data || data.length === 0) {
        this.logService.log('Nenhum cliente encontrado - nome disponível');
        return false;
      }

      // Verificar se encontrou algum cliente com nome exatamente igual (case-insensitive)
      const duplicates = data.filter(c => {
        // Se estiver editando, pular o próprio registro
        if (excludeId && c.id === excludeId) {
          return false;
        }
        
        if (!c.name) {
          return false;
        }
        
        // Normalizar e comparar
        const customerName = c.name.trim().toLowerCase();
        return customerName === normalizedName;
      });

      if (duplicates.length > 0) {
        this.logService.warn(`DUPLICATA ENCONTRADA: "${name}" já existe! IDs encontrados:`, duplicates.map(d => d.id));
        return true;
      }

      this.logService.log(`Nome "${name}" disponível - sem duplicatas`);
      return false;
    } catch (err: any) {
      this.logService.error('Erro ao verificar duplicata:', err);
      // Se for erro de validação, relançar
      if (err instanceof Error && err.message.includes('verificar')) {
        throw err;
      }
      // Em caso de outro erro, bloquear para segurança
      throw new Error('Erro ao verificar duplicatas. Não foi possível criar o cliente.');
    }
  }

  async create(customer: Partial<Customer>): Promise<Customer> {
    try {
      this.logService.log('Criando cliente:', customer);
      
      // Verificar se já existe cliente com o mesmo nome (OBRIGATÓRIO)
      if (!customer.name || !customer.name.trim()) {
        throw new Error('O nome do cliente é obrigatório.');
      }

      const normalizedName = customer.name.trim();
      
      // Verificação OBRIGATÓRIA de duplicata antes de criar
      try {
        const isDuplicate = await this.checkDuplicateName(normalizedName);
        
        if (isDuplicate) {
          this.logService.warn(`BLOQUEADO: Tentativa de criar cliente duplicado: "${normalizedName}"`);
          throw new Error(`Já existe um cliente cadastrado com o nome "${normalizedName}". Por favor, use um nome diferente ou edite o cliente existente.`);
        }
        
        this.logService.log(`✓ Nome "${normalizedName}" validado - sem duplicatas`);
      } catch (err: any) {
        // Se o erro já for sobre duplicata, relançar
        if (err.message && err.message.includes('já existe')) {
          throw err;
        }
        // Se for erro de verificação, também bloquear
        throw err;
      }
      
      // Remover campos undefined/null e normalizar nome (trim)
      const cleanCustomer: any = {
        name: normalizedName, // Usar nome normalizado (já foi validado)
        phone: customer.phone ? customer.phone.trim() : null,
        plan_value: parseFloat(customer.plan_value?.toString() || '0'),
        plan_description: customer.plan_description ? customer.plan_description.trim() : null,
        is_active: customer.is_active !== undefined ? customer.is_active : true
      };

      this.logService.log('Dados limpos para inserção:', cleanCustomer);

      const { data, error } = await this.supabase.client
        .from('customers')
        .insert([cleanCustomer])
        .select()
        .single();

      if (error) {
        this.logService.error('Erro do Supabase ao criar:', error);
        
        // Verificar se o erro é de duplicata (unique constraint do PostgreSQL)
        if (error.code === '23505' || 
            error.message?.toLowerCase().includes('duplicate') || 
            error.message?.toLowerCase().includes('unique') ||
            error.message?.toLowerCase().includes('violates unique constraint')) {
          throw new Error(`Já existe um cliente cadastrado com o nome "${normalizedName}". Por favor, use um nome diferente.`);
        }
        
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }

      this.logService.log('Cliente criado com sucesso:', data);
      
      // Invalidar cache para garantir que a lista seja atualizada
      this.invalidateCache();
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('CREATE', 'customers', data.id, null, data).catch(err => 
        this.logService.warn('Erro ao registrar auditoria:', err)
      );
      
      return data;
    } catch (err: any) {
      this.logService.error('Erro ao criar cliente:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async update(id: string, customer: Partial<Customer>): Promise<Customer> {
    try {
      // Verificar se está alterando o nome e se já existe duplicata
      if (customer.name && customer.name.trim()) {
        const normalizedName = customer.name.trim();
        const isDuplicate = await this.checkDuplicateName(normalizedName, id);
        
        if (isDuplicate) {
          this.logService.warn(`Tentativa de atualizar cliente para nome duplicado: "${normalizedName}" (ID: ${id})`);
          throw new Error(`Já existe outro cliente cadastrado com o nome "${normalizedName}". Por favor, use um nome diferente.`);
        }
        
        this.logService.log(`Nome "${normalizedName}" validado para atualização - não há duplicatas`);
      }

      // Buscar dados antigos para auditoria
      const oldData = await this.getById(id).catch(() => null);
      
      // Normalizar dados antes de atualizar
      const updateData: any = { ...customer };
      if (updateData.name) {
        updateData.name = updateData.name.trim();
      }
      if (updateData.phone) {
        updateData.phone = updateData.phone.trim();
      }
      if (updateData.plan_description) {
        updateData.plan_description = updateData.plan_description.trim();
      }
      
      const { data, error } = await this.supabase.client
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logService.error('Erro ao atualizar cliente:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      // Invalidar cache para garantir que a lista seja atualizada com ordenação correta
      this.invalidateCache();
      this.cacheService.delete(`${this.CACHE_KEY_PREFIX}${id}`);
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('UPDATE', 'customers', id, oldData, data).catch(err => 
        this.logService.warn('Erro ao registrar auditoria:', err)
      );
      
      return data;
    } catch (err: any) {
      this.logService.error('Erro ao atualizar cliente:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // Buscar dados para auditoria antes de excluir
      const oldData = await this.getById(id).catch(() => null);
      
      const { error } = await this.supabase.client
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        this.logService.error('Erro ao excluir cliente:', error);
        const errorMsg = this.errorService.getErrorMessage(error);
        throw new Error(errorMsg.message);
      }
      
      // Invalidar cache
      this.invalidateCache();
      this.cacheService.delete(`${this.CACHE_KEY_PREFIX}${id}`);
      
      // Registrar auditoria (não bloquear se falhar)
      await this.auditService.logAction('DELETE', 'customers', id, oldData, null).catch(err => 
        this.logService.warn('Erro ao registrar auditoria:', err)
      );
    } catch (err: any) {
      this.logService.error('Erro ao excluir cliente:', err);
      if (err instanceof Error && err.message) {
        throw err;
      }
      const errorMsg = this.errorService.getErrorMessage(err);
      throw new Error(errorMsg.message);
    }
  }

  /**
   * Invalida o cache de clientes
   */
  private invalidateCache(): void {
    this.cacheService.delete(this.CACHE_KEY_ALL);
    this.cacheService.invalidatePattern(this.CACHE_KEY_PREFIX);
  }
}

