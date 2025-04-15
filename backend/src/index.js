import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar rotas
import workoutRoutes from './routes/workouts.js';

// Carrega variáveis de ambiente
dotenv.config();

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3000;

// Obter o diretório atual do módulo ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar diretório temporário para PDFs se não existir
const TMP_DIR = path.join(__dirname, '../tmp');
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://xydiwguzqvmkkpxpjyuo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZGl3Z3V6cXZta2tweHBqeXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNDQ2NDUsImV4cCI6MjA1OTgyMDY0NX0.oQ3cLd-Rc3rLQ_iGwzHggJhGbd8YKZ41UevLcrMWxpI';
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Stripe (se existir uma chave)
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeKey ? new Stripe(stripeKey) : null;

// Middleware
app.use(cors());
app.use(express.json());

// Logar requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API MeuCoach funcionando!' });
});

// Registrar rotas
app.use('/api/workouts', workoutRoutes);

// Rotas de usuários
app.get('/api/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    
    // Verificar se o usuário é um treinador
    if (userData.user.user_metadata.user_type !== 'trainer') {
      return res.status(403).json({ error: 'Apenas treinadores podem listar usuários' });
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rotas de treinos
app.get('/api/workouts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para gerar PDF de treino
app.get('/api/workouts/:id/pdf', async (req, res) => {
  try {
    // Aqui implementar a geração de PDF com pdfkit
    res.json({ message: 'Função de geração de PDF a ser implementada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para pagamentos Stripe
app.post('/api/create-payment', async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: 'Stripe não configurado' });
  }

  try {
    const { amount, currency = 'brl', description } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 