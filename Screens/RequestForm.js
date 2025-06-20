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

  useEffect(() => {
    const loadUserId = async () => {
      try {
        // TEMPORARY: Set a static ID if none is found
        const existingId = await AsyncStorage.getItem('id');
        if (existingId) {
          setId(existingId);
          console.log('User ID:', existingId);
        } else {
          const fallbackId = '6852c511d871767a79268dcb';
          await AsyncStorage.setItem('id', fallbackId);
          setId(fallbackId);
          console.warn('No ID found. Setting fallback ID.');
        }
      } catch (error) {
        console.error('Error accessing AsyncStorage:', error);
      }
    };

    loadUserId();
  }, []);

const handleChange = (field, value) => {
  if (field === 'date') {
    // Remove non-digit characters
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
    const { name, phone, tower, flat, pooja, date } = formData;
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!phone.trim()) newErrors.phone = 'Phone number is required.';
    else if (!/^\d{10}$/.test(phone)) newErrors.phone = 'Phone must be 10 digits.';
    if (!tower.trim()) newErrors.tower = 'Tower is required.';
    if (!flat.trim()) newErrors.flat = 'Flat is required.';
    if (!pooja.trim()) newErrors.pooja = 'Pooja details required.';
    if (!date.trim()) newErrors.date = 'Date is required.';
    else if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) newErrors.date = 'Format: DD-MM-YYYY.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const payload = {
      name,
      phone,
      tower,
      flat,
      date,
      poojaName: pooja,
      userId: id,
    };

    try {
      const response = await fetch('https://japa-lfgw.onrender.com/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setFormData({
          name: '',
          phone: '',
          tower: '',
          flat: '',
          pooja: '',
          date: '',
        });
        navigation.navigate('Success');
      } else {
        Alert.alert('Error', data?.message || 'Submission failed.');
      }
    } catch (error) {
      console.log('Network error:', error);
      setLoading(false);
      Alert.alert('Network Error', 'Unable to submit the request. Please try again.');
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
        <ScrollView contentContainerStyle={styles.formContainer}>
          {['name', 'phone', 'tower', 'flat'].map((field, index) => (
            <View key={index} style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder={field === 'phone' ? 'Phone Number' : field.charAt(0).toUpperCase() + field.slice(1)}
                value={formData[field]}
                keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
                onChangeText={(text) => handleChange(field, text)}
                placeholderTextColor="#aaa"
                maxLength={field === 'phone' ? 10 : undefined}
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
