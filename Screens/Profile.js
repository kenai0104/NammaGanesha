import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StatusBar,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const Profile = ({ navigation }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    tower: '',
    flat: '',
    nakshatra: '',
    gotra: '',
    rasi: '',
  });

  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state for data fetching

useEffect(() => {
  const loadProfileData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : {};

      if (!parsedUser?.id) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        return;
      }

      const response = await fetch(`https://japa-meev.onrender.com/user-profile/${parsedUser.id}`);
      const data = await response.json();

      if (response.ok) {
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          tower: data.tower || '',
          flat: data.flat || '',
          nakshatra: data.nakshatra || '',  // Fetch Nakshatra
          gotra: data.gotra || '',          // Fetch Gotra
          rasi: data.rasi || '',            // Fetch Rasi
        });

        // Check if any of the required fields are empty and redirect to the Address screen
        if (!data.tower || !data.flat || !data.gotra || !data.nakshatra || !data.rasi) {
          // Wait for 1 second after loading, then navigate
          setTimeout(() => {
            navigation.replace('Address');
          }, 1000); // Delay navigation by 1 second
        }
      } else {
        console.warn('Failed to fetch user profile:', data.message);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      Alert.alert('Error', 'Unable to fetch profile. Please try again.');
    } finally {
      // Wait 1 second before hiding the loading screen
      setTimeout(() => {
        setLoading(false); // Set loading to false after 1 second delay
      }, 1000); // 1 second delay before stopping the loading
    }
  };

  loadProfileData();
}, []);



  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (!parsedUser?.id) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        return;
      }

      const { name, email, phone, tower, flat, nakshatra, gotra, rasi } = profile;

      if (!name.trim() || !email.trim() || !phone.trim()) {
        Alert.alert('Error', 'Name, Email, and Phone are required.');
        return;
      }

      const updatePayload = {};
      if (name !== parsedUser.name) updatePayload.name = name;
      if (email !== parsedUser.email) updatePayload.email = email;
      if (phone !== parsedUser.phone) updatePayload.phone = phone;
      if (tower !== parsedUser.tower) updatePayload.tower = tower;
      if (flat !== parsedUser.flat) updatePayload.flat = flat;
      if (nakshatra !== parsedUser.nakshatra) updatePayload.nakshatra = nakshatra;
      if (gotra !== parsedUser.gotra) updatePayload.gotra = gotra;
      if (rasi !== parsedUser.rasi) updatePayload.rasi = rasi;  // Add Rasi field to update

      if (Object.keys(updatePayload).length === 0) {
        Alert.alert('No Changes', 'No fields were changed.');
        return;
      }

      const response = await fetch(
        `https://japa-meev.onrender.com/update-profile/${parsedUser.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        }
      );

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error('[Profile Update] Invalid JSON from server:', responseText);
        Alert.alert('Error', 'Invalid response from server.');
        return;
      }

      if (response.ok) {
        const updatedUser = { ...parsedUser, ...data.user };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        Alert.alert('Success', 'Profile updated successfully.');
      } else {
        Alert.alert('Error', data?.error || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('[Profile Update] Error:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  const handlePasswordUpdate = async () => {
    const { current, new: newPass } = passwords;
    if (!current || !newPass) {
      Alert.alert('Error', 'Please enter both current and new passwords.');
      return;
    }

    const user = JSON.parse(await AsyncStorage.getItem('user'));
    const res = await fetch(
      `https://japa-meev.onrender.com/update-password/${user.id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
      }
    );
    const data = await res.json();

    if (res.ok) {
      Alert.alert('Success', 'Password updated.');
      setPasswords({ current: '', new: '' });
      setShowPasswordFields(false);
    } else {
      Alert.alert('Error', data?.error || 'Update failed.');
    }
  };

  const deleteAccount = async () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const user = JSON.parse(await AsyncStorage.getItem('user'));
          const res = await fetch(
            `https://japa-meev.onrender.com/delete/${user.id}`,
            {
              method: 'DELETE',
            }
          );
          if (res.ok) {
            await AsyncStorage.removeItem('user');
            Alert.alert('Deleted', 'Account deleted.');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } else {
            Alert.alert('Error', 'Failed to delete.');
          }
        },
      },
    ]);
  };

  // List of 29 Nakshatras
  const nakshatras = [
    'Ashvini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
    'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
    'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada',
    'Revati'
  ];

  // List of 12 Zodiac Signs (Rasi)
  const rasis = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

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
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={{ width: 28 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
              <Text style={styles.sectionTitle}>Account Info</Text>

              {['name', 'email', 'phone', 'tower', 'flat', 'gotra'].map((field, i) => (
                <View key={i} style={styles.inputGroup}>
                  <Text style={styles.label}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={profile[field]}
                    onChangeText={(text) => handleChange(field, text)}
                    keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
                    autoCapitalize={field === 'email' ? 'none' : 'sentences'}
                    placeholderTextColor="#aaa"
                  />
                </View>
              ))}

              {/* Nakshatra Dropdown */}
              <Text style={styles.label}>Nakshatra</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={profile.nakshatra}
                  onValueChange={(itemValue) => handleChange('nakshatra', itemValue)}
                  style={[styles.picker, { color: profile.nakshatra ? '#000' : '#B0B0B0' }]} // Black text
                >
                  <Picker.Item label="Select Nakshatra" value="" />
                  {nakshatras.map((nakshatraName, index) => (
                    <Picker.Item key={index} label={nakshatraName} value={nakshatraName} />
                  ))}
                </Picker>
              </View>

              {/* Rasi Dropdown */}
             <Text style={styles.label}>Rasi (Zodiac Sign)</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={profile.rasi}
                  onValueChange={(itemValue) => handleChange('rasi', itemValue)}
                  style={[styles.picker, { color: profile.rasi ? '#000' : '#B0B0B0' }]} // Black text
                >
                  <Picker.Item label="Select Rasi" value="" />
                  {rasis.map((rasiName, index) => (
                    <Picker.Item key={index} label={rasiName} value={rasiName} />
                  ))}
                </Picker>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Profile</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Security Settings</Text>

              <TouchableOpacity
                style={styles.togglePasswordButton}
                onPress={() => setShowPasswordFields(!showPasswordFields)}
              >
                <Text style={styles.togglePasswordText}>
                  {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
                </Text>
              </TouchableOpacity>

              {showPasswordFields && (
                <>
                  <TextInput
                    style={[styles.input, { color: '#000' }]}
                    placeholder="Current Password"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={4}
                    secureTextEntry
                    value={passwords.current}
                    onChangeText={(text) => setPasswords((prev) => ({ ...prev, current: text }))}
                  />

                  <TextInput
                    style={[styles.input, { color: '#000' }]}
                    placeholder="New Password"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={4}
                    secureTextEntry
                    value={passwords.new}
                    onChangeText={(text) => setPasswords((prev) => ({ ...prev, new: text }))}
                  />

                  <TouchableOpacity style={styles.saveButton} onPress={handlePasswordUpdate}>
                    <Text style={styles.saveButtonText}>Update Password</Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={styles.deleteButton} onPress={deleteAccount}>
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default Profile;


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
    fontWeight: '600',
    color: '#fff',
  },
  backIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff6ee',
  },
  formContainer: {
    padding: 24,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 14,
    elevation: 1,
  },
  saveButton: {
    backgroundColor: '#FF7E5F',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 15,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  togglePasswordButton: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  togglePasswordText: {
    color: '#FF7E5F',
    fontWeight: '600',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D8000C',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#D8000C',
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  pickerContainer: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  marginBottom: 12,
  overflow: 'hidden',
},
picker: {
  height: 50,
  paddingHorizontal: 10,
  backgroundColor: '#fff',
},
nakshatraPicker: {
  backgroundColor: '#FFEB3B', 
  borderColor: '#FBC02D', // Dark yellow border for Nakshatra
},
gotraPicker: {
  backgroundColor: '#A5D6A7', // Light green background for Gotra
  borderColor: '#388E3C', // Dark green border for Gotra
},
  errorText: {
    color: '#D8000C',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 6,
  },
});

