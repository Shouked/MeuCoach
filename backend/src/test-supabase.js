import { supabase } from './lib/supabase.js';

// Função para testar a conexão com o Supabase
async function testSupabaseConnection() {
  console.log('Testando conexão com o Supabase...');
  
  try {
    // Teste simples - tenta buscar uma linha da tabela de profiles
    // ou qualquer outra tabela que você tenha no seu banco
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao conectar com o Supabase:');
      console.error(error);
      return false;
    }
    
    console.log('✅ Conexão com o Supabase bem-sucedida!');
    console.log('Dados recuperados:', data);
    return true;
  } catch (error) {
    console.error('❌ Exceção ao conectar com o Supabase:');
    console.error(error);
    return false;
  }
}

// Executa o teste
testSupabaseConnection().then(success => {
  if (!success) {
    console.log('Por favor, verifique suas variáveis de ambiente e credenciais do Supabase.');
  }
  process.exit(success ? 0 : 1);
}); 