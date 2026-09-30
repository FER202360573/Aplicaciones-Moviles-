import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, Linking, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useGame } from '../GameContext';
import usePedometer from '../usePedometer';
import { C, ICONOS } from '../theme';

const COLS = 5, TOTAL = 40, PASOS_CASILLA = 10;

const ORDEN = (() => {
  const a = [];
  for (let r = 0; r < TOTAL / COLS; r++) {
    const fila = Array.from({ length: COLS }, (_, c) => r * COLS + c);
    a.push(...(r % 2 ? fila.reverse() : fila));
  }
  return a;
})();

function Casilla({ i, actual, emoji }) {
  const y = useRef(new Animated.Value(0)).current;
  const esActual = i === actual;

  useEffect(() => {
    if (!esActual) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(y, { toValue: -6, duration: 350, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [esActual]);

  const cofre = i > 0 && i % 10 === 0;
  let contenido = <Text style={{ fontSize: 12 }}>{i}</Text>;
  if (esActual) contenido = <Animated.Text style={{ fontSize: 30, transform: [{ translateY: y }] }}>{emoji}</Animated.Text>;
  else if (i < actual) contenido = <Text style={{ fontSize: 18, opacity: 0.6 }}>{emoji}</Text>;
  else if (cofre) contenido = <Text style={{ fontSize: 26 }}>🎁</Text>;

  return (
    <View style={[s.cas, i < actual && { backgroundColor: '#DCEDC8' }, esActual && { borderColor: C.cafe, borderWidth: 3 }, cofre && { backgroundColor: '#FFE082' }]}>
      {contenido}
    </View>
  );
}

export default function Camino({ navigation, route }) {
  const { g, addPasos, aplicarCofre, siguienteCofre, pospuesto, setPospuesto } = useGame();
  const enfocada = useIsFocused();
  const estado = usePedometer(addPasos);
  const casilla = Math.floor(g.pasos / PASOS_CASILLA) % TOTAL;
  const resultado = route.params?.resultado;
  const emoji = (ICONOS[g.icono] || ICONOS.hormiga).emoji;


  // Abre el cofre automáticamente, salvo que el usuario lo haya pospuesto
 useEffect(() => {
  if (siguienteCofre && enfocada && !resultado && pospuesto !== siguienteCofre) {
    setPospuesto(siguienteCofre); // se marca como ofrecido: no se reabre solo
    navigation.navigate('Cofre', { hito: siguienteCofre, pasos: g.pasos, casilla });
  }
}, [siguienteCofre, enfocada, resultado, pospuesto]);

  const abrirPendiente = () => navigation.navigate('Cofre', { hito: siguienteCofre, pasos: g.pasos, casilla });
  const proximo = (Math.floor(g.pasos / 100) + 1) * 100;

  return (
    <View style={s.c}>
      <Text style={s.h}>Pasos: {g.pasos} · Casilla {casilla}</Text>
      <Text style={s.p}>Próximo cofre 🎁 en {proximo - g.pasos} pasos</Text>

      {siguienteCofre && (
        <TouchableOpacity style={s.pend} onPress={abrirPendiente}>
          <Text style={s.pendT}>🎁 Abrir cofre pendiente ({siguienteCofre})</Text>
        </TouchableOpacity>
      )}

      {estado === 'sinSensor' && <Text style={s.aviso}>Este dispositivo no tiene podómetro. Usa "Simular 10 pasos" en el menú ☰.</Text>}
      {estado === 'sinPermiso' && (
        <View style={s.aviso}>
          <Text>Necesito permiso de actividad física para contar tus pasos.</Text>
          <TouchableOpacity onPress={() => Linking.openSettings()}><Text style={s.link}>Abrir Ajustes</Text></TouchableOpacity>
        </View>
      )}

      <FlatList
        data={ORDEN}
        numColumns={COLS}
        keyExtractor={(i) => String(i)}
        renderItem={({ item }) => <Casilla i={item} actual={casilla} emoji={emoji} />}
        scrollEnabled={false}
        contentContainerStyle={{ alignSelf: 'center' }}
      />

      <TouchableOpacity
        style={s.b}
        onPress={() => navigation.navigate('Progreso', { puntos: g.puntos, premios: g.premios, maxPasos: g.maxPasos })}
      >
        <Text style={s.bt}>🏆 Ver progreso</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.crema, paddingTop: 40, alignItems: 'center' },
  h: { fontSize: 22, fontWeight: 'bold', color: C.cafe },
  p: { color: C.cafe, marginBottom: 8 },
  cas: { width: 62, height: 62, margin: 3, borderRadius: 10, backgroundColor: C.arena, alignItems: 'center', justifyContent: 'center' },
  aviso: { backgroundColor: '#FFCDD2', padding: 10, borderRadius: 8, marginHorizontal: 16, marginBottom: 8 },
  link: { color: '#0D47A1', fontWeight: 'bold', marginTop: 4 },
  pend: { backgroundColor: '#FFB300', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginBottom: 10 },
  pendT: { color: '#fff', fontWeight: 'bold' },
  b: { backgroundColor: C.hoja, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24, marginTop: 12 },
  bt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});