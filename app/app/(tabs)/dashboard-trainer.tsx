import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardTrainerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Dashboard (Treinador)</Text>
      {/* Conteúdo do dashboard do treinador aqui */}
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