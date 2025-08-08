import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const RequestForm = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    tower: '',
    flat: '',
    pooja: '',
    date: '',
    nakshatra: '',
    gotra: '',
    rasi: '',
  });

  const [loading, setLoading] = useState(true);  // Set loading to true initially
  const [errors, setErrors] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // List of Nakshatras and Rasis
  const nakshatras = [
    'Ashvini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
    'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
    'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada',
    'Revati'
  ];

  const rasis = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  // Use useFocusEffect to load the user data when the screen is focused
useFocusEffect(
    useCallback(() => {
      const loadUserProfile = async () => {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          const parsedUser = storedUser ? JSON.parse(storedUser) : null;

          if (parsedUser?.id) {
            setFormData((prev) => ({
              ...prev,
              phone: parsedUser.phone || '',
              nakshatra: parsedUser.nakshatra || '',
              gotra: parsedUser.gotra || '',
            }));

            // Fetch user profile data from the server
            const response = await fetch(`https://japa-meev.onrender.com/user-profile/${parsedUser.id}`);
            const profileData = await response.json();

            if (response.ok) {
              setFormData((prev) => ({
                ...prev,
                name: profileData.name || '',
                tower: profileData.tower || '',
                flat: profileData.flat || '',
                nakshatra: profileData.nakshatra || '',
                gotra: profileData.gotra || '',
                rasi: profileData.rasi || '',
              }));

              // Check if any of the required fields are empty and redirect to the Address screen
              if (!profileData.tower || !profileData.flat || !profileData.nakshatra || !profileData.gotra || !profileData.rasi) {
                // Delay redirection by 1 second
                setTimeout(() => {
                  setLoading(false); // Hide the loading indicator before redirecting
                  navigation.replace('Address');
                }, 1000); // 1-second delay
              } else {
                setLoading(false); // Hide loading once the data is fully fetched
              }
            } else {
              console.warn('Profile fetch failed:', profileData.message);
              setLoading(false); // Ensure loading state is turned off in case of an error
            }
          } else {
            console.warn('User not logged in');
            setLoading(false); // Ensure loading state is turned off if user is not logged in
          }
        } catch (error) {
          console.error('AsyncStorage/Profile error:', error);
          Alert.alert('Error', 'Failed to load user profile.');
          setLoading(false); // Hide loading in case of an error
        }
      };

      loadUserProfile();
    }, []) // Empty dependency array ensures this effect runs only once when the screen is focused
  );

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');

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

      const { name, tower, flat, pooja, date, nakshatra, gotra, rasi } = formData;
      const newErrors = {};

      // Form validation
      if (!name.trim()) newErrors.name = 'Name is required.';
      if (!tower.trim()) newErrors.tower = 'Tower is required.';
      if (!flat.trim()) newErrors.flat = 'Flat is required.';
      if (!pooja.trim()) newErrors.pooja = 'Pooja details required.';
      if (!date.trim()) newErrors.date = 'Date is required.';
      else if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) newErrors.date = 'Use format: DD-MM-YYYY.';

      // Validate Nakshatra, Gotra, and Rasi if required
      if (!nakshatra.trim()) newErrors.nakshatra = 'Nakshatra is required.';
      if (!gotra.trim()) newErrors.gotra = 'Gotra is required.';
      if (!rasi.trim()) newErrors.rasi = 'Rasi is required.';

      // If any errors, stop the submission
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({}); // Clear previous errors

      const [day, month, year] = date.split('-');
      const isoFormattedDate = `${year}-${month}-${day}`; // Format the date correctly

      console.log('Submitting data:', { name, phone, tower, flat, pooja, isoFormattedDate, nakshatra, gotra, rasi });

      Alert.alert(
        'Confirm Submission',
        `Please confirm your details:\n\nName: ${name}\nPhone: ${phone}\nTower: ${tower}\nFlat: ${flat}\nPooja: ${pooja}\nDate: ${date}\nNakshatra: ${nakshatra}\nGotra: ${gotra}\nRasi: ${rasi}`,
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
                date: isoFormattedDate, // Use the ISO formatted date
                poojaName: pooja,
                userId,
                nakshatra, // Include Nakshatra
                gotra, // Include Gotra
                rasi, // Include Rasi
              };

              try {
                const response = await fetch('https://japa-meev.onrender.com/request', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });

                const data = await response.json();
                console.log('API Response:', data);

                setLoading(false);

                if (response.ok) {
                  setFormData({
                    name: '',
                    tower: '',
                    flat: '',
                    pooja: '',
                    date: '',
                    phone: '',
                    nakshatra: '',
                    gotra: '',
                    rasi: '',
                  });
                  navigation.navigate('Success');
                } else {
                  Alert.alert('Error', data?.error || 'Submission failed. Please try again.');
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
      {/* Full-Screen Gradient Loading */}
      {loading && (
        <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </LinearGradient>
      )}

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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
              {['name', 'tower', 'flat'].map((field, index) => (
                <View key={index} style={styles.inputGroup}>
                  <Text style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={formData[field]}
                    onChangeText={(text) => handleChange(field, text)}
                    placeholderTextColor="#aaa"
                  />
                  {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
                </View>
              ))}

              {/* Nakshatra Dropdown */}
              <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nakshatra</Text>
                  <Picker
                    selectedValue={formData.nakshatra}
                    onValueChange={(value) => handleChange('nakshatra', value)}
                    style={[styles.input, styles.picker, { color: formData.nakshatra ? '#000' : '#B0B0B0' }]}
                  >
                    <Picker.Item label="Select Nakshatra" value="" />
                    {nakshatras.map((nakshatra, index) => (
                      <Picker.Item key={index} label={nakshatra} value={nakshatra} />
                    ))}
                  </Picker>
                  {errors.nakshatra && <Text style={styles.errorText}>{errors.nakshatra}</Text>}
                </View>

                {/* Rasi Dropdown */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Rasi (Zodiac Sign)</Text>
                  <Picker
                    selectedValue={formData.rasi}
                    onValueChange={(value) => handleChange('rasi', value)}
                    style={[styles.input, styles.picker, { color: formData.rasi ? '#000' : '#B0B0B0' }]}
                  >
                    <Picker.Item label="Select Rasi" value="" />
                    {rasis.map((rasi, index) => (
                      <Picker.Item key={index} label={rasi} value={rasi} />
                    ))}
                  </Picker>
                  {errors.rasi && <Text style={styles.errorText}>{errors.rasi}</Text>}
                </View>

              {/* Pooja Details */}
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

              {/* Date Picker */}
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={[styles.input, { justifyContent: 'center' }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{ color: formData.date ? '#000' : '#aaa', fontSize: 16 }}>
                    {formData.date || 'Select Date (DD-MM-YYYY)'}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    minimumDate={new Date()} // This line freezes past dates
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        const day = selectedDate.getDate().toString().padStart(2, '0');
                        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
                        const year = selectedDate.getFullYear();
                        const formatted = `${day}-${month}-${year}`;
                        setFormData({ ...formData, date: formatted });
                      }
                    }}
                  />
                )}

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

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure it's above other content
  },
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
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
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

export default RequestForm;
