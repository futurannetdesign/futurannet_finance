// ⚠️ ATENÇÃO: Este arquivo é usado apenas para build de produção
// NUNCA commite este arquivo com credenciais reais em repositórios públicos!

// ⚠️ INSTRUÇÕES PARA PRODUÇÃO:
// 1. Antes de fazer o build, SUBSTITUA os valores abaixo com suas credenciais reais do Supabase
// 2. Execute: npm run build:prod
// 3. IMPORTANTE: Depois do build, remova as credenciais reais deste arquivo antes de commitar!

// Para configuração segura via variáveis de ambiente, consulte:
// docs/CONFIGURAR-VARIAVEIS-AMBIENTE.md

export const environment = {
  production: true,
  // ⚠️ SUBSTITUA ESTES VALORES com suas credenciais reais do Supabase antes do deploy
  supabaseUrl: 'SUA_URL_SUPABASE_PRODUCAO',
  supabaseAnonKey: 'SUA_CHAVE_ANON_SUPABASE_PRODUCAO'
};

