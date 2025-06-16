import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient'; // Import the LinearGradient component

const Splash = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.replace('Login');
    });
  }, []);

  return (
    <LinearGradient
      colors={['#FF7E5F', '#FEB47B']} // Gradient colors (pink to yellow)
      style={styles.container} // Gradient applied to container style
    >
      <Animated.Image
        source={require('../assets/chanting.png')} // Your logo
        style={[styles.logo, { opacity: fadeAnim }]} // Apply fade animation to the logo
        resizeMode="contain"
      />
    </LinearGradient>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
});
