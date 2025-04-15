import express from 'express';
import { supabase } from '../lib/supabase.js';
import { generateWorkoutPDF, cleanupPDF } from '../services/pdfGenerator.js';
import path from 'path';

const router = express.Router();

// Middleware para verificar se o usuário está autenticado
const checkAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
    
    req.user = data.user;
    next();
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    res.status(500).json({ error: 'Erro ao verificar autenticação' });
  }
};

// Obter todos os treinos do usuário
router.get('/', checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*, workout_exercises(*, exercise(*))')
      .eq('user_id', req.user.id);
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obter um treino específico
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*, workout_exercises(*, exercise(*))')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }
    
    // Verificar se o treino pertence ao usuário ou se o usuário é um treinador
    if (data.user_id !== req.user.id && req.user.user_metadata.user_type !== 'trainer') {
      return res.status(403).json({ error: 'Acesso não autorizado a este treino' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar treino:', error);
    res.status(500).json({ error: error.message });
  }
});

// Criar um novo treino
router.post('/', checkAuth, async (req, res) => {
  // Verificar se o usuário é um treinador
  if (req.user.user_metadata.user_type !== 'trainer') {
    return res.status(403).json({ error: 'Apenas treinadores podem criar treinos' });
  }
  
  try {
    const { name, description, category, duration, difficulty, student_id, exercises } = req.body;
    
    // Validar dados
    if (!name || !category || !duration || !difficulty || !student_id || !exercises || !Array.isArray(exercises)) {
      return res.status(400).json({ error: 'Dados incompletos ou inválidos' });
    }
    
    // Inserir o treino
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        name,
        description,
        category,
        duration,
        difficulty,
        user_id: student_id,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (workoutError) throw workoutError;
    
    // Inserir os exercícios do treino
    const workoutExercises = exercises.map((exercise, index) => ({
      workout_id: workout.id,
      exercise_id: exercise.id,
      sets: exercise.sets,
      reps: exercise.reps,
      rest_seconds: exercise.rest_seconds,
      notes: exercise.notes,
      order: index
    }));
    
    const { error: exercisesError } = await supabase
      .from('workout_exercises')
      .insert(workoutExercises);
    
    if (exercisesError) throw exercisesError;
    
    res.status(201).json(workout);
  } catch (error) {
    console.error('Erro ao criar treino:', error);
    res.status(500).json({ error: error.message });
  }
});

// Atualizar um treino
router.put('/:id', checkAuth, async (req, res) => {
  // Verificar se o usuário é um treinador
  if (req.user.user_metadata.user_type !== 'trainer') {
    return res.status(403).json({ error: 'Apenas treinadores podem atualizar treinos' });
  }
  
  try {
    const { name, description, category, duration, difficulty, exercises } = req.body;
    
    // Validar dados
    if (!name || !category || !duration || !difficulty) {
      return res.status(400).json({ error: 'Dados incompletos ou inválidos' });
    }
    
    // Verificar se o treino existe
    const { data: existingWorkout, error: fetchError } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError || !existingWorkout) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }
    
    // Verificar se o treinador criou este treino
    if (existingWorkout.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este treino' });
    }
    
    // Atualizar o treino
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .update({
        name,
        description,
        category,
        duration,
        difficulty,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();
    
    if (workoutError) throw workoutError;
    
    // Se houver exercícios para atualizar
    if (exercises && Array.isArray(exercises)) {
      // Remover os exercícios existentes
      const { error: deleteError } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('workout_id', req.params.id);
      
      if (deleteError) throw deleteError;
      
      // Inserir os novos exercícios
      const workoutExercises = exercises.map((exercise, index) => ({
        workout_id: workout.id,
        exercise_id: exercise.id,
        sets: exercise.sets,
        reps: exercise.reps,
        rest_seconds: exercise.rest_seconds,
        notes: exercise.notes,
        order: index
      }));
      
      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);
      
      if (exercisesError) throw exercisesError;
    }
    
    res.json(workout);
  } catch (error) {
    console.error('Erro ao atualizar treino:', error);
    res.status(500).json({ error: error.message });
  }
});

// Excluir um treino
router.delete('/:id', checkAuth, async (req, res) => {
  // Verificar se o usuário é um treinador
  if (req.user.user_metadata.user_type !== 'trainer') {
    return res.status(403).json({ error: 'Apenas treinadores podem excluir treinos' });
  }
  
  try {
    // Verificar se o treino existe
    const { data: existingWorkout, error: fetchError } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError || !existingWorkout) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }
    
    // Verificar se o treinador criou este treino
    if (existingWorkout.created_by !== req.user.id) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este treino' });
    }
    
    // Excluir o treino (as exclusões em workout_exercises serão feitas via trigger no banco)
    const { error: deleteError } = await supabase
      .from('workouts')
      .delete()
      .eq('id', req.params.id);
    
    if (deleteError) throw deleteError;
    
    res.json({ message: 'Treino excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir treino:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gerar PDF do treino
router.get('/:id/pdf', checkAuth, async (req, res) => {
  try {
    // Buscar treino com exercícios
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises(
          *,
          exercise(*)
        ),
        student:user_id(
          id,
          email,
          user_metadata
        ),
        trainer:created_by(
          id,
          email,
          user_metadata
        )
      `)
      .eq('id', req.params.id)
      .single();
    
    if (workoutError || !workout) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }
    
    // Verificar acesso
    if (workout.user_id !== req.user.id && 
        workout.created_by !== req.user.id && 
        req.user.user_metadata.user_type !== 'trainer') {
      return res.status(403).json({ error: 'Acesso não autorizado a este treino' });
    }
    
    // Formatar os exercícios para o gerador de PDF
    const exercises = workout.workout_exercises.map(we => ({
      id: we.exercise.id,
      name: we.exercise.name,
      sets: we.sets,
      reps: we.reps,
      rest_seconds: we.rest_seconds,
      notes: we.notes
    }));
    
    // Formatar os dados do usuário
    const user = {
      id: workout.student.id,
      name: workout.student.user_metadata.name,
      email: workout.student.email
    };
    
    // Formatar os dados do treino
    const workoutData = {
      id: workout.id,
      name: workout.name,
      description: workout.description,
      category: workout.category,
      duration: workout.duration,
      difficulty: workout.difficulty,
      exercises
    };
    
    // Gerar o PDF
    const pdfPath = await generateWorkoutPDF(workoutData, user);
    
    // Configurar para excluir o arquivo após o download
    res.on('finish', () => {
      cleanupPDF(pdfPath);
    });
    
    // Enviar o arquivo
    res.download(pdfPath, `treino_${workout.name.replace(/\s+/g, '_')}.pdf`);
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 