/*import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
*/
import { useState } from 'react';
import { View, Text, TouchableOpacity, Keyboard, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import InsertarProducto from './components/InsertarProducto';
import ConsultarProductos from './components/ConsultarProductos';
import ActualizarProducto from './components/ActualizarProducto';
import EliminarProducto from './components/EliminarProducto';


//Comprobación para la conexión de supabase
/*export default function App() {
  const [estado, setEstado] = useState('Conectando...');

  useEffect(() => {
    const probar = async () => {
      const { error } = await supabase.from('productos').select('id').limit(1);
      setEstado(error ? `Error: ${error.message}` : 'Conectado a Supabase');
    };
    probar();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{estado}</Text>
    </View>
  );
*/

const OPCIONES = [
  { id: 'insertar', titulo: 'Insertar', Componente: InsertarProducto },
  { id: 'consultar', titulo: 'Consultar', Componente: ConsultarProductos },
  { id: 'actualizar', titulo: 'Actualizar', Componente: ActualizarProducto },
  { id: 'eliminar', titulo: 'Eliminar', Componente: EliminarProducto },
];

export default function App() {
  const [activo, setActivo] = useState('insertar');
  const { Componente } = OPCIONES.find((o) => o.id === activo);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.pantalla}>
        <StatusBar style="dark" />

        <View style={styles.encabezado}>
          <Text style={styles.titulo}>Persistencia</Text>
          <TouchableOpacity style={styles.botonTeclado} onPress={Keyboard.dismiss}>
            <Text style={styles.textoTeclado}>⌨ Bajar teclado</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          {OPCIONES.map((o) => (
            <TouchableOpacity
              key={o.id}
              style={[styles.tab, activo === o.id && styles.tabActivo]}
              onPress={() => setActivo(o.id)}
            >
              <Text style={[styles.tabTexto, activo === o.id && styles.tabTextoActivo]}>
                {o.titulo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contenido}>
          <Componente />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#fff' },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  botonTeclado: { backgroundColor: '#eee', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  textoTeclado: { color: '#111', fontSize: 13 },
  menu: { flexDirection: 'row', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActivo: { borderBottomColor: '#2563eb' },
  tabTexto: { color: '#666', fontSize: 14 },
  tabTextoActivo: { color: '#2563eb', fontWeight: 'bold' },
  contenido: { flex: 1, backgroundColor: '#fff' },
});

