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
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from './Footer';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';


const Home = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    tower: '',
    flat: '',
    japaName: '',
    japaCount: '',
    customJapaCount: '', // new field
    date: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);


  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [nameA, setName] = useState('');
  const [id, setId] = useState('');

  const formatDateInput = (text) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length <= 2) {
      formatted = cleaned;
    } else if (cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    } else {
      formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 8)}`;
    }
    return formatted;
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadUserAndProfile = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setName(user.name);
            setId(user.id);

            const response = await fetch(`https://japa-meev.onrender.com/user-profile/${user.id}`);
            const data = await response.json();

            if (response.ok) {
              setFormData((prevData) => ({
                ...prevData,
                name: data.name || '',
                tower: data.tower || '',
                flat: data.flat || '',
              }));
            }
          }
        } catch (err) {
          console.error('Error during focus refresh:', err);
        }
      };

      loadUserAndProfile();
    }, [])
  );

  const handleSubmit = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        Alert.alert(
          "Not Logged In",
          "Please log in or register to submit your Japa record.",
          [
            { text: "Login", onPress: () => navigation.replace('Login') },
            { text: "Register", onPress: () => navigation.replace('Register') },
            { text: "Cancel", style: "cancel" }
          ]
        );
        return;
      }

      const user = JSON.parse(storedUser);
      const { name, tower, flat, japaName, japaCount, customJapaCount, date } = formData;
      const newErrors = {};

      if (!name.trim()) newErrors.name = 'Name is required.';
      if (!tower.trim()) newErrors.tower = 'Tower is required.';
      if (!flat.trim()) newErrors.flat = 'Flat is required.';
      if (!japaName.trim()) newErrors.japaName = 'Japa Name is required.';

      const finalCount = japaCount === 'custom' ? customJapaCount : japaCount;
      if (!finalCount) {
        newErrors.japaCount = 'Japa Count is required.';
      } else if (isNaN(finalCount) || parseInt(finalCount) <= 0) {
        newErrors.japaCount = 'Must be a positive number.';
      }

      const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
      if (!date.trim()) {
        newErrors.date = 'Date is required.';
      } else if (!dateRegex.test(date)) {
        newErrors.date = 'Date must be in DD-MM-YYYY format.';
      }

      if (Object.keys(newErrors).length > 0) {
        setValidationErrors(newErrors);
        return;
      }

      const [day, month, year] = date.split('-');
      const isoFormattedDate = `${year}-${month}-${day}`;

      setLoading(true);
      const response = await fetch('https://japa-meev.onrender.com/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          tower,
          flat,
          date: isoFormattedDate,
          japaName,
          japaCount: parseInt(finalCount, 10),
          userId: user.id,
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        setFormData({
          name,
          tower: '',
          flat: '',
          japaName: '',
          japaCount: '',
          customJapaCount: '',
          date: '',
        });
        navigation.navigate('History', { id: user.id });
      } else {
        setValidationErrors({ general: data.message || 'Submission failed' });
      }
    } catch (error) {
      setLoading(false);
      setValidationErrors({ general: 'Server error. Try again later.' });
    }
  };

  return (
    <>
      <StatusBar backgroundColor="#FF7E5F" barStyle="light-content" />
      <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.headerGradient}>
        <SafeAreaView edges={['top']} style={styles.safeAreaTop}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Hi {nameA}</Text>
            {id && (
              <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Logout Confirmation',
                  'Are you sure you want to logout?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Logout',
                      style: 'destructive',
                      onPress: async () => {
                        await AsyncStorage.removeItem('user');
                        navigation.replace('Login');
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <Image source={require('../assets/power-off.png')} style={styles.headerIcon} />
            </TouchableOpacity>

            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView edges={['left', 'right']} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <Image source={require('../assets/om.jpg')} style={styles.logo} />

            <Text style={{ textAlign: 'center', marginBottom: 30, color: 'brown' }}>
              Namma Ganesha supports your daily Japa practice and enables you to submit devotional prayer requests with ease.
            </Text>

            <View style={styles.formCard}>
              {['name', 'tower', 'flat', 'japaName'].map((field, index) => (
                <View key={index} style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    keyboardType="default"
                    value={formData[field]}
                    onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                    placeholderTextColor="#aaa"
                  />
                  {validationErrors[field] && (
                    <Text style={styles.errorText}>{validationErrors[field]}</Text>
                  )}
                </View>
              ))}

              {/* Picker for Japa Count */}
              <View style={styles.inputGroup}>
              <View style={[styles.input, styles.pickerWrapper]}>
                <Picker
                  selectedValue={formData.japaCount}
                  onValueChange={(value) => setFormData({ ...formData, japaCount: value })}
                  style={[styles.picker, { color: formData.japaCount ? '#000' : '#aaa' }]}
                  dropdownIconColor="#555"
                >
                  <Picker.Item label="Select Japa Count" value="" />
                  <Picker.Item label="108" value="108" />
                  <Picker.Item label="116" value="116" />
                  <Picker.Item label="1008" value="1008" />
                  <Picker.Item label="Custom" value="custom" />
                </Picker>
              </View>

              {validationErrors.japaCount && (
                <Text style={styles.errorText}>{validationErrors.japaCount}</Text>
              )}
            </View>


              {/* Custom count input */}
              {formData.japaCount === 'custom' && (
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter custom count"
                    keyboardType="numeric"
                    value={formData.customJapaCount}
                    onChangeText={(text) => setFormData({ ...formData, customJapaCount: text })}
                    placeholderTextColor="#aaa"
                  />
                </View>
              )}

              {/* Date input */}
             <View style={styles.inputGroup}>
              <TouchableOpacity
                style={[styles.input, { justifyContent: 'center' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: formData.date ? '#000' : '#aaa', fontSize: 17 }}>
                  {formData.date || 'Select Date (DD-MM-YYYY)'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios'); // keep open on iOS
                    if (selectedDate) {
                      const day = selectedDate.getDate().toString().padStart(2, '0');
                      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                      const year = selectedDate.getFullYear();
                      setFormData({ ...formData, date: `${day}-${month}-${year}` });
                    }
                  }}
                  maximumDate={new Date()} 
                />
              )}
            </View>

              {validationErrors.general && (
                <Text style={[styles.errorText, { textAlign: 'center', marginTop: 10 }]}>
                  {validationErrors.general}
                </Text>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.submitButton}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Footer
        onHistoryPress={() => navigation.navigate('History', { id })}
        onRequestPress={() => navigation.navigate('RequestForm', { id })}
        onProfilePress={() => navigation.navigate('Profile', { id })}
      />
    </>
  );
};

export default Home;

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
    nameWrapper: {
      flex: 1,
      marginRight: 10,
      overflow: 'hidden',
    },

    headerTitle: {
      fontSize: 21,
      fontWeight: '500',
      color: '#fff',
      overflow: 'hidden',
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
  scrollContent: {
    padding: 24,
    paddingBottom: 140, 
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
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#FF7E5F',
    borderRadius: 14,
    marginTop: 24,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    elevation: 5,
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
  pickerWrapper: {
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: '#fff',
    elevation: 2,
    overflow: 'hidden',
  },

  picker: {
    height: 54,
    width: '100%',
  },
});
