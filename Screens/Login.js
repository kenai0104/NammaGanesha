import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
  });
  const isPhone = /^[0-9]*$/.test(input);
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const checkLogin = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const { name, id } = JSON.parse(userData);
          navigation.replace('Home', { name, id });
        }
      } catch (err) {
        console.log('Auto-login error:', err);
      }
    };

    checkLogin();
  }, []);

  const showAlert = (title, message) => {
    setCustomAlert({ visible: true, title, message });
  };

const handleLogin = async () => {
  console.log('[Login Attempt]');
  console.log('Input:', input);
  console.log('Password:', password);

  if (!input || !password) {
    console.warn('⚠ Empty input or password');
    showAlert('Input Error', 'Please enter both Email/Phone and Password.');
    return;
  }

  setLoading(true);

  try {
    // Step 1: Login Request
    const response = await fetch('https://japa-meev.onrender.com/login', {
          // const response = await fetch('https://testjapa.onrender.com/login', {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, password }),
    });

    const responseText = await response.text();
    console.log('[Server Raw Response]:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (err) {
      console.error('❌ JSON Parse Error:', err);
      showAlert('Error', 'Invalid response format from server.');
      return;
    }

    if (!response.ok) {
      console.warn('❌ Login Failed:', data?.error || responseText);
      showAlert('Login Failed', data?.error || 'Invalid credentials. Please try again.');
      return;
    }

    // Step 2: Validate Login Response
    const { name, _id, phone, email } = data;
    if (!name || !_id) {
      console.warn('⚠ Incomplete data from server:', data);
      showAlert('Login Error', 'Incomplete user data received from server.');
      return;
    }

    // Step 3: Store user basic info
    const userData = { name, id: _id, phone, email };
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    console.log('✅ Saved to AsyncStorage:', userData);

    // Step 4: Fetch full user profile
    try {
      const profileRes = await fetch(`https://japa-meev.onrender.com/user-profile/${_id}`);
            // const profileRes = await fetch(`https://testjapa.onrender.com/user-profile/${_id}`);

      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        console.warn('⚠ Failed to fetch profile:', profileData?.error);
        showAlert('Profile Error', profileData?.error || 'Unable to fetch profile details.');
        return;
      }

      const { tower, flat, nakshatra, gotra, rasi } = profileData;

      // Step 5: Check if the necessary fields are empty
      if (!tower || !flat || !nakshatra || !gotra || !rasi) {
        console.log('➡ Redirecting to Address screen (missing tower/flat/nakshatra/gotra/rasi)');
        navigation.replace('Address', { name, id: _id });
      } else {
        console.log('➡ Redirecting to Home screen');
        navigation.replace('Home', { name, id: _id });
      }

    } catch (profileErr) {
      console.error('❌ Error fetching user profile:', profileErr);
      showAlert('Network Error', 'Could not load profile. Please check your connection.');
    }

  } catch (loginErr) {
    console.error('❌ Login Network Error:', loginErr);
    showAlert('Network Error', 'Unable to reach the server. Please try again later.');
  } finally {
    setLoading(false);
  }
};


  return (
    <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.innerContainer}
      >
      <View style={styles.logoWrapper}>
          <Image
            source={require('../assets/result.png')} // Replace with your actual image path
            style={styles.logo}
          />
        </View>

        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Namma Ganesha Japa</Text>
          <TextInput
            style={styles.input}
            placeholder="Email or Phone"
            value={input}
            onChangeText={setInput}
            placeholderTextColor="#555"
            maxLength={/^\d+$/.test(input) ? 10 : undefined}
          />
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Enter 4 digit pin"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#555"
            secureTextEntry
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={4}
          />

          <TouchableOpacity
            style={[styles.button, loading && { backgroundColor: '#ccc' }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerText}>New User? Register here</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Custom Modal Alert */}
        <Modal transparent visible={customAlert.visible} animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertBox}>
              <Text style={styles.alertTitle}>{customAlert.title}</Text>
              <Text style={styles.alertMessage}>{customAlert.message}</Text>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => setCustomAlert({ visible: false, title: '', message: '' })}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
logoWrapper: {
  marginTop: 16, // approx. 1rem
  marginBottom: 32, // approx. 2rem
  alignSelf: 'center',
},

logo: {
  width: 120,
  height: 120,
  borderRadius: 60, // Circular shape
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.2,
  shadowRadius: 10,
  elevation: 5, // Android shadow
},

  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 25,
    borderRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  passwordInput: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    color: '#000',
  },
  button: {
    backgroundColor: '#FF7E5F',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  registerText: {
    color: '#D35400',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontSize: 14,
  },

  // Modal alert styles
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  alertBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
    elevation: 10,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7E5F',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  alertButton: {
    backgroundColor: '#FF7E5F',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  alertButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
