import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  Alert,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RequestForm = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tower: '',
    flat: '',
    pooja: '',
    date: '',
  });

  const [loading, setLoading] = useState(false);
  const [id, setId] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);


useEffect(() => {
  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (parsedUser?.id) {
        setIsLoggedIn(true);
        setId(parsedUser.id);
        setFormData((prev) => ({
          ...prev,
          phone: parsedUser.phone || '',
        }));
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('AsyncStorage error:', error);
      Alert.alert('Storage Error', 'Failed to load user data.');
    }
  };

  loadUser();
}, []);



  const handleChange = (field, value) => {
    if (field === 'date') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      if (cleaned.length > 2 && cleaned.length <= 4) {
        formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
      } else if (cleaned.length > 4) {
        formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 8)}`;
      }
      setFormData({ ...formData, [field]: formatted });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

const handleSubmit = async () => {
  try {
    const storedUser = await AsyncStorage.getItem('user');

    // Robust check for login presence
    if (!storedUser || storedUser === 'null' || storedUser === '{}' || storedUser === 'undefined') {
      Alert.alert(
        'Login Required',
        'To submit a prayer request, please log in first.',
        [
          { text: 'Login', onPress: () => navigation.replace('Login') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    const user = JSON.parse(storedUser);
    const userId = user?.id;
    const phone = user?.phone;

    if (!userId || !phone) {
      await AsyncStorage.removeItem('user');
      Alert.alert('Invalid Session', 'Your session has expired. Please log in again.');
      navigation.replace('Login');
      return;
    }

    const { name, tower, flat, pooja, date } = formData;
    const newErrors = {};

    // Basic validation
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!tower.trim()) newErrors.tower = 'Tower is required.';
    if (!flat.trim()) newErrors.flat = 'Flat is required.';
    if (!pooja.trim()) newErrors.pooja = 'Pooja details required.';
    if (!date.trim()) newErrors.date = 'Date is required.';
    else if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) newErrors.date = 'Use format: DD-MM-YYYY.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({}); // Clear previous errors

    // Confirmation alert
    Alert.alert(
      'Confirm Submission',
      `Please confirm your details:\n\nName: ${name}\nPhone: ${phone}\nTower: ${tower}\nFlat: ${flat}\nPooja: ${pooja}\nDate: ${date}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setLoading(true);

            const payload = {
              name,
              phone,
              tower,
              flat,
              date,
              poojaName: pooja,
              userId,
            };

            try {
              const response = await fetch('https://japa-meev.onrender.com/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });

              const data = await response.json();
              setLoading(false);

              if (response.ok) {
                setFormData({
                  name: '',
                  tower: '',
                  flat: '',
                  pooja: '',
                  date: '',
                });
                navigation.navigate('Success');
              } else {
                Alert.alert('Error', data?.message || 'Submission failed. Please try again.');
              }
            } catch (error) {
              setLoading(false);
              console.error('Submission error:', error);
              Alert.alert('Network Error', 'Unable to reach server. Try again later.');
            }
          },
        },
      ]
    );
  } catch (error) {
    setLoading(false);
    console.error('handleSubmit error:', error);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
};


  return (
    <>
      <StatusBar backgroundColor="#FF7E5F" barStyle="light-content" />
      <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.headerGradient}>
        <SafeAreaView edges={['top']} style={styles.safeAreaTop}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={require('../assets/left-arrow.png')} style={styles.backIcon} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Request Form</Text>
            <View style={{ width: 28 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
              {['name', 'tower', 'flat'].map((field, index) => (
                <View key={index} style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={formData[field]}
                    keyboardType="default"
                    onChangeText={(text) => handleChange(field, text)}
                    placeholderTextColor="#aaa"
                  />
                  {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
                </View>
              ))}


              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Pooja Details"
                  value={formData.pooja}
                  onChangeText={(text) => handleChange('pooja', text)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#aaa"
                />
                {errors.pooja && <Text style={styles.errorText}>{errors.pooja}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Date (DD-MM-YYYY)"
                  value={formData.date}
                  onChangeText={(text) => handleChange('date', text)}
                  keyboardType="numeric"
                  placeholderTextColor="#aaa"
                />
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
              </View>

              {loading ? (
                <ActivityIndicator size="large" color="#FF7E5F" style={{ marginTop: 20 }} />
              ) : (
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Submit Request</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default RequestForm;

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
    elevation: 10,
  },
  safeAreaTop: {
    backgroundColor: 'transparent',
  },
  header: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#fff',
  },
  backIcon: {
    width: 15,
    height: 15,
    tintColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffeede',
  },
  formContainer: {
    flexGrow: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 14,
  },
  input: {
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderColor: '#ddd',
    borderWidth: 1.2,
    paddingHorizontal: 16,
    fontSize: 16,
    elevation: 2,
    justifyContent: 'center',
  },
  textArea: {
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderColor: '#ddd',
    borderWidth: 1.2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    elevation: 2,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#D8000C',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 6,
  },
  submitButton: {
    backgroundColor: '#FF7E5F',
    borderRadius: 14,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    maxWidth: '80%',
    alignSelf: 'center',
    elevation: 4,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
});
