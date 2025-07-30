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

const Home = ({ navigation }) => {
  const [formData, setFormData] = useState({
  name: '',
  tower: '',
  flat: '',
  japaName: '',
  japaCount: '',
  date: '',  // manual date input
});


  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [nameA, setName] = useState('');
  const [id, setId] = useState('');

  const formatDateInput = (text) => {
  // Remove non-numeric characters
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


useEffect(() => {
  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setName(user.name);
        setId(user.id);
      }
    } catch (err) {
      console.error('AsyncStorage error:', err);
    }
  };

  loadUser();
}, []);

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
    if (!user.id || !user.name) {
      Alert.alert("Error", "Invalid user data. Please login again.");
      await AsyncStorage.removeItem('user');
      navigation.replace('Login');
      return;
    }

    setId(user.id);
    setName(user.name);

    const { name, tower, flat, japaName, japaCount, date } = formData;
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!tower.trim()) newErrors.tower = 'Tower is required.';
    if (!flat.trim()) newErrors.flat = 'Flat is required.';
    if (!japaName.trim()) newErrors.japaName = 'Japa Name is required.';
    if (!japaCount.trim()) {
      newErrors.japaCount = 'Japa Count is required.';
    } else if (isNaN(japaCount) || parseInt(japaCount) <= 0) {
      newErrors.japaCount = 'Must be a positive number.';
    }

    // Validate and reformat the date
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

    // Convert date from DD-MM-YYYY to YYYY-MM-DD
    const [day, month, year] = date.split('-');
    const isoFormattedDate = `${year}-${month}-${day}`;

    setValidationErrors({});
    const payload = {
      name,
      tower,
      flat,
      date: isoFormattedDate,
      japaName,
      japaCount: parseInt(japaCount, 10),
      userId: user.id,
    };

    setLoading(true);
    const response = await fetch('https://japa-meev.onrender.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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


const goToRequest = () => navigation.navigate('RequestForm', { id });

const goToProfile = async() => {
    const storedUser = await AsyncStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    navigation.navigate('Profile', { id: user.id });
  } else {
    Alert.alert(
      "Login Required",
      "Please log in to view your Profile",
      [
        { text: "Login", onPress: () => navigation.replace('Login') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  }
};



const goToHistory = async () => {
  const storedUser = await AsyncStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    navigation.navigate('History', { id: user.id });
  } else {
    Alert.alert(
      "Login Required",
      "Please log in to view your Japa history.",
      [
        { text: "Login", onPress: () => navigation.replace('Login') },
        { text: "Cancel", style: "cancel" }
      ]
    );
  }
};


  return (
    <>
      <StatusBar backgroundColor="#FF7E5F" barStyle="light-content" />
      <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.headerGradient}>
        <SafeAreaView edges={['top']} style={styles.safeAreaTop}>
          <View style={styles.header}>
            <View style={styles.nameWrapper}>
              <Text
                style={styles.headerTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Hi {nameA}
              </Text>
            </View>
         <View style={styles.iconContainer}>
  {id ? (
    <TouchableOpacity
      onPress={() => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.removeItem('user');
              navigation.replace('Login');
            },
          },
        ]);
      }}
    >
      <Image source={require('../assets/power-off.png')} style={styles.headerIcon} />
    </TouchableOpacity>
  ) : null}
</View>


          </View>

        </SafeAreaView>
      </LinearGradient>

      <SafeAreaView edges={['left', 'right']} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Image source={require('../assets/om.jpg')} style={styles.logo} />

            <Text style={{ 
              textAlign: 'center', 
              marginBottom: 30, 
              color: 'brown' 
            }}>
            Namma Ganesha supports your daily Japa practice and enables you to submit devotional prayer requests with ease.
            </Text>



            <View style={styles.formCard}>
              {['name', 'tower', 'flat', 'japaName', 'japaCount'].map((field, index) => (
                <View key={index} style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder={field === 'japaCount' ? 'Japa Count' : field.charAt(0).toUpperCase() + field.slice(1)}
                    keyboardType={field === 'japaCount' ? 'numeric' : 'default'}
                    value={formData[field]}
                    onChangeText={(text) => setFormData({ ...formData, [field]: text })}
                    placeholderTextColor="#aaa"
                  />
                  {validationErrors[field] && (
                    <Text style={styles.errorText}>{validationErrors[field]}</Text>
                  )}
                </View>
              ))}

             <TextInput
              style={styles.input}
              placeholder="Date (DD-MM-YYYY)"
              value={formData.date}
              onChangeText={(text) =>
                setFormData({ ...formData, date: formatDateInput(text) })
              }
              keyboardType="numeric"
              placeholderTextColor="#aaa"
            />

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

      <Footer onHistoryPress={goToHistory} onRequestPress={goToRequest} onProfilePress={goToProfile} />
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
});
