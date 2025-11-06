// ============================================
// EXEMPLO DE CONFIGURAÇÃO - NÃO CONTÉM CREDENCIAIS REAIS
// ============================================
// 
// INSTRUÇÕES:
// 1. Copie este arquivo para environment.ts e environment.prod.ts
// 2. Preencha com suas credenciais reais do Supabase
// 3. NUNCA commite os arquivos com credenciais reais!
//
// ONDE ENCONTRAR AS CREDENCIAIS:
// - Supabase Dashboard > Settings > API
// - URL: Project URL
// - Anon Key: anon/public key (NÃO use a service_role key aqui!)
//
// ============================================

export const environment = {
  production: false,
  supabaseUrl: 'https://seu-projeto.supabase.co',
  supabaseAnonKey: 'sua-chave-anon-aqui'
};

