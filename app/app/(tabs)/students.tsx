import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StudentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Alunos (Treinador)</Text>
      {/* Conteúdo da lista de alunos aqui */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});