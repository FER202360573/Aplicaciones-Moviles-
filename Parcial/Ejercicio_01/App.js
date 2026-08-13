import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Cat from './componentes/Cat.jsx';
import Mensaje from './componentes/Mensaje.jsx';

export default function App() {
  //codigo 
  return ( //Vista
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <Text style={styles.texto_rojo} > Este es otro componente</Text>
      <Cat/>
      <Mensaje msg="Mi mensaje como propiedad" num="1000"/>
      
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
  texto_rojo:{
    color:'red',
  },
});
