import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Footer = ({ onHistoryPress, onRequestPress, onProfilePress }) => {
  return (
    <LinearGradient colors={['#FF7E5F', '#FEB47B']} style={styles.footer}>
      <TouchableOpacity style={styles.footerIconWrapper} onPress={onHistoryPress}>
        <Image source={require('../assets/history.png')} style={styles.footerIcon} />
        <Text style={styles.footerLabel}>History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerIconWrapper} onPress={onRequestPress}>
        <Image source={require('../assets/interview.png')} style={styles.footerIcon} />
        <Text style={styles.footerLabel}>Request</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerIconWrapper} onPress={onProfilePress}>
        <Image source={require('../assets/profile.png')} style={styles.footerIcon} />
        <Text style={styles.footerLabel}>Profile</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 18,
    borderTopWidth: 0.3,
    borderTopColor: '#eee',
  },
  footerIconWrapper: {
    alignItems: 'center',
  },
  footerIcon: {
    width: 26,
    height: 26,
    tintColor: '#fff',
  },
  footerLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    fontWeight: 'bold',
  },
});

export default Footer;
