import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '../GameContext';
import { C, PREMIOS } from '../theme';

export default function Cofre({ navigation, route }) {
  const { hito, pasos, casilla } = route.params; // extras recibidos desde Camino
  const { g, aplicarCofre, setPospuesto } = useGame();
  const giro = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const resRef = useRef(null);
  const continuando = useRef(false);
  const [dado, setDado] = useState(null);
  const [rodando, setRodando] = useState(false);
  const [res, setRes] = useState(null);

  // Tirado el dado, solo se sale con "Continuar" (así no se pierde el resultado)
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => {
      if (resRef.current && !continuando.current) e.preventDefault();
    });
    return unsub;
  }, [navigation]);

  const salir = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Tabs');
  };

  // Cerrar sin tirar: el cofre queda pendiente
  const cerrar = () => {
    if (rodando || resRef.current) return;
    salir();
  };

  const tirar = () => {
    if (rodando || dado !== null) return;
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
          : { hito, tipo: 'bonus', dado: n };
      }
      resRef.current = r;
      setDado(n); setRes(r); setRodando(false);
      Animated.spring(pop, { toValue: 1, friction: 3, useNativeDriver: true }).start();
    });
  };

  // Aplica el resultado UNA sola vez y cierra el modal
  const continuar = () => {
    if (continuando.current || !resRef.current) return;
    continuando.current = true;
    aplicarCofre(resRef.current);
    setPospuesto(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    salir();
  };

  const rot = giro.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '1080deg'] });

  return (
    <View style={s.fondo}>
      <Pressable style={StyleSheet.absoluteFill} onPress={cerrar} />

      <View style={s.caja}>
        {!res && (
          <TouchableOpacity style={s.x} onPress={cerrar} disabled={rodando} hitSlop={12}>
            <Text style={s.xt}>✕</Text>
          </TouchableOpacity>
        )}
        <Text style={s.h}>🎁 ¡Cofre encontrado!</Text>
        <Text style={s.p}>Llevas {pasos} pasos (casilla {casilla}). Meta: {hito}</Text>

        <Animated.View style={[s.dado, { transform: [{ rotate: rot }] }]}>
          <Text style={{ fontSize: 44, fontWeight: 'bold' }}>{dado ?? '🎲'}</Text>
        </Animated.View>

        {!res ? (
          <>
            <TouchableOpacity style={[s.b, rodando && { opacity: 0.5 }]} disabled={rodando} onPress={tirar}>
              <Text style={s.bt}>{rodando ? 'Rodando...' : 'Tirar dado'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={cerrar} disabled={rodando} style={{ marginTop: 14 }}>
              <Text style={s.later}>Abrir después</Text>
            </TouchableOpacity>
          </>
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
  x: { position: 'absolute', top: 8, right: 8, width: 36, height: 36, borderRadius: 18, backgroundColor: C.arena, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  xt: { fontSize: 18, fontWeight: 'bold', color: C.cafe },
  h: { fontSize: 24, fontWeight: 'bold', color: C.cafe, marginTop: 10 },
  p: { color: C.cafe, marginVertical: 10, textAlign: 'center' },
  dado: { width: 100, height: 100, borderRadius: 18, backgroundColor: '#fff', borderWidth: 3, borderColor: C.cafe, alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  res: { fontSize: 20, fontWeight: 'bold', color: C.cafe, marginBottom: 12, textAlign: 'center' },
  b: { backgroundColor: C.hoja, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 24 },
  bt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  later: { color: C.cafe, textDecorationLine: 'underline' },
});