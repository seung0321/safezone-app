// src/screens/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

const SplashScreen = () => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim]);

  return (
    <LinearGradient
      colors={['#3C365C', Colors.bgDark]}
      style={styles.container}
    >
      <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
        <Text style={styles.logo}>🛡️</Text>
      </Animated.View>
      <Text style={styles.title}>SafeRoute</Text>
      <Text style={styles.subtitle}>AI 기반 안심귀가 서비스</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 10,
  },
});

export default SplashScreen;