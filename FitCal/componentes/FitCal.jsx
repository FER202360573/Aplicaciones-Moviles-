import React, { useState } from "react";
import { StyleSheet, View, Button,Text,TextInput} from 'react-native';

const FitCal  = () => {
    
    const [text,onChangeText ] = useState('');

  return (
    <View>
        <Text style={styles.title}> Calculadora IMC </Text>
        <Text style={styles.pricipal}> Peso (kg) </Text>
        <TextInput
            style={styles.caja}
            onChangeText={onChangeText}
            placeholder="70 kg"
          >  
          </TextInput>

        <Text style={styles.pricipal}> Altura (m) </Text>
        <TextInput
            style={styles.caja}
            onChangeText={onChangeText}
            placeholder="1.72 m"
        >  
        </TextInput >
        <Button 
        style={styles.title}
        title="Calcular IMC"
        >  
        </Button>
      
    </View>
        );
    };


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  pricipal: {
    fontSize:25 ,
    textAlign:'left',
    font:'Arial',
    fontWeight:'bold',
  },
  title:{
    fontSize:35 ,
    textAlign:'center',
    font:'Arial',
    fontWeight:'bold',
  },
  caja:{
    fontSize:20 ,
    font:'Arial',

  },
});

export default FitCal;

    