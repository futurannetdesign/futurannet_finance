// Configuração do Supabase
import { environment } from '../../environments/environment';

export const SUPABASE_CONFIG = {
  url: environment.supabaseUrl,
  anonKey: environment.supabaseAnonKey
};

