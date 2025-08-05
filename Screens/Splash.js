import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import InAppUpdates from 'react-native-in-app-updates';

// Use safe fallback if enums aren't exported properly
const IAUUpdateKind = {
  IMMEDIATE: 0,
  FLEXIBLE: 1,
};

const Splash = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  // In-app update logic
  useEffect(() => {
    const checkForUpdate = async () => {
      if (Platform.OS === 'android') {
        try {
          const inAppUpdates = new InAppUpdates(true); // Enable debug logs
          const result = await inAppUpdates.checkUpdate();

          if (result.shouldUpdate) {
            await inAppUpdates.startUpdate({
              updateType: IAUUpdateKind.IMMEDIATE, // or FLEXIBLE if you prefer
            });
          } else {
            runSplashAnimation(); // No update needed, continue
          }
        } catch (err) {
          console.warn('Update check failed:', err);
          runSplashAnimation(); // Continue if update fails
        }
      } else {
        runSplashAnimation(); // iOS or other platform
      }
    };

    checkForUpdate();
  }, []);

  // Splash screen animation
  const runSplashAnimation = () => {
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
      navigation.replace('Home');
    });
  };

  return (
    <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.container}>
      <Animated.Image
        source={require('../assets/chanting.png')}
        style={[styles.logo, { opacity: fadeAnim }]}
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
