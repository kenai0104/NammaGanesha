import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

const AddressScreen = ({ navigation }) => {
  const [tower, setTower] = useState('');
  const [flat, setFlat] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [gotra, setGotra] = useState('');
  const [rasi, setRasi] = useState('');
  const [userId, setUserId] = useState('');

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserId(parsedUser.id);
        }
      } catch (err) {
        console.error('Failed to load user from storage', err);
      }
    };

    loadUserId();

    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 2500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSave = async () => {
    if (!tower || !flat || !nakshatra || !gotra || !rasi) {
      Alert.alert('Missing Info', 'Please enter all required fields.');
      return;
    }

    try {
      const response = await fetch(`https://japa-meev.onrender.com/update-profile/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tower, flat, nakshatra, gotra, rasi }),  // Include Nakshatra, Gotra, and Rasi
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Address and details updated successfully.', [
          {
            text: 'OK',
            onPress: () => navigation.replace('Home', { id: userId }),
          },
        ]);
      } else {
        console.error('Update error:', result);
        Alert.alert('Update Failed', result.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error('Network error:', err);
      Alert.alert('Network Error', 'Could not connect to the server.');
    }
  };

  // List of 29 Nakshatras
  const nakshatras = [
    'Ashvini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
    'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
    'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada',
    'Revati',
  ];

  // List of 12 Zodiac Signs (Rasi)
  const rasis = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.headerGradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Details</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
          <Animated.Image
            source={require('../assets/god.jpeg')}
            style={[styles.headerImage, { transform: [{ scale: scaleAnim }] }]}
            resizeMode="contain"
          />

          <View style={styles.form}>
            <Text style={styles.label}>Tower</Text>
            <TextInput
              value={tower}
              onChangeText={setTower}
              placeholder="Enter tower name"
              style={styles.input}
              placeholderTextColor="#B0B0B0"
            />

            <Text style={styles.label}>Flat</Text>
            <TextInput
              value={flat}
              onChangeText={setFlat}
              placeholder="Enter flat number"
              style={styles.input}
              keyboardType="numeric"
              placeholderTextColor="#B0B0B0"
            />

            {/* Nakshatra dropdown */}
            <Text style={styles.label}>Nakshatra</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={nakshatra}
                onValueChange={(itemValue) => setNakshatra(itemValue)}
                style={[styles.picker, { color: nakshatra ? '#000' : '#B0B0B0' }]}>
                {/* Placeholder */}
                <Picker.Item label="Nakshatra" value="" color="#B0B0B0" />
                {nakshatras.map((nakshatraName, index) => (
                  <Picker.Item key={index} label={nakshatraName} value={nakshatraName} />
                ))}
              </Picker>
            </View>

            {/* Rasi dropdown */}
            <Text style={styles.label}>Rasi (Zodiac Sign)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={rasi}
                onValueChange={(itemValue) => setRasi(itemValue)}
                style={[styles.picker, { color: rasi ? '#000' : '#B0B0B0' }]}>
                {/* Placeholder */}
                <Picker.Item label="Rasi" value="" color="#B0B0B0" />
                {rasis.map((rasiName, index) => (
                  <Picker.Item key={index} label={rasiName} value={rasiName} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Gotra</Text>
            <TextInput
              value={gotra}
              onChangeText={setGotra}
              placeholder="Enter Gotra"
              style={styles.input}
              placeholderTextColor="#B0B0B0"
            />

            <TouchableOpacity
              style={[styles.saveButton, !userId && { backgroundColor: '#aaa' }]}
              onPress={handleSave}
              disabled={!userId}
            >
              <Text style={styles.saveButtonText}>Save Details</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 0,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
    padding: 16,
  },
  headerImage: {
    width: 180,
    height: 120,
    alignSelf: 'center',
    marginBottom: 10,
    borderRadius: 50,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
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
  saveButton: {
    backgroundColor: '#FF7E5F',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
