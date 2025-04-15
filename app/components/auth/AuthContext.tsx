import React, { createContext, useState, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, phone: string, password: string, userType: 'trainer' | 'student') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Configurar o ouvinte de alterações de estado de autenticação
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        // Log dos metadados do usuário para debug
        if (currentSession?.user) {
          console.log('User metadata from auth change:', currentSession.user.user_metadata);
        }
        
        // Persistir a sessão
        if (currentSession) {
          await AsyncStorage.setItem('supabase-session', JSON.stringify(currentSession));
        } else {
          await AsyncStorage.removeItem('supabase-session');
        }
      });
      
      // Carregar sessão do storage
      const loadSession = async () => {
        try {
          const storedSession = await AsyncStorage.getItem('supabase-session');
          
          if (storedSession) {
            const sessionData = JSON.parse(storedSession);
            
            // Verificar se a sessão ainda é válida
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            
            if (currentSession) {
              setSession(currentSession);
              setUser(currentSession.user);
            } else {
              // Se a sessão não for válida, remover do storage
              await AsyncStorage.removeItem('supabase-session');
            }
          }
        } catch (error) {
          console.error("Erro ao carregar sessão:", error);
        } finally {
          setLoading(false);
        }
      };
      
      loadSession();

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error("Erro na configuração de autenticação:", error);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      // O redirecionamento será feito pelo useEffect via onAuthStateChange
    } catch (error: any) {
      console.error('Erro no login:', error.message);
      Alert.alert('Erro', error.message === 'Invalid login credentials' 
        ? 'Credenciais inválidas' 
        : `Erro no login: ${error.message}`
      );
      throw error;
    }
  };

  const signUp = async (name: string, email: string, phone: string, password: string, userType: 'trainer' | 'student') => {
    try {
      // Incluir user_type e dados do usuário nos metadados
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            user_type: userType,
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      Alert.alert('Sucesso', 'Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.');
      // Retorna para a tela de login
      router.replace('/(auth)/login');
    } catch (error: any) {
      console.error('Erro no cadastro:', error.message);
      if (error.message.includes('already registered')) {
        Alert.alert('Erro', 'Este email já está cadastrado');
      } else {
        Alert.alert('Erro', `Erro no cadastro: ${error.message}`);
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      router.replace('/');
    } catch (error: any) {
      console.error('Erro ao sair:', error.message);
      Alert.alert('Erro', `Erro ao sair: ${error.message}`);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        throw error;
      }
      
      Alert.alert('Sucesso', 'Instruções para recuperar sua senha foram enviadas para seu email.');
    } catch (error: any) {
      console.error('Erro ao recuperar senha:', error.message);
      Alert.alert('Erro', `Erro ao recuperar senha: ${error.message}`);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        session, 
        user, 
        loading, 
        signIn, 
        signUp, 
        signOut, 
        resetPassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 