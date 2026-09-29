import { useEffect, useState } from 'react';
import { Pedometer } from 'expo-sensors';

export default function usePedometer(onSteps) {
  const [estado, setEstado] = useState('cargando'); // ok | sinSensor | sinPermiso

  useEffect(() => {
    let sub;
    let last = 0;
    (async () => {
      try {
        if (!(await Pedometer.isAvailableAsync())) return setEstado('sinSensor');
        const { status } = await Pedometer.requestPermissionsAsync();
        if (status !== 'granted') return setEstado('sinPermiso');
        sub = Pedometer.watchStepCount((r) => {
          const d = r.steps - last; // el sensor entrega acumulado
          last = r.steps;
          if (d > 0) onSteps(d);
        });
        setEstado('ok');
      } catch (e) {
        setEstado('sinSensor');
      }
    })();
    return () => sub && sub.remove();
  }, []);

  return estado;
}