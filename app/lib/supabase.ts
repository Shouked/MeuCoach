import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Obter as variáveis de ambiente
// EXPO_PUBLIC_ SUPARA URL (definida em .env e acessível publicamente)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// SUPABASE_ANON_KEY para a chave anônima (definida via EAS Secrets ou .env para dev)
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Validação das variáveis
if (!supabaseUrl) {
  console.error('Erro: Variável de ambiente EXPO_PUBLIC_SUPABASE_URL não definida.');
  // Poderia lançar um erro aqui ou ter um valor padrão de desenvolvimento, mas não commitar chaves reais.
}

if (!supabaseAnonKey) {
  console.error('Erro: Variável de ambiente SUPABASE_ANON_KEY não definida.');
  // Poderia lançar um erro aqui.
}

// Mostrar as URLs para debug (opcional e cuidado com a chave em logs)
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key defined:", !!supabaseAnonKey); // Apenas indicar se foi definida

// Criar um cliente supabase configurado para uso móvel
// Certifique-se de que as variáveis não são undefined antes de passar para createClient
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 