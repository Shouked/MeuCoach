import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function WorkoutsTrainerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Treinos (Treinador)</Text>
      {/* Conteúdo de gerenciamento de treinos aqui */}
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