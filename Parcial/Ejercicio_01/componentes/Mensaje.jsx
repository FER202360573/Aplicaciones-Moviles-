
import { Text, StyleSheet, View } from "react-native";

export default function Mensaje(props){
    const variableMensaje="Mi mensaje ";
    const num=1000;
    const double= n => n*2;

    return(
         <View style={styles.container}>
            <Text style={styles.texto_azul}> {props.msg}</Text>
            <Text style={styles.texto_azul}> {props.num} </Text>
         </View>
    );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#303a24',
  },
   texto_azul: {
    color: '#4271ae',
  }
});