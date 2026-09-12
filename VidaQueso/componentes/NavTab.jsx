import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

// 1. Pestaña: Lista del Súper
function ListaSuperScreen() {
  const [item, setItem] = useState('');
  const [items, setItems] = useState([]);
  const agregarItem = () => {
    if (item.trim()) {
      setItems([...items, item]);
      setItem('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🛒 Lista del Súper Quesero</Text>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <TextInput style={styles.inputFlex} placeholder="Ej. Queso Gouda 500g" value={item} onChangeText={setItem} />
          <TouchableOpacity style={styles.btn} onPress={agregarItem}><Text style={styles.btnText}>Agregar</Text></TouchableOpacity>
        </View>
        {items.map((it, idx) => <Text key={idx} style={styles.listText}>• {it}</Text>)}
      </View>
    </SafeAreaView>
  );
}

// 2. Pestaña: Calcular IMC
function ImcScreen() {
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [imc, setImc] = useState(null);
  const calcularIMC = () => {
    const p = parseFloat(peso);
    const a = parseFloat(altura);
    if (p && a) setImc((p / (a * a)).toFixed(2));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚖️ Calculadora de IMC</Text>
        <TextInput style={styles.input} placeholder="Peso en kg (Ej: 70)" keyboardType="numeric" value={peso} onChangeText={setPeso} />
        <TextInput style={styles.input} placeholder="Estatura en metros (Ej: 1.70)" keyboardType="numeric" value={altura} onChangeText={setAltura} />
        <TouchableOpacity style={styles.btnBlock} onPress={calcularIMC}><Text style={styles.btnText}>Calcular IMC</Text></TouchableOpacity>
        {imc && <Text style={styles.resultText}>Tu IMC es: {imc}</Text>}
      </View>
    </SafeAreaView>
  );
}

// 3. Pestaña: Calcular Propinas
function PropinasScreen() {
  const [total, setTotal] = useState('');
  const [propina, setPropina] = useState(null);
  const calcularPropina = () => {
    const t = parseFloat(total);
    if (t) setPropina((t * 0.1).toFixed(2));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🪙 Calcular Propina (10%)</Text>
        <TextInput style={styles.input} placeholder="Total de la cuenta ($)" keyboardType="numeric" value={total} onChangeText={setTotal} />
        <TouchableOpacity style={styles.btnBlock} onPress={calcularPropina}><Text style={styles.btnText}>Calcular Propina</Text></TouchableOpacity>
        {propina && <Text style={styles.resultText}>Propina sugerida: ${propina}</Text>}
      </View>
    </SafeAreaView>
  );
}

// 4. Pestaña: Lanzar Dados
function DadoScreen() {
  const [dado, setDado] = useState('🎲');
  const lanzarDado = () => {
    setDado(Math.floor(Math.random() * 6) + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎲 Lanzar Dado Quesero</Text>
        <Text style={{ fontSize: 80, textAlign: 'center', marginVertical: 20 }}>{dado}</Text>
        <TouchableOpacity style={styles.btnBlock} onPress={lanzarDado}><Text style={styles.btnText}>¡Lanzar Dado!</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Componente Principal NavTab
export default function NavTab() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' } }}>
      <Tab.Screen name="Súper" component={ListaSuperScreen} />
      <Tab.Screen name="IMC" component={ImcScreen} />
      <Tab.Screen name="Propinas" component={PropinasScreen} />
      <Tab.Screen name="Dado" component={DadoScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6', padding: 20, justifyContent: 'center' },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#3E2723', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#FAFAFA' },
  inputFlex: { flex: 1, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginRight: 8, backgroundColor: '#FAFAFA' },
  btn: { backgroundColor: '#FFA000', justifyContent: 'center', paddingHorizontal: 15, borderRadius: 8 },
  btnBlock: { backgroundColor: '#FFA000', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  listText: { fontSize: 16, marginVertical: 4, color: '#424242' },
  resultText: { marginTop: 15, fontSize: 18, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center' },
});