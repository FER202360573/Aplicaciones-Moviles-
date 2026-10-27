import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function InsertarProducto() {
  const [producto, setProducto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [cargando, setCargando] = useState(false);

  const guardar = async () => {
    if (!producto.trim() || !precio.trim()) {
      Alert.alert('Faltan datos', 'Producto y precio son obligatorios.');
      return;
    }

    setCargando(true);
    const { error } = await supabase.from('productos').insert({
      producto: producto.trim(),
      descripcion: descripcion.trim(),
      precio: parseFloat(precio),
    });
    setCargando(false);

    if (error) {
      Alert.alert('Error al guardar', error.message);
      return;
    }

    Alert.alert('Listo ✅', 'Producto guardado.');
    setProducto('');
    setDescripcion('');
    setPrecio('');
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Nuevo producto</Text>
      <TextInput style={styles.input} placeholder="Producto" value={producto} onChangeText={setProducto} />
      <TextInput style={styles.input} placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} />
      <TextInput style={styles.input} placeholder="Precio" value={precio} onChangeText={setPrecio} keyboardType="decimal-pad" />
      <Button title={cargando ? 'Guardando...' : 'Guardar'} onPress={guardar} disabled={cargando} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: 20, marginTop: 60 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
});