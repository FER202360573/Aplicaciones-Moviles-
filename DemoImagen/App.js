import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import DemoImagen from './componentes/DemoImagen.jsx';

export default function App() {
  return (
    <View style={styles.container}>
      {/* <View style={styles.panel1}></View>
      <View style={styles.panel2}></View>
      <View style={styles.panel3}></View> */}
        <DemoImagen/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccb4e9',
    
  },
  panel1:{
    flex: 1,
    backgroundColor: '#e61919',
  },
  panel2:{
    flex: 1,
    backgroundColor: '#e7e7e7',
  },
  panel3:{
    flex: 1,
    backgroundColor: '#3f7a30',
  },
});
