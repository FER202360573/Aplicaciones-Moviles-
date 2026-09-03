import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './componentes/HomeScreen';
import SearchScreen from './componentes/SearchScreen';
import ProfileScreen from './componentes/ProfileScreen';
import SettingsScreen from './componentes/SettingsScreen';

const Drawer = createDrawerNavigator();

// function HomeScreen(){
//   return(
//     <View>
//       <Text>Iniciar</Text>
//     </View>
//   );
// }

// function SearchScreen(){
//   return(
//     <View>
//       <Text>Buscar</Text>
//     </View>
//   );
// }

// function ProfileScreen(){
//   return(
//     <View>
//       <Text>Perfil</Text>
//     </View>
//   );
// }

// function SettingsScreen(){
//   return(
//     <View>
//       <Text>Ajustes</Text>
//     </View>
//   );
// }

 function MyDrawer(){
   return(
     <Drawer.Navigator>
       <Drawer.Screen
         name = "Inicio"
         component={HomeScreen}
       />

       <Drawer.Screen
         name = "Buscar"
         component={SearchScreen}
       />

       <Drawer.Screen
         name = "Perfil"
         component={ProfileScreen}
       />

       <Drawer.Screen
         name = "Ajustes"
         component={SettingsScreen}
       />
    
     </Drawer.Navigator>

     );
 }

export default function App(){
  return(
    <NavigationContainer>
      <MyDrawer/>
    </NavigationContainer>
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
