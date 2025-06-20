import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const Success = ({ route, navigation }) => {
  const { name, id } = route.params || {};

  const handleGoHome = () => {
    navigation.navigate('Home', { name, id });
  };

  return (
    <LinearGradient
      colors={['#FF7E5F', '#FEB47B']}
      style={styles.gradientBackground}
    >
      <StatusBar backgroundColor="#FF7E5F" barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Request Submitted</Text>
        <Text style={styles.message}>
          Your request was submitted successfully!
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleGoHome}>
          <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default Success;

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 4,
  },
  buttonText: {
    color: '#FF7E5F',
    fontSize: 16,
    fontWeight: '600',
  },
});
