import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useGame } from '../GameContext';
import { C, ICONOS } from '../theme';

const METAS = Array.from({ length: 10 }, (_, i) => (i + 1) * 100);

export default function Progreso() {
  const { g, setIcono } = useGame();

  const elegir = (k) => {
    setIcono(k);
    Haptics.selectionAsync().catch(() => {});
  };

  return (
    <View style={s.c}>
      <Text style={s.punt}>⭐ {g.puntos} puntos</Text>

      <Text style={s.sub}>Colección</Text>
      <Text style={s.hint}>Toca un icono desbloqueado para usarlo como tu personaje en el camino</Text>
      <View style={s.fila}>
        {Object.entries(ICONOS).map(([k, v]) => {
          const ok = k === 'hormiga' || g.premios.includes(k);
          const activo = g.icono === k;
          return (
            <TouchableOpacity
              key={k}
              activeOpacity={0.7}
              onPress={() => (ok ? elegir(k) : null)}
              style={[s.card, !ok && { backgroundColor: '#E0E0E0' }, activo && s.activo]}
            >
              <Text style={{ fontSize: 36, opacity: ok ? 1 : 0.25 }}>{v.emoji}</Text>
              <Text style={{ fontSize: 11, color: ok ? C.cafe : '#757575' }}>{ok ? v.nombre : '🔒 Bloqueado'}</Text>
              {activo && <Text style={s.en}>En uso</Text>}
            </TouchableOpacity>
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
            <Text style={{ fontSize: 22 }}>{g.maxPasos >= item ? '✅' : '⬜'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: C.crema, padding: 16, paddingTop: 40 },
  punt: { fontSize: 32, fontWeight: 'bold', color: C.cafe, textAlign: 'center' },
  sub: { fontSize: 20, fontWeight: 'bold', color: C.cafe, marginTop: 16, marginBottom: 4 },
  hint: { fontSize: 12, color: C.cafe, marginBottom: 8, opacity: 0.7 },
  fila: { flexDirection: 'row', justifyContent: 'space-between' },
  card: { flex: 1, margin: 3, backgroundColor: C.arena, borderRadius: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 3, borderColor: 'transparent' },
  activo: { borderColor: C.hoja, backgroundColor: '#DCEDC8' },
  en: { fontSize: 10, fontWeight: 'bold', color: C.hoja, marginTop: 2 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 6 },
  mt: { fontSize: 16, color: C.cafe },
});