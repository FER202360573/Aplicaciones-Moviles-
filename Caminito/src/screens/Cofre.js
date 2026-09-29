import React, { useRef, useState } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '../GameContext';
import { C, PREMIOS } from '../theme';

export default function Cofre({ navigation, route }) {
  const { hito, pasos, casilla } = route.params; // extras recibidos
  const { g } = useGame();
  const giro = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const [dado, setDado] = useState(null);
  const [rodando, setRodando] = useState(false);
  const [res, setRes] = useState(null);

  const tirar = () => {
    if (rodando || dado !== null) return; // validación: una sola tirada por cofre
    setRodando(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    Animated.timing(giro, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => {
      const n = 1 + Math.floor(Math.random() * 6);
      let r;
      if (n % 2 === 1) r = { hito, tipo: 'castigo', dado: n };
      else {
        const libres = Object.keys(PREMIOS).filter((k) => !g.premios.includes(k));
        r = libres.length
          ? { hito, tipo: 'premio', premio: libres[Math.floor(Math.random() * libres.length)], dado: n }
          : { hito, tipo: 'bonus', dado: n }; // ya tienes todos: solo puntos
      }
      setDado(n); setRes(r); setRodando(false);
      Animated.spring(pop, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    });
  };

  // Devolver información a Camino (extras)
  const continuar = () => navigation.navigate('Tabs', { screen: 'Camino', params: { resultado: res } });

  const rot = giro.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '1080deg'] });

  return (
    <View style={s.fondo}>
      <View style={s.caja}>
        <Text style={s.h}>🎁 ¡Cofre encontrado!</Text>
        <Text style={s.p}>Llevas {pasos} pasos (casilla {casilla}). Meta: {hito}</Text>

        <Animated.View style={[s.dado, { transform: [{ rotate: rot }] }]}>
          <Text style={{ fontSize: 44, fontWeight: 'bold' }}>{dado ?? '🎲'}</Text>
        </Animated.View>

        {!res ? (
          <TouchableOpacity style={[s.b, rodando && { opacity: 0.5 }]} disabled={rodando} onPress={tirar}>
            <Text style={s.bt}>{rodando ? 'Rodando...' : 'Tirar dado'}</Text>
          </TouchableOpacity>
        ) : (
          <Animated.View style={{ alignItems: 'center', transform: [{ scale: pop }] }}>
            {res.tipo === 'castigo' && <Text style={s.res}>⛔ −20 pasos</Text>}
            {res.tipo === 'premio' && <Text style={s.res}>{PREMIOS[res.premio].emoji} ¡Desbloqueaste {PREMIOS[res.premio].nombre}!</Text>}
            {res.tipo === 'bonus' && <Text style={s.res}>⭐ ¡Ya tienes todos! +50 puntos</Text>}
            <TouchableOpacity style={s.b} onPress={continuar}><Text style={s.bt}>Continuar</Text></TouchableOpacity>
          </Animated.View>  
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#000A', justifyContent: 'center', padding: 24 },
  caja: { backgroundColor: C.crema, borderRadius: 20, padding: 24, alignItems: 'center' },
  h: { fontSize: 24, fontWeight: 'bold', color: C.cafe },
  p: { color: C.cafe, marginVertical: 10, textAlign: 'center' },
  dado: { width: 100, height: 100, borderRadius: 18, backgroundColor: '#fff', borderWidth: 3, borderColor: C.cafe, alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  res: { fontSize: 20, fontWeight: 'bold', color: C.cafe, marginBottom: 12, textAlign: 'center' },
  b: { backgroundColor: C.hoja, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 24 },
  bt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});