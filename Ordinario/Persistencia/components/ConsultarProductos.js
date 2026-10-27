import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ConsultarProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: true });

    if (error) setError(error.message);
    else {
      setError(null);
      setProductos(data);
    }
    setCargando(false);
    setRefrescando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Productos ({productos.length})</Text>
      {error && <Text style={styles.error}>❌ {error}</Text>}

      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.id)}
        refreshing={refrescando}
        onRefresh={() => {
          setRefrescando(true);
          cargar();
        }}
        ListEmptyComponent={<Text style={styles.vacio}>No hay productos registrados.</Text>}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <Text style={styles.nombre}>{item.producto}</Text>
            <Text style={styles.descripcion}>{item.descripcion}</Text>
            <Text style={styles.precio}>${item.precio}</Text>
            <Text style={styles.id}>ID: {item.id}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 16, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#111' },
  error: { color: 'red', marginBottom: 8 },
  vacio: { textAlign: 'center', marginTop: 30, color: '#666' },
  tarjeta: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10, backgroundColor: '#fafafa' },
  nombre: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  descripcion: { color: '#444', marginVertical: 4 },
  precio: { color: '#16a34a', fontWeight: 'bold', fontSize: 16 },
  id: { color: '#999', fontSize: 12, marginTop: 4 },
});