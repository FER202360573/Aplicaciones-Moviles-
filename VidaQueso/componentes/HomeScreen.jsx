import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={{ fontSize: 80 }}>🧀</Text>
        <Text style={styles.title}>¡Bienvenido a VidaQueso!</Text>
        <Text style={styles.subtitle}>
          Accede a tus utilidades del súper, calculadoras y entretenimiento en el menú inferior.
        </Text>

        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => navigation.navigate('HerramientasTab')}
        >
          <Text style={styles.btnText}>Ir a las Herramientas 🛠️</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.btnSecondary]} 
          onPress={() => navigation.navigate('Características')}
        >
          <Text style={styles.btnText}>Ver 4 Características 📖</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#3E2723', marginTop: 15, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#5D4037', textAlign: 'center', marginVertical: 15, lineHeight: 22 },
  btn: { backgroundColor: '#FFA000', paddingVertical: 14, paddingHorizontal: 25, borderRadius: 10, marginTop: 10, width: '100%', alignItems: 'center' },
  btnSecondary: { backgroundColor: '#5D4037' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});