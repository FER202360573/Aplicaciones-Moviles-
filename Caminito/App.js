import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { GameProvider } from './src/GameContext';
import DrawerContent from './src/DrawerContent';
import Splash from './src/screens/Splash';
import Inicio from './src/screens/Inicio';
import Camino from './src/screens/Camino';
import Progreso from './src/screens/Progreso';
import Cofre from './src/screens/Cofre';
import Acerca from './src/screens/Acerca';
import { C } from './src/theme';
import Instrucciones from './src/screens/Instrucciones';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: C.hoja,
        tabBarInactiveTintColor: C.cafe,
        tabBarStyle: { backgroundColor: C.arena },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={route.name === 'Camino' ? 'map' : 'trophy'} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Camino" component={Camino} />
      <Tab.Screen name="Progreso" component={Progreso} />
    </Tab.Navigator>
  );
}

function Aventura() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Inicio" component={Inicio} />
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen
        name="Cofre"
        component={Cofre}
        options={{ presentation: 'transparentModal', animation: 'fade'}}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [splashListo, setSplashListo] = useState(false);
  if (!splashListo) return <Splash onFinish={() => setSplashListo(true)} />;

  return (
    <GameProvider>
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(p) => <DrawerContent {...p} />}
          screenOptions={{ headerStyle: { backgroundColor: C.cafe }, headerTintColor: '#fff' }}
        >
          <Drawer.Screen name="Aventura" component={Aventura} options={{ title: 'Caminito 🐜' }} />
          <Drawer.Screen name="Instrucciones" component={Instrucciones} options={{ title: 'Instrucciones' }} />
          <Drawer.Screen name="Acerca" component={Acerca} options={{ title: 'Acerca de' }} />
        </Drawer.Navigator>
      </NavigationContainer>
    </GameProvider>
  );
}