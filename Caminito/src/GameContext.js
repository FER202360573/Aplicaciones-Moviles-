import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'caminito:v1';
const INIT = { pasos: 0, maxPasos: 0, puntos: 0, premios: [], resueltos: [] };
const Ctx = createContext(null);
export const useGame = () => useContext(Ctx);

export function GameProvider({ children }) {
  const [g, setG] = useState(INIT);
  const [listo, setListo] = useState(false);

  // Cargar (validación: si falla o no hay datos, valores por defecto)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) setG({ ...INIT, ...JSON.parse(raw) });
      } catch (e) { /* usa INIT */ }
      setListo(true);
    })();
  }, []);

  // Guardar
  useEffect(() => {
    if (listo) AsyncStorage.setItem(KEY, JSON.stringify(g)).catch(() => {});
  }, [g, listo]);

  const addPasos = useCallback((n) => setG((p) => {
    const pasos = Math.max(0, p.pasos + n);
    return { ...p, pasos, maxPasos: Math.max(p.maxPasos, pasos), puntos: p.puntos + Math.max(0, n) };
  }), []);

  // resultado = { hito, tipo: 'castigo' | 'premio' | 'bonus', premio }
  const aplicarCofre = useCallback((r) => setG((p) => {
    const resueltos = [...p.resueltos, r.hito];
    if (r.tipo === 'castigo') {
      return { ...p, resueltos, pasos: Math.max(0, p.pasos - 20), puntos: Math.max(0, p.puntos - 20) };
    }
    const premios = r.premio && !p.premios.includes(r.premio) ? [...p.premios, r.premio] : p.premios;
    return { ...p, resueltos, premios, puntos: p.puntos + 50 };
  }), []);

  const reiniciar = useCallback(() => setG(INIT), []);

  // Primer cofre (100, 200, ...) alcanzado y aún no resuelto
  const siguienteCofre = useMemo(() => {
    for (let m = 100; m <= g.pasos; m += 100) if (!g.resueltos.includes(m)) return m;
    return null;
  }, [g.pasos, g.resueltos]);

  return (
    <Ctx.Provider value={{ g, listo, addPasos, aplicarCofre, reiniciar, siguienteCofre }}>
      {children}
    </Ctx.Provider>
  );
}