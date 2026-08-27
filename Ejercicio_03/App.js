
import React, { useState } from "react";
import { StyleSheet, View, Button,SafeAreaView } from 'react-native';

import CustomModal from "./componentes/CustomModal.jsx";

export default function App(){
    const[modalVisible, setModalVisible]=useState(false);
    const objetoContenido = {
        valor: "Hola,Juan Perez",
    };

    return(
        <View >
            <View >
                {/* <Button
                title="Ver mensaje"
                onPress={()=> setModalVisible(true)}
                />
                <CustomModal
                    visible={modalVisible}
                    onClose={()=> setModalVisible(false)}
                    contenido={objetoContenido}
                /> */}
                    
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#19a792',
    
  },
  content: {
    flex:1,
    alignItems:'center',
    justifyContent:'center',
  },
});
