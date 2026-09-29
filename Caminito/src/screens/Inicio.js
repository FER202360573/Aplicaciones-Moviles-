import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useGame } from '../GameContext';
import { C } from '../theme';

export default function Inicio({ navigation }) {
  const { g } = useGame();
  const scale = useRef(new Animated.Value(0.5)).current;
  useEffect(() => { Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start(); }, []);

  return (
    <View style={s.c}>
      <Animated.Text style={{ fontSize: 100, transform: [{ scale }] }}>🐜</Animated.Text>
      <Text style={s.t}>¡Bienvenido a Caminito!</Text>
      <Text style={s.p}>Camina, tira el dado y colecciona 🪼 🦕 🪿</Text>
      <Text style={s.p}>Pasos guardados: {g.pasos}</Text>
      <TouchableOpacity style={s.b} onPress={() => navigation.navigate('Tabs')}>
        <Text style={s.bt}>Comenzar aventura</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.crema, alignItems: 'center', justifyContent: 'center', padding: 24 },
  t: { fontSize: 26, fontWeight: 'bold', color: C.cafe, marginTop: 12 },
  p: { fontSize: 16, color: C.cafe, marginTop: 6 },
  b: { backgroundColor: C.hoja, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30, marginTop: 28 },
  bt: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});