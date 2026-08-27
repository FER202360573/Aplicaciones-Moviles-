import { StyleSheet, Text, View, Modal, Button } from 'react-native';
import { useState } from 'react';

export default function App2() {

  const  [modal, setModal]=useState(true)
  return (
    <View style={styles.container}>
      <Modal 
      animationType='slide'
      transparent={true}
      visible={modal}
      >
        <View style={styles.center}>
          <View style={styles.contenido}>
            <Text>Esto es un modal</Text>
            <Button
            title="CLose Modal"
            onPress={()=> setModal(!modal)}
            />  
          </View>
        </View>
        {/* Contenido del modal */}
      
      </Modal>
      <Text>Este texto esta fuera del modal</Text>
      <Button
          title="Abrir Modal"
          onPress={()=> setModal(!modal)}
      />  
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
  center: {
    flex:1,
    alignItems:'stretch',
    justifyContent:'center',
    backgroundColor:'rgba(0,0,0,0.5)',
  },
  contenido:{
    flex:1,
    backgroundColor:'rgba(73,156,200,1)',
    alignItems:'center',
    justifyContent:'center',
    marginVertical:375,
    marginHorizontal:110,
    borderRadius:'10%'

  },
});
