import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Footer = ({ onHistoryPress, onRequestPress }) => {
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
    // Don't add backgroundColor here to allow gradient to work
  },
  footerIconWrapper: {
    alignItems: 'center',
  },
  footerIcon: {
    width: 26,
    height: 26,
    tintColor: '#fff', // Match with gradient text
  },
  footerLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    fontWeight: 'bold',
  },
});

export default Footer;
