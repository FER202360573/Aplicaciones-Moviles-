import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Alert, ActivityIndicator, StyleSheet,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function ActualizarProducto() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [producto, setProducto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [guardando, setGuardando] = useState(false);

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

  const elegir = (item) => {
    setSeleccionado(item);
    setProducto(item.producto ?? '');
    setDescripcion(item.descripcion ?? '');
    setPrecio(String(item.precio ?? ''));
  };

  const cancelar = () => {
    setSeleccionado(null);
    setProducto('');
    setDescripcion('');
    setPrecio('');
  };

  const guardar = async () => {
    if (!producto.trim() || !precio.trim()) {
      Alert.alert('Faltan datos', 'Producto y precio son obligatorios.');
      return;
    }

    setGuardando(true);
    const { data, error } = await supabase
      .from('productos')
      .update({
        producto: producto.trim(),
        descripcion: descripcion.trim(),
        precio: parseFloat(precio),
      })
      .eq('id', seleccionado.id)
      .select();
    setGuardando(false);

    if (error) {
      Alert.alert('Error al actualizar', error.message);
      return;
    }
    if (!data || data.length === 0) {
      Alert.alert('No se actualizó nada', 'Revisa que exista la política de UPDATE en Supabase.');
      return;
    }

    Alert.alert('Listo ✅', 'Producto actualizado.');
    cancelar();
    cargar();
  };

  if (cargando) return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Actualizar producto</Text>

      {seleccionado ? (
        <View style={styles.formulario}>
          <Text style={styles.editando}>Editando ID {seleccionado.id}</Text>
          <TextInput style={styles.input} placeholder="Producto" placeholderTextColor="#999" value={producto} onChangeText={setProducto} />
          <TextInput style={styles.input} placeholder="Descripción" placeholderTextColor="#999" value={descripcion} onChangeText={setDescripcion} />
          <TextInput style={styles.input} placeholder="Precio" placeholderTextColor="#999" value={precio} onChangeText={setPrecio} keyboardType="decimal-pad" />
          <View style={styles.fila}>
            <TouchableOpacity style={[styles.boton, styles.botonGuardar]} onPress={guardar} disabled={guardando}>
              <Text style={styles.botonTexto}>{guardando ? 'Guardando...' : 'Guardar cambios'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.boton, styles.botonCancelar]} onPress={cancelar}>
              <Text style={styles.botonTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.ayuda}>Toca un producto para editarlo:</Text>
      )}

      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.ayuda}>No hay productos.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tarjeta, seleccionado?.id === item.id && styles.tarjetaActiva]}
            onPress={() => elegir(item)}
          >
            <Text style={styles.nombre}>{item.producto}</Text>
            <Text style={styles.detalle}>{item.descripcion} · ${item.precio}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 16, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#111' },
  ayuda: { color: '#666', marginBottom: 10 },
  formulario: { marginBottom: 12 },
  editando: { fontWeight: 'bold', marginBottom: 8, color: '#2563eb' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10, color: '#111', backgroundColor: '#fff' },
  fila: { flexDirection: 'row', gap: 10 },
  boton: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  botonGuardar: { backgroundColor: '#2563eb' },
  botonCancelar: { backgroundColor: '#6b7280' },
  botonTexto: { color: '#fff', fontWeight: 'bold' },
  tarjeta: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 8, backgroundColor: '#fafafa' },
  tarjetaActiva: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  detalle: { color: '#555', marginTop: 2 },
});