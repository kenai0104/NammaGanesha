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
  Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Register = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const showAlert = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

const handleRegister = async () => {
  console.log("Register button pressed");

  if (!name || !email || !phone || !password || !confirmPassword) {
    console.warn("Validation failed: missing fields");
    showAlert('Validation Error', 'All fields are required');
    return;
  }

  if (password !== confirmPassword) {
    console.warn("Password mismatch");
    showAlert('Password Mismatch', 'Passwords do not match');
    return;
  }

  setLoading(true);

  try {
    const bodyData = { name, email, phone, password };
    console.log("Sending data to backend:", bodyData);

    const response = await fetch('https://japa-lfgw.onrender.com/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });

    const data = await response.json();
    console.log("Server response:", data);

    if (response.ok) {
  console.log("Registration successful, saving to AsyncStorage...");
  await AsyncStorage.setItem('user', JSON.stringify({ id: data.userId, name: data.name }));
  navigation.replace('Login');
}

     else {
      console.warn("Registration failed:", data.message);
      showAlert('Registration Failed', data.message || 'Something went wrong.');
    }
  } catch (error) {
    console.error("Network error:", error.message);
    showAlert('Network Error', 'Could not connect to the server. Please try again.');
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
        <Image
  source={require('../assets/reg.png')} 
  style={styles.logo}
/>

        <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#555"
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#555"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#555"
            maxLength={10}
          />

          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Enter 4 digit Pin"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#555"
            secureTextEntry
            autoCapitalize="none"
            keyboardType="numeric"
            maxLength={4}
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Confirm 4 digit Pin"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#555"
            secureTextEntry
            autoCapitalize="none"
            keyboardType="numeric"
            maxLength={4}
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.button, loading && { backgroundColor: '#ccc' }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginRedirect}
          >
            <Text style={styles.loginRedirectText}>
              Already have an account? <Text style={styles.loginLink}>Login</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Custom Modal */}
        <Modal transparent visible={modalVisible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalMessage}>{modalMessage}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 25,
    borderRadius: 20,
    elevation: 5,
  },
  logo: {
  width: 120,
  height: 120,
  resizeMode: 'contain',
  alignSelf: 'center',
  marginBottom: 20,
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
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginRedirect: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginRedirectText: {
    color: '#555',
    fontSize: 14,
  },
  loginLink: {
    color: '#FF7E5F',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF7E5F',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#FF7E5F',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
