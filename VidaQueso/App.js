import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './componentes/SplashScreen';
import HomeScreen from './componentes/HomeScreen';
import NavTab from './componentes/NavTab';
import NavDrawer from './componentes/NavDrawer';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainApp" component={HomeScreen} options={{ title: 'VidaQueso - Inicio' }} />
        <Stack.Screen name="HerramientasTab" component={NavTab} options={{ title: 'Herramientas' }} />
        <Stack.Screen name="Características" component={NavDrawer} options={{ title: 'Características' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}