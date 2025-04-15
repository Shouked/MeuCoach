import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://xydiwguzqvmkkpxpjyuo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZGl3Z3V6cXZta2tweHBqeXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNDQ2NDUsImV4cCI6MjA1OTgyMDY0NX0.oQ3cLd-Rc3rLQ_iGwzHggJhGbd8YKZ41UevLcrMWxpI';

// Criar e exportar o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Função para verificar se o token é válido
export const verifyToken = async (token) => {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Erro ao verificar token:', error.message);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Exceção ao verificar token:', error);
    return null;
  }
}; 