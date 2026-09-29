import React, { useState } from 'react';
import { Modal, Share, Text, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import * as Haptics from 'expo-haptics';
import { useGame } from './GameContext';
import { C } from './theme';

export default function DrawerContent(props) {
  const { g, addPasos, reiniciar } = useGame();
  const [modal, setModal] = useState(null); // 'instr' | 'reset'

  const item = (txt, fn) => (
    <TouchableOpacity style={s.item} onPress={fn}><Text style={s.txt}>{txt}</Text></TouchableOpacity>
  );

  const compartir = async () => {
    try { await Share.share({ message: `¡Llevo ${g.pasos} pasos y ${g.puntos} puntos en Caminito! 🐜` }); }
    catch (e) { Alert.alert('Ups', 'No se pudo compartir.'); }
  };

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: C.arena }}>
      <Text style={s.titulo}>🐜 Caminito</Text>
      {item('🏠  Aventura', () => props.navigation.navigate('Aventura'))}
      {item('📖  Instrucciones', () => setModal('instr'))}
      {item('🧪  Simular 10 pasos', () => { addPasos(10); Haptics.selectionAsync(); })}
      {item('📤  Compartir progreso', compartir)}
      {item('ℹ️  Acerca de', () => props.navigation.navigate('Acerca'))}
      {item('🔄  Reiniciar progreso', () => setModal('reset'))}

      <Modal transparent animationType="fade" visible={!!modal} onRequestClose={() => setModal(null)}>
        <View style={s.fondo}>
          <View style={s.caja}>
            {modal === 'instr' ? (
              <>
                <Text style={s.h}>Cómo jugar</Text>
                <Text style={s.p}>Camina: cada 10 pasos avanzas una casilla. Cada 100 pasos encuentras un cofre 🎁: tira el dado. Par = premio (🪼 🦕 🪿). Impar = retrocedes 20 pasos. 🐜 Dato: una hormiga puede cargar 50 veces su peso.</Text>
                <TouchableOpacity style={s.btn} onPress={() => setModal(null)}><Text style={s.btnT}>Entendido</Text></TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={s.h}>¿Reiniciar todo?</Text>
                <Text style={s.p}>Perderás pasos, puntos y premios.</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity style={[s.btn, { backgroundColor: C.gris }]} onPress={() => setModal(null)}><Text style={s.btnT}>Cancelar</Text></TouchableOpacity>
                  <TouchableOpacity style={s.btn} onPress={() => { reiniciar(); setModal(null); }}><Text style={s.btnT}>Reiniciar</Text></TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </DrawerContentScrollView>
  );
}

const s = StyleSheet.create({
  titulo: { fontSize: 26, fontWeight: 'bold', color: C.cafe, padding: 16 },
  item: { paddingVertical: 14, paddingHorizontal: 16 },
  txt: { fontSize: 16, color: C.cafe },
  fondo: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 24 },
  caja: { backgroundColor: C.crema, borderRadius: 16, padding: 20 },
  h: { fontSize: 20, fontWeight: 'bold', color: C.cafe, marginBottom: 8 },
  p: { fontSize: 15, color: C.cafe, marginBottom: 16 },
  btn: { backgroundColor: C.hoja, padding: 12, borderRadius: 10, alignItems: 'center', flex: 1 },
  btnT: { color: '#fff', fontWeight: 'bold' },
});