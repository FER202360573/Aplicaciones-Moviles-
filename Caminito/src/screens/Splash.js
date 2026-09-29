import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { C } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function Splash({ onFinish }) {
  const x = useRef(new Animated.Value(-120)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    Animated.parallel([
      Animated.timing(x, { toValue: 0, duration: 1500, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 1200, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(onFinish, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.c}>
      <Animated.Text style={{ fontSize: 90, transform: [{ translateX: x }] }}>🐜</Animated.Text>
      <Animated.Text style={[s.t, { opacity: op }]}>Caminito</Animated.Text>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.cafe, alignItems: 'center', justifyContent: 'center' },
  t: { fontSize: 38, fontWeight: 'bold', color: C.arena, marginTop: 10 },
});