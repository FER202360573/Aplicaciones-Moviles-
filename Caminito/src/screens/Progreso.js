import React, { useEffect } from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';
import { useGame } from '../GameContext';
import { C, PREMIOS } from '../theme';

const METAS = Array.from({ length: 10 }, (_, i) => (i + 1) * 100);

export default function Progreso({ navigation, route }) {
  const { g } = useGame();
  // Usa lo recibido desde Camino; si entra por la pestaña, usa lo guardado
  const p = route.params?.puntos !== undefined ? route.params : { puntos: g.puntos, premios: g.premios, maxPasos: g.maxPasos };

  useEffect(
    () => navigation.addListener('blur', () => navigation.setParams({ puntos: undefined, premios: undefined, maxPasos: undefined })),
    [navigation]
  );

  return (
    <View style={s.c}>
      <Text style={s.punt}>⭐ {p.puntos} puntos</Text>

      <Text style={s.sub}>Colección</Text>
      <View style={s.fila}>
        {Object.entries(PREMIOS).map(([k, v]) => {
          const ok = p.premios.includes(k);
          return (
            <View key={k} style={[s.card, !ok && { backgroundColor: '#E0E0E0' }]}>
              <Text style={{ fontSize: 44, opacity: ok ? 1 : 0.25 }}>{v.emoji}</Text>
              <Text style={{ color: ok ? C.cafe : '#757575' }}>{ok ? v.nombre : '🔒 Bloqueado'}</Text>
            </View>
          );
        })}
      </View>

      <Text style={s.sub}>Metas</Text>
      <FlatList
        data={METAS}
        keyExtractor={(m) => String(m)}
        renderItem={({ item }) => (
          <View style={s.meta}>
            <Text style={s.mt}>{item} pasos</Text>
            <Text style={{ fontSize: 22 }}>{p.maxPasos >= item ? '✅' : '⬜'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.crema, padding: 16, paddingTop: 40 },
  punt: { fontSize: 32, fontWeight: 'bold', color: C.cafe, textAlign: 'center' },
  sub: { fontSize: 20, fontWeight: 'bold', color: C.cafe, marginTop: 16, marginBottom: 8 },
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  card: { flex: 1, margin: 4, backgroundColor: C.arena, borderRadius: 14, padding: 10, alignItems: 'center' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 6 },
  mt: { fontSize: 16, color: C.cafe },
});