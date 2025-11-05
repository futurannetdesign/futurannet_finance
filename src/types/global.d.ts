// Declarações de tipos para compatibilidade com Supabase no ambiente browser
declare global {
  interface Buffer extends Uint8Array {}
  var Buffer: {
    new (str: string, encoding?: string): Buffer;
    from(data: any): Buffer;
    isBuffer(obj: any): boolean;
  };
  
  namespace NodeJS {
    interface ReadableStream {}
  }
}

export {};

