import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../components/auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

// Componente de Card para Workout
const WorkoutCard = ({ workout, onPress }) => (
  <TouchableOpacity 
    style={styles.workoutCard}
    onPress={onPress}
  >
    <View style={styles.workoutHeader}>
      <Text style={styles.workoutTitle}>{workout.name}</Text>
      <View style={styles.workoutBadge}>
        <Text style={styles.workoutBadgeText}>{workout.category}</Text>
      </View>
    </View>
    
    <View style={styles.workoutContent}>
      <View style={styles.workoutStat}>
        <Ionicons name="time-outline" size={16} color="#64748B" />
        <Text style={styles.workoutStatText}>{workout.duration} min</Text>
      </View>
      
      <View style={styles.workoutStat}>
        <Ionicons name="barbell-outline" size={16} color="#64748B" />
        <Text style={styles.workoutStatText}>{workout.exercises} exercícios</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// Componente Principal
export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextWorkout, setNextWorkout] = useState<any>(null); // Tipar adequadamente depois
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]); // Tipar adequadamente depois
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    streak: 0, // Manter simulado por enquanto
    minutesThisWeek: 0, // Manter simulado por enquanto
  });

  useEffect(() => {
    if (user) { // Garantir que user não seja null
      fetchDashboardData();
    }
  }, [user]); // Adicionar user como dependência

  const fetchDashboardData = async () => {
    if (!user) return; // Não fazer nada se user for null

    setLoading(!refreshing); // Só mostra loading inicial, não no refresh
    try {
      // Buscar próximo treino agendado para o usuário
      const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const { data: nextWorkoutData, error: nextWorkoutError } = await supabase
        .from('student_workouts') // Tabela de relação aluno-treino
        .select(`
          id,
          scheduled_date,
          status,
          workout:workouts (
            id,
            name,
            category,
            duration,
            exercises
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'pending') // Apenas treinos não concluídos
        .gte('scheduled_date', today) // A partir de hoje
        .order('scheduled_date', { ascending: true })
        .limit(1)
        .maybeSingle(); // Retorna um único objeto ou null

      if (nextWorkoutError) throw nextWorkoutError;
      // Extrair dados do treino se existir
      setNextWorkout(nextWorkoutData ? { 
        ...nextWorkoutData.workout, 
        scheduled_date: nextWorkoutData.scheduled_date 
      } : null);

      // Buscar treinos concluídos recentes (últimos 5)
      const { data: recentWorkoutsData, error: recentWorkoutsError } = await supabase
        .from('student_workouts')
        .select(`
          id,
          completed_at, 
          workout:workouts (
            id,
            name,
            category,
            duration,
            exercises
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(5);

      if (recentWorkoutsError) throw recentWorkoutsError;
      // Mapear para o formato esperado, extraindo dados do treino
      setRecentWorkouts(
        recentWorkoutsData?.map(log => ({ 
          ...log.workout, 
          completed_date: log.completed_at 
        })) || []
      );

      // Buscar contagem total de treinos concluídos
      const { count: totalWorkoutsCount, error: countError } = await supabase
        .from('student_workouts')
        .select('* ', { count: 'exact', head: true }) // Apenas conta
        .eq('student_id', user.id)
        .eq('status', 'completed');

      if (countError) throw countError;
      
      setStats(prevStats => ({
        ...prevStats,
        totalWorkouts: totalWorkoutsCount || 0,
        // Manter streak e minutes simulados por enquanto
        streak: prevStats.streak === 0 ? 3 : prevStats.streak, // Exemplo de lógica simulada 
        minutesThisWeek: prevStats.minutesThisWeek === 0 ? 145 : prevStats.minutesThisWeek // Exemplo
      }));

    } catch (error: any) {
      console.error('Erro ao buscar dados do dashboard:', error.message);
      // Adicionar feedback para o usuário, se necessário (e.g., Alert)
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Loading inicial
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Olá, {user?.user_metadata?.name?.split(' ')[0] || 'Aluno'}
          </Text>
          <Text style={styles.subtitle}>
            Confira seus treinos e progresso
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/profile-student')}
        >
          {user?.user_metadata?.avatar_url ? (
            <Image 
              source={{ uri: user.user_metadata.avatar_url }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>
                {user?.user_metadata?.name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
          />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Treinos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Dia(s) seguido(s)</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.minutesThisWeek}</Text>
            <Text style={styles.statLabel}>Min. esta semana</Text>
          </View>
        </View>
        
        {/* Próximo treino */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximo treino</Text>
          
          {nextWorkout ? (
            <WorkoutCard 
              workout={nextWorkout}
              onPress={() => router.push(`/(tabs)/workouts?id=${nextWorkout.id}`)}
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Nenhum treino agendado.
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push('/(tabs)/workouts')}
              >
                <Text style={styles.emptyStateButtonText}>
                  Ver todos os treinos
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Treinos recentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Treinos recentes</Text>
          
          {recentWorkouts.length > 0 ? (
            recentWorkouts.map(workout => (
              <WorkoutCard 
                key={workout.id}
                workout={workout}
                onPress={() => router.push(`/(tabs)/workouts?id=${workout.id}`)}
              />
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Você ainda não completou nenhum treino.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: 40,
    height: 40,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  workoutBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  workoutBadgeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  workoutContent: {
    flexDirection: 'row',
    gap: 16,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatText: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyStateContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 