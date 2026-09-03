import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreens';
import SearchScreen from './screens/SearchScreens';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
       <Tab.Navigator
       screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8811e9',
        tabBarInactiveTintColor: '#bdb7b7',
       }}
       >
          <Tab.Screen
              name="Inicio"
              component={HomeScreen}
          />

          <Tab.Screen
              name="Buscar"
              component={ProfileScreen}
          />

          <Tab.Screen
              name="Perfil"
              component={SearchScreen}
          />
       </Tab.Navigator>
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
