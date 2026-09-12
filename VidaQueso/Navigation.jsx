import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import SplashScreen from './componentes/SplashScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// --- PANTALLAS DEL TAB NAVIGATOR (HERRAMIENTAS) ---
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

// TAB NAVIGATOR (Menú inferior con 4 pestañas)
function NavTab() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FFA000',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold', paddingBottom: 3 },
        tabBarStyle: { height: 60, paddingTop: 5 },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Súper') return <Ionicons name="cart-outline" size={size} color={color} />;
          if (route.name === 'IMC') return <MaterialCommunityIcons name="scale-bathroom" size={size} color={color} />;
          if (route.name === 'Propinas') return <Ionicons name="cash-outline" size={size} color={color} />;
          if (route.name === 'Dado') return <MaterialCommunityIcons name="dice-multiple-outline" size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Súper" component={ListaSuperScreen} />
      <Tab.Screen name="IMC" component={ImcScreen} />
      <Tab.Screen name="Propinas" component={PropinasScreen} />
      <Tab.Screen name="Dado" component={DadoScreen} />
    </Tab.Navigator>
  );
}

// PANTALLA REUTILIZABLE DE CARACTERÍSTICAS
function CaracteristicaScreen({ route }) {
  const { titulo, desc, icon } = route.params;
  return (
    <View style={styles.centeredContainer}>
      <MaterialCommunityIcons name={icon} size={80} color="#FFA000" />
      <Text style={styles.cardTitle}>{titulo}</Text>
      <Text style={styles.descText}>{desc}</Text>
    </View>
  );
}

// DRAWER NAVIGATOR (Menú lateral con Herramientas y las 4 Características)
function NavDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFD54F' },
        headerTintColor: '#3E2723',
        drawerActiveTintColor: '#FFA000',
        drawerInactiveTintColor: '#5D4037',
        drawerLabelStyle: { fontWeight: 'bold' },
      }}
    >
      <Drawer.Screen
        name="Herramientas"
        component={NavTab}
        options={{
          title: 'Herramientas 🛠️',
          drawerIcon: ({ color, size }) => <Ionicons name="construct-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AromaSabor"
        component={CaracteristicaScreen}
        initialParams={{ titulo: '1. Aroma y Sabor', desc: 'Notas lácticas dulces, suaves, curadas o de gran intensidad.', icon: 'scent' }}
        options={{
          title: '1. Aroma y Sabor',
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="scent" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Textura"
        component={CaracteristicaScreen}
        initialParams={{ titulo: '2. Textura', desc: 'Puede ser blanda, semidura, firme, untable o deshebrable.', icon: 'hand-pointing-right' }}
        options={{
          title: '2. Textura',
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="hand-pointing-right" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Maduracion"
        component={CaracteristicaScreen}
        initialParams={{ titulo: '3. Maduración', desc: 'El periodo en cueva o cámara que le da su consistencia y cuerpo.', icon: 'timer-sand' }}
        options={{
          title: '3. Maduración',
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="timer-sand" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="TipoLeche"
        component={CaracteristicaScreen}
        initialParams={{ titulo: '4. Tipo de Leche', desc: 'Elaborados con leche de vaca, cabra, oveja o búfala.', icon: 'cow' }}
        options={{
          title: '4. Tipo de Leche',
          drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="cow" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}

// STACK PRINCIPAL QUE EXPORTAMOS
export default function Navigation() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="MainApp" component={NavDrawer} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6', padding: 20, justifyContent: 'center' },
  centeredContainer: { flex: 1, backgroundColor: '#FFF9E6', justifyContent: 'center', alignItems: 'center', padding: 25 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#3E2723', textAlign: 'center' },
  descText: { fontSize: 16, color: '#5D4037', textAlign: 'center', lineHeight: 24 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#FAFAFA' },
  inputFlex: { flex: 1, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginRight: 8, backgroundColor: '#FAFAFA' },
  btn: { backgroundColor: '#FFA000', justifyContent: 'center', paddingHorizontal: 15, borderRadius: 8 },
  btnBlock: { backgroundColor: '#FFA000', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  listText: { fontSize: 16, marginVertical: 4, color: '#424242' },
  resultText: { marginTop: 15, fontSize: 18, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center' },
});