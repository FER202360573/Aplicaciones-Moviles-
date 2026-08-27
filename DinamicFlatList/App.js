import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CustomModal from './componentes/CustomModal';

const Cursos=[
  {id:'1',titlulo:'Progamación Movil', duracion:'10 horas', rating:'4.8'},
  {id:'2',titlulo:'IA para Ingenieros', duracion:'20 horas', rating:'4.9'},
  {id:'3',titlulo:'Aplicaciones Web', duracion:'18 horas', rating:'4.2'},
  {id:'4',titlulo:'Base de Datos', duracion:'15 horas', rating:'5.0'},
  {id:'5',titlulo:'Office', duracion:'30 horas', rating:'4.6'},
];

export default function App() {
  const [modalVisible,setModalVisible] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  const manejarPresionCurso = (tituloCurso) => {
    setCursoSeleccionado({valor:tituloCurso});
    setModalVisible(true);
  };

  const renderCard =({item}) =>{
    <TouchableOpacity
    onPress={()=>manejarPresionCurso(item.titlulo)}
    activeOpacity={0.7}
    >
      <View>
        <Text style={styles.title}>{item.titlulo}</Text>
        <Text style={styles.subtitle}>{item.duracion} | {item.rating}</Text> 
      </View>
    </TouchableOpacity>  
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}> Mis Cursos</Text>
      <FlatList
      data={Cursos}
      rederItem={renderCard}
      keyExtractor={item=>item.id}
      contentContainerStyle={styles.listContainer}
      />
      <CustomModal
      visible={modalVisible}
      onClose={()=>setModalVisible(false)}
      contenido={cursoSeleccionado}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header:{
    fontSize:24,
    fontWeight:'600',
    padding: 16,
    color: '#624747'
  },
  listContainer:{
    paddingHorizontal: 16,
    paddingBottom:16,
  },
  card:{
    backgroundColor:'white',
    padding:16,
    marginVertical:8,
    borderRadius:12,
  },
  title:{
    fontSize:18,
    fontWeight: 'bold',
    color:'#333',
    marginBottom: 4,
  },
  subtitle:{
    fontSize:14,
    color:'#aaa'
  }
});
