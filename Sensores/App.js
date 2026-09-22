import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AccelemeterSensor from './componentes/AccelerometerSensor';
import GyroscopeSensor from './componentes/GyroscopeSensor';
import MagnetometerSensor from './componentes/MagnetometerSensor';
import PedometerSensor from './componentes/PedometerSensor';

export default function App() {
  return (
    <View style={styles.container}>
    <PedometerSensor/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
