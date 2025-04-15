import React from 'react';
import { Tabs } from 'expo-router';
import { useAuth } from '../../components/auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, Platform } from 'react-native';

export default function TabLayout() {
  const { user } = useAuth();
  const userType = user?.user_metadata?.user_type || 'student';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          height: 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
        },
        headerShown: false,
      }}
    >
      {userType === 'student' ? (
        <>
          <Tabs.Screen
            name="dashboard-student"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="workouts"
            options={{
              title: 'Treinos',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="barbell-outline" size={size} color={color} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="progress"
            options={{
              title: 'Progresso',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="trending-up-outline" size={size} color={color} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="profile-student"
            options={{
              title: 'Perfil',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
        </>
      ) : (
        <>
          <Tabs.Screen
            name="dashboard-trainer"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="students"
            options={{
              title: 'Alunos',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people-outline" size={size} color={color} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="workouts-trainer"
            options={{
              title: 'Treinos',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="barbell-outline" size={size} color={color} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="profile-trainer"
            options={{
              title: 'Perfil',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
        </>
      )}
    </Tabs>
  );
} 