import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../components/auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { StatusBar } from 'expo-status-bar';

// Tipos
interface Workout {
  id: number;
  name: string;
  description: string;
  category: string;
  duration: number;
  difficulty: 'iniciante' | 'intermediário' | 'avançado';
  exercises: number;
  completed?: boolean;
  image_url?: string;
}

// Componente de Card para Workout
const WorkoutCard = ({ workout, onPress }) => (
  <TouchableOpacity 
    style={styles.workoutCard}
    onPress={onPress}
  >
    <View style={styles.workoutCardContent}>
      <View style={styles.workoutInfo}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>{workout.name}</Text>
          <View style={[
            styles.difficultyBadge, 
            workout.difficulty === 'iniciante' ? styles.beginnerBadge :
            workout.difficulty === 'intermediário' ? styles.intermediateBadge :
            styles.advancedBadge
          ]}>
            <Text style={styles.difficultyText}>{workout.difficulty}</Text>
          </View>
        </View>
        
        <Text numberOfLines={2} style={styles.workoutDescription}>
          {workout.description}
        </Text>
        
        <View style={styles.workoutMeta}>
          <View style={styles.workoutStat}>
            <Ionicons name="time-outline" size={16} color="#64748B" />
            <Text style={styles.workoutStatText}>{workout.duration} min</Text>
          </View>
          
          <View style={styles.workoutStat}>
            <Ionicons name="barbell-outline" size={16} color="#64748B" />
            <Text style={styles.workoutStatText}>{workout.exercises} exercícios</Text>
          </View>
          
          <View style={styles.workoutBadge}>
            <Text style={styles.workoutBadgeText}>{workout.category}</Text>
          </View>
        </View>
      </View>
      
      {workout.image_url && (
        <Image 
          source={{ uri: workout.image_url }}
          style={styles.workoutImage}
          resizeMode="cover"
        />
      )}
    </View>
    
    {workout.completed && (
      <View style={styles.completedBanner}>
        <Ionicons name="checkmark-circle" size={16} color="#fff" />
        <Text style={styles.completedText}>Concluído</Text>
      </View>
    )}
  </TouchableOpacity>
);

// Componente Principal
export default function WorkoutsScreen() {
  const { user } = useAuth();
  const params = useSearchParams();
  const workoutId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [detailedWorkout, setDetailedWorkout] = useState<Workout | null>(null);

  // Carregar treinos
  useEffect(() => {
    fetchWorkouts();
  }, []);
  
  // Se houver um ID específico, mostrar detalhes
  useEffect(() => {
    if (workoutId) {
      fetchWorkoutDetails(Number(workoutId));
    } else {
      setDetailedWorkout(null);
    }
  }, [workoutId]);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      // Em produção, buscar dados do Supabase
      // const { data, error } = await supabase
      //   .from('workouts')
      //   .select('*')
      //   .eq('user_id', user.id);
      
      // if (error) throw error;
      
      // Simulando dados para desenvolvimento
      setTimeout(() => {
        const mockWorkouts: Workout[] = [
          {
            id: 1,
            name: 'Treino Full Body',
            description: 'Treino completo para trabalhar todos os grupos musculares principais em uma única sessão.',
            category: 'Força',
            duration: 45,
            difficulty: 'intermediário',
            exercises: 8,
            completed: true,
            image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z3ltJTIwd29ya291dHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 2,
            name: 'Treino de Pernas',
            description: 'Foco em quadríceps, posteriores, glúteos e panturrilhas para hipertrofia.',
            category: 'Hipertrofia',
            duration: 60,
            difficulty: 'avançado',
            exercises: 10,
            image_url: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bGVnJTIwd29ya291dHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 3,
            name: 'Cardio Intenso',
            description: 'Treino intervalado de alta intensidade para queima de gordura e condicionamento.',
            category: 'Cardio',
            duration: 30,
            difficulty: 'iniciante',
            exercises: 5,
            completed: false,
            image_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cnVubmluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 4,
            name: 'Treino de Braços',
            description: 'Foco em bíceps, tríceps e antebraços para ganho de força e volume.',
            category: 'Hipertrofia',
            duration: 40,
            difficulty: 'intermediário',
            exercises: 6,
            completed: false,
            image_url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXJtJTIwd29ya291dHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
          },
          {
            id: 5,
            name: 'Alongamento e Mobilidade',
            description: 'Aumenta a flexibilidade e previne lesões com foco em mobilidade articular.',
            category: 'Recuperação',
            duration: 25,
            difficulty: 'iniciante',
            exercises: 12,
            completed: true,
            image_url: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHN0cmV0Y2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
          },
        ];
        
        setWorkouts(mockWorkouts);
        
        // Extrair categorias únicas
        const uniqueCategories = [...new Set(mockWorkouts.map(w => w.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao buscar treinos:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchWorkoutDetails = async (id: number) => {
    // Em produção, buscar detalhes do treino específico do Supabase
    // Aqui usamos a mesma lista simulada
    const workout = workouts.find(w => w.id === id);
    setDetailedWorkout(workout || null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  };

  const filteredWorkouts = selectedCategory 
    ? workouts.filter(workout => workout.category === selectedCategory) 
    : workouts;

  // Renderizar detalhes do treino se um ID específico for fornecido
  if (detailedWorkout) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setDetailedWorkout(null)}
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Treino</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.content}>
          {/* Implementar detalhes do treino e lista de exercícios */}
          <Text>Detalhes em construção...</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Treinos</Text>
      </View>
      
      {/* Filtros de categoria */}
      <View style={styles.categoryFilters}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          <TouchableOpacity 
            style={[
              styles.categoryChip, 
              selectedCategory === null && styles.categoryChipSelected
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === null && styles.categoryChipTextSelected
            ]}>
              Todos
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity 
              key={category}
              style={[
                styles.categoryChip, 
                selectedCategory === category && styles.categoryChipSelected
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextSelected
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Carregando treinos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredWorkouts}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <WorkoutCard 
              workout={item}
              onPress={() => fetchWorkoutDetails(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="fitness-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>
                Nenhum treino encontrado para esta categoria.
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={styles.emptyButtonText}>Ver todos os treinos</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ScrollView para o caso de detailedWorkout
const ScrollView = ({ children, style }) => {
  return (
    <View style={style}>
      {children}
    </View>
  );
};

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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  backButton: {
    padding: 4,
  },
  categoryFilters: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748B',
  },
  categoryChipTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    padding: 16,
  },
  workoutCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  workoutCardContent: {
    padding: 16,
    flexDirection: 'row',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 8,
  },
  beginnerBadge: {
    backgroundColor: '#DCFCE7',
  },
  intermediateBadge: {
    backgroundColor: '#FEF9C3',
  },
  advancedBadge: {
    backgroundColor: '#FEE2E2',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  workoutBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
  },
  workoutBadgeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  workoutImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: 12,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 6,
    gap: 4,
  },
  completedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  }
}); 