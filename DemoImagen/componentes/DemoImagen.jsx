import { View, ImageBackground, Dimensions, StyleSheet, Image, Text } from "react-native";

const DemoImagen = () =>{
   return(
    <View style={styles.container}> 
        <ImageBackground
        style={styles.fondo}
            source={require('../assets/fumiaki.jpg')}
        > 
        <View style={styles.container}>
            <Text style={styles.titulo}> TXT </Text>
            <Image
                style={styles.foto}
                source={{uri:'https://i.pinimg.com/736x/81/0f/a0/810fa00499345079e8cfad34eb026d5a.jpg'}}
            />
            </View>
        </ImageBackground>
    </View>    
   );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(0,0,0,0)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fondo:{
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  foto:{
    width:200,
    height:200,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: '#e8acac',
    shadowColor:'#fff',
    
  },
  titulo:{
    width: Dimensions.get('window').width,
    fontSize:45 ,
    textAlign:'center',
    font:'Arial',
    fontWeight:'bold',
    backgroundColor:'rgb(500,200,500,0.6)',

    
  }
});

export default DemoImagen;