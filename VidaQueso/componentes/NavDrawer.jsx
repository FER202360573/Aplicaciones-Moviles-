import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function NavDrawer() {
  const caracteristicas = [
    { id: '1', titulo: '1. Aroma y Sabor', desc: 'Notas lácticas dulces, suaves, curadas o de gran intensidad.' },
    { id: '2', titulo: '2. Textura', desc: 'Puede ser blanda, semidura, firme, untable o deshebrable.' },
    { id: '3', titulo: '3. Maduración', desc: 'El periodo en cueva o cámara que le da su consistencia y cuerpo.' },
    { id: '4', titulo: '4. Tipo de Leche', desc: 'Elaborados con leche de vaca, cabra, oveja o búfala.' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>4 Características de un Queso 🧀</Text>
      {caracteristicas.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.title}>{item.titulo}</Text>
          <Text style={styles.desc}>{item.desc}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6', padding: 15 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#3E2723', textAlign: 'center', marginVertical: 15 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 8, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFA000', marginBottom: 5 },
  desc: { fontSize: 15, color: '#424242' },
});