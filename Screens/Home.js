import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from './Footer';

const Home = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    tower: '',
    flat: '',
    japaName: '',
    japaCount: '',
    dateTime: '',
  });

  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [nameA, setName] = useState('');
  const [id, setId] = useState('');

  // ✅ Fetch user data once
useEffect(() => {
  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("Fetched Name:", user.name);
        console.log("Fetched ID:", user.id);

        setName(user.name);
        setId(user.id);

        setFormData((prevData) => ({
          ...prevData,
          name: user.name,
        }));
      } else {
        console.warn('No user found in AsyncStorage');
      }
    } catch (err) {
      console.error('Error fetching user from AsyncStorage:', err);
    }
  };

  loadUser();

  // ⏱️ Start interval to update dateTime
  const interval = setInterval(() => {
    setFormData((prevData) => ({
      ...prevData,
      dateTime: new Date().toLocaleString(),
    }));
  }, 1000); // update every second

  // Cleanup on unmount
  return () => clearInterval(interval);
}, []);


  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  const handleSubmit = async () => {
    const { name, tower, flat, japaName, japaCount } = formData;
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!tower.trim()) newErrors.tower = 'Tower is required.';
    if (!flat.trim()) newErrors.flat = 'Flat is required.';
    if (!japaName.trim()) newErrors.japaName = 'Japa Name is required.';
    if (!japaCount.trim()) {
      newErrors.japaCount = 'Japa Count is required.';
    } else if (isNaN(parseInt(japaCount)) || parseInt(japaCount) <= 0) {
      newErrors.japaCount = 'Japa Count must be a positive number.';
    }

    if (!id) {
      newErrors.general = 'User ID is missing. Please log in again.';
    }

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    setValidationErrors({});
    const isoDate = new Date().toISOString();
    const payload = {
      name,
      tower,
      flat,
      date: isoDate,
      japaName,
      japaCount: parseInt(japaCount, 10),
      userId: id,
    };

    try {
      setLoading(true);
      const response = await fetch('https://japa-lfgw.onrender.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Submission response:', data);

      setLoading(false);

      if (response.ok) {
        setFormData({
          name,
          tower: '',
          flat: '',
          japaName: '',
          japaCount: '',
          dateTime: new Date().toLocaleString(),
        });
        navigation.navigate('History', { id });
      } else {
        setValidationErrors({ general: data.message || 'Submission failed. Please try again.' });
      }
    } catch (error) {
      setLoading(false);
      console.error('Submit error:', error);
      setValidationErrors({ general: 'Error: Could not connect to the server.' });
    }
  };

  const goToRequest = () => {
    navigation.navigate('RequestForm', { id });
  };

  const goToHistory = () => {
    navigation.navigate('History', { id });
  };

  return (
    <>
      <StatusBar backgroundColor="#FF7E5F" barStyle="light-content" />
      <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.headerGradient}>
        <SafeAreaView edges={['top']} style={styles.safeAreaTop}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Hi {nameA}</Text>
            <View style={styles.iconContainer}>
              <TouchableOpacity onPress={handleLogout}>
                <Image source={require('../assets/power-off.png')} style={styles.headerIcon} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
        <Image source={require('../assets/om.jpg')} style={styles.logo} />
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            {['name', 'tower', 'flat', 'japaName', 'japaCount'].map((field, index) => (
              <View key={index} style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder={field === 'japaCount' ? 'Japa Count' : field.charAt(0).toUpperCase() + field.slice(1)}
                  keyboardType={field === 'japaCount' ? 'numeric' : 'default'}
                  value={formData[field]}
                  onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                  placeholderTextColor="#ccc"
                />
                {validationErrors[field] && <Text style={styles.errorText}>{validationErrors[field]}</Text>}
              </View>
            ))}

            <TextInput
              style={[styles.input, { backgroundColor: '#f0f0f0', color: '#000' }]}
              placeholder="Date and Time"
              value={formData.dateTime}
              placeholderTextColor="#ccc"
              editable={false}
            />

            {validationErrors.general && (
              <Text style={[styles.errorText, { textAlign: 'center', marginTop: 10 }]}>
                {validationErrors.general}
              </Text>
            )}

            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Footer onHistoryPress={goToHistory} onRequestPress={goToRequest} />
    </>
  );
};

export default Home;

// Styles
const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
    elevation: 10,
  },
  safeAreaTop: {},
  container: {
    flex: 1,
    backgroundColor: '#ffeede',
  },
  header: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#fff',
  },
  iconContainer: {
    flexDirection: 'row',
  },
  headerIcon: {
    width: 28,
    height: 28,
    marginLeft: 20,
    tintColor: '#fff',
  },
  formContainer: {
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 12,
  },
  input: {
    height: 54,
    borderColor: '#ddd',
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 17,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#FF7E5F',
    borderRadius: 14,
    marginTop: 24,
    elevation: 5,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#FF7E5F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  errorText: {
    color: '#D8000C',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 6,
  },
});
