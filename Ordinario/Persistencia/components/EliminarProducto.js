import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function EliminarProducto() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: true });
    if (error) Alert.alert('Error', error.message);
    else setProductos(data);
    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const eliminar = async (item) => {
    const { data, error } = await supabase
      .from('productos')
      .delete()
      .eq('id', item.id)
      .select();

    if (error) {
      Alert.alert('Error al eliminar', error.message);
      return;
    }
    if (!data || data.length === 0) {
      Alert.alert('No se eliminó nada', 'Revisa que exista la política de DELETE en Supabase.');
      return;
    }

    setProductos((prev) => prev.filter((p) => p.id !== item.id));
    Alert.alert('Listo ✅', `Se eliminó "${item.producto}" (ID ${item.id}).`);
  };

  const confirmar = (item) => {
    Alert.alert('Eliminar producto', `¿Seguro que quieres eliminar "${item.producto}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(item) },
    ]);
  };

  if (cargando) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Eliminar producto</Text>
      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<Text style={styles.vacio}>No hay productos.</Text>}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{item.producto}</Text>
              <Text style={styles.detalle}>ID {item.id} · ${item.precio}</Text>
            </View>
            <TouchableOpacity style={styles.botonEliminar} onPress={() => confirmar(item)}>
              <Text style={styles.botonTexto}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 16, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#111' },
  vacio: { textAlign: 'center', marginTop: 30, color: '#666' },
  tarjeta: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 8, backgroundColor: '#fafafa' },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  detalle: { color: '#555', marginTop: 2 },
  botonEliminar: { backgroundColor: '#dc2626', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  botonTexto: { color: '#fff', fontWeight: 'bold' },
});