import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, Text, View, StyleSheet } from 'react-native';
import { C } from '../theme';

const PASOS = [
  { e: '👣', t: 'Camina', d: 'Cada paso real cuenta. Cada 10 pasos tu personaje avanza una casilla del camino.' },
  { e: '🎁', t: 'Encuentra cofres', d: 'Cada 100 pasos aparece un cofre. Puedes abrirlo al momento o dejarlo para después.' },
  { e: '🎲', t: 'Tira el dado', d: 'Par: ganas un premio sorpresa. Impar: retrocedes 20 pasos. ¡Arriesga!' },
  { e: '🪼', t: 'Colecciona', d: 'Desbloquea la medusa, el dinosaurio y el ganso. Cada premio te da +50 puntos.' },
  { e: '🐜', t: 'Personaliza', d: 'En Progreso toca un icono desbloqueado para usarlo como tu personaje en el camino.' },
  { e: '✅', t: 'Cumple metas', d: 'Las metas van de 100 en 100 pasos y se marcan solas al superarlas.' },
];

function Tarjeta({ item, index }) {
  const op = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 450, delay: index * 120, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 450, delay: index * 120, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[s.card, { opacity: op, transform: [{ translateY: y }] }]}>
      <View style={s.num}><Text style={s.numT}>{index + 1}</Text></View>
      <Text style={s.emoji}>{item.e}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.t}>{item.t}</Text>
        <Text style={s.d}>{item.d}</Text>
      </View>
    </Animated.View>
  );
}

export default function Instrucciones() {
  return (
    <ScrollView style={{ backgroundColor: C.crema }} contentContainerStyle={s.c}>
      <View style={s.hero}>
        <Text style={{ fontSize: 60 }}>📖</Text>
        <Text style={s.hTitulo}>Cómo jugar</Text>
        <Text style={s.hSub}>Camina, abre cofres y colecciona</Text>
      </View>

      {PASOS.map((p, i) => <Tarjeta key={p.t} item={p} index={i} />)}

      <View style={s.dato}>
        <Text style={s.datoT}>🐜 Dato curioso</Text>
        <Text style={s.datoP}>Una hormiga puede cargar hasta 50 veces su propio peso. ¡Tú también puedes llegar lejos, paso a paso!</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  c: { padding: 16, paddingBottom: 40 },
  hero: { backgroundColor: C.cafe, borderRadius: 20, alignItems: 'center', padding: 20, marginBottom: 16 },
  hTitulo: { fontSize: 28, fontWeight: 'bold', color: C.arena, marginTop: 4 },
  hSub: { color: C.arena, opacity: 0.85, marginTop: 2 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  num: { position: 'absolute', top: -6, left: -6, backgroundColor: C.hoja, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  numT: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  emoji: { fontSize: 38, marginRight: 14 },
  t: { fontSize: 17, fontWeight: 'bold', color: C.cafe },
  d: { fontSize: 14, color: C.cafe, marginTop: 2 },
  dato: { backgroundColor: C.arena, borderRadius: 16, padding: 16, marginTop: 6, borderLeftWidth: 6, borderLeftColor: C.hoja },
  datoT: { fontWeight: 'bold', fontSize: 16, color: C.cafe, marginBottom: 4 },
  datoP: { color: C.cafe, fontSize: 14 },
});