import React from 'react';
import { Linking, Text, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { C } from '../theme';

const abrir = async (url) => {
  try { await Linking.openURL(url); } catch (e) { Alert.alert('Ups', 'No se pudo abrir el enlace.'); }
};

export default function Acerca() {
  return (
    <View style={s.c}>
      <Text style={{ fontSize: 70 }}>🐜</Text>
      <Text style={s.t}>Caminito v1.0</Text>
      <Text style={s.p}>Proyecto de Desarrollo Móvil · Expo + React Native</Text>
      <TouchableOpacity style={s.b} onPress={() => abrir('https://hormigas.wiki/tipos-de-hormigas/')}>
        <Text style={s.bt}>🌐 Sobre las hormigas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.b} onPress={() => abrir('https://github.com/TU_USUARIO/Caminito')}>
        <Text style={s.bt}>💻 Mi GitHub</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.crema, alignItems: 'center', justifyContent: 'center', padding: 24 },
  t: { fontSize: 26, fontWeight: 'bold', color: C.cafe },
  p: { color: C.cafe, marginVertical: 8, textAlign: 'center' },
  b: { backgroundColor: C.hoja, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, marginTop: 12 },
  bt: { color: '#fff', fontWeight: 'bold' },
});