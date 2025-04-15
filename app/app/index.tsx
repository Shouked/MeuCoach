import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../components/auth/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function WelcomePage() {
  const { user, loading } = useAuth();

  // Se o usuário já estiver autenticado, redirecionar para a área apropriada
  if (!loading && user) {
    const userType = user.user_metadata?.user_type;
    
    console.log(`Redirecionando usuário logado com tipo: ${userType}`);
    
    if (userType === 'trainer') {
      router.replace('/(tabs)/dashboard-trainer');
    } else if (userType === 'student') {
      router.replace('/(tabs)/dashboard-student');
    } else {
      console.warn(`Tipo de usuário inválido ou ausente: ${userType}. Redirecionando para dashboard de aluno.`);
      router.replace('/(tabs)/dashboard-student');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>Meu Coach</Text>
        <Text style={styles.subtitle}>Seu app de treino personalizado</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.buttonOutline]}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={[styles.buttonText, styles.buttonTextOutline]}>Criar conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonTextOutline: {
    color: '#3B82F6',
  },
}); 