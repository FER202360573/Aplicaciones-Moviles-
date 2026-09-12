import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';

export default function SplashScreen({ navigation }) {
  const scaleValue = useRef(new Animated.Value(0.3)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        navigation.replace('MainApp');
      }, 400);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: opacityValue, transform: [{ scale: scaleValue }], alignItems: 'center' }}>
        <Text style={{ fontSize: 90 }}>🧀</Text>
        <Text style={styles.title}>VidaQueso</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFD54F', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 34, fontWeight: 'bold', color: '#3E2723', marginTop: 10 },
});