import React, { useState } from 'react';
import { Alert, Modal, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import * as Haptics from 'expo-haptics';
import { useGame } from './GameContext';
import { C } from './theme';

export default function DrawerContent(props) {
  const { g, addPasos, reiniciar, desbloquearTodos } = useGame();
  const [reset, setReset] = useState(false);

  // Nombre de la sección actual del Drawer
  const actual = props.state.routes[props.state.index].name;

  // Con "ruta" el item se resalta si es la sección actual
  const item = (txt, fn, ruta) => {
    const activo = ruta && ruta === actual;
    return (
      <TouchableOpacity style={[s.item, activo && s.itemActivo]} onPress={fn} activeOpacity={0.6}>
        <Text style={[s.txt, activo && s.txtActivo]}>{txt}</Text>
      </TouchableOpacity>
    );
  };

  const compartir = async () => {
    try { await Share.share({ message: `¡Llevo ${g.pasos} pasos y ${g.puntos} puntos en Caminito! 🐜` }); }
    catch (e) { Alert.alert('Ups', 'No se pudo compartir.'); }
  };

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: C.arena }}>
      <Text style={s.titulo}>🐜 Caminito</Text>
      {item('🏠  Aventura', () => props.navigation.navigate('Aventura'), 'Aventura')}
      {item('📖  Instrucciones', () => props.navigation.navigate('Instrucciones'), 'Instrucciones')}
      {item('ℹ️  Acerca de', () => props.navigation.navigate('Acerca'), 'Acerca')}

      <View style={s.sep} />
      {item('🧪  Simular 10 pasos', () => { addPasos(10); Haptics.selectionAsync(); })}
      {item('🔓  Desbloquear todos (prueba)', () => { desbloquearTodos(); Haptics.selectionAsync(); })}
      {item('📤  Compartir progreso', compartir)}
      {item('🔄  Reiniciar progreso', () => setReset(true))}

      <Modal transparent animationType="fade" visible={reset} onRequestClose={() => setReset(false)}>
        <View style={s.fondo}>
          <View style={s.caja}>
            <Text style={s.h}>¿Reiniciar todo?</Text>
            <Text style={s.p}>Perderás pasos, puntos y premios.</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={[s.btn, { backgroundColor: C.gris }]} onPress={() => setReset(false)}><Text style={s.btnT}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={s.btn} onPress={() => { reiniciar(); setReset(false); }}><Text style={s.btnT}>Reiniciar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </DrawerContentScrollView>
  );
}

const s = StyleSheet.create({
  titulo: { fontSize: 26, fontWeight: 'bold', color: C.cafe, padding: 16 },
  item: { paddingVertical: 14, paddingHorizontal: 16, marginHorizontal: 8, borderRadius: 12, borderLeftWidth: 5, borderLeftColor: 'transparent' },
  itemActivo: { backgroundColor: 'rgba(93,64,55,0.18)', borderLeftColor: C.hoja },
  txt: { fontSize: 16, color: C.cafe },
  txtActivo: { fontWeight: 'bold' },
  sep: { height: 1, backgroundColor: 'rgba(93,64,55,0.25)', marginVertical: 8, marginHorizontal: 16 },
  fondo: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 24 },
  caja: { backgroundColor: C.crema, borderRadius: 16, padding: 20 },
  h: { fontSize: 20, fontWeight: 'bold', color: C.cafe, marginBottom: 8 },
  p: { fontSize: 15, color: C.cafe, marginBottom: 16 },
  btn: { backgroundColor: C.hoja, padding: 12, borderRadius: 10, alignItems: 'center', flex: 1 },
  btnT: { color: '#fff', fontWeight: 'bold' },
});