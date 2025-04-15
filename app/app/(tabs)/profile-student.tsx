import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuth } from '../../components/auth/AuthContext'; // Verifique se o caminho está correto

export default function ProfileStudentScreen() {
  const { signOut, user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Perfil (Aluno)</Text>
      <Text>Email: {user?.email}</Text>
      {/* Conteúdo do perfil do aluno aqui */}
      <Button title="Sair" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20, // Adiciona espaçamento entre os itens
  },
  text: {
    fontSize: 20,
  },
});