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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    tower: '',
    flat: '',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const parsedUser = storedUser ? JSON.parse(storedUser) : {};

        if (!parsedUser?.id) {
          Alert.alert('Error', 'User ID not found. Please login again.');
          return;
        }

        // const response = await fetch(`https://testjapa.onrender.com/user-profile/${parsedUser.id}`);
                const response = await fetch(`https://japa-meev.onrender.com/user-profile/${parsedUser.id}`);

        const data = await response.json();

        if (response.ok) {
          setProfile({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            tower: data.tower || '',
            flat: data.flat || '',
          });
        } else {
          console.warn('Failed to fetch user profile:', data.message);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        Alert.alert('Error', 'Unable to fetch profile. Please try again.');
      }
    };

    loadProfileData();
  }, []);

  const handleChange = (field, value) =>
    setProfile((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (!parsedUser?.id) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        return;
      }

      const { name, email, phone, tower, flat } = profile;

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

      if (Object.keys(updatePayload).length === 0) {
        Alert.alert('No Changes', 'No fields were changed.');
        return;
      }

      const response = await fetch(
        `https://japa-meev.onrender.com/update-profile/${parsedUser.id}`,
                // `https://testjapa.onrender.com/update-profile/${parsedUser.id}`,

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
      // `https://testjapa.onrender.com/update-password/${user.id}`,
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
          // const res = await fetch(`https://testjapa.onrender.com/delete/${user.id}`, {
                      const res = await fetch(`https://japa-meev.onrender.com/delete/${user.id}`, {

            method: 'DELETE',
          });
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

  return (
    <>
      <StatusBar backgroundColor="#FF7E5F" barStyle="light-content" />
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

      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
              <Text style={styles.sectionTitle}>Account Info</Text>

              {['name', 'email', 'phone', 'tower', 'flat'].map((field, i) => (
                <TextInput
                  key={i}
                  style={[styles.input, { color: '#000' }]}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={profile[field]}
                  onChangeText={(text) => handleChange(field, text)}
                  keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
                  autoCapitalize={field === 'email' ? 'none' : 'sentences'}
                  placeholderTextColor="#aaa"
                />
              ))}

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
                    onChangeText={(text) =>
                      setPasswords((prev) => ({ ...prev, current: text }))
                    }
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
                    onChangeText={(text) =>
                      setPasswords((prev) => ({ ...prev, new: text }))
                    }
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
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
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
    marginBottom: 10,
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
    marginVertical: 10,
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
});
