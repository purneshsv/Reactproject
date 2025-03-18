import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const MGLogo = ({size = 'medium'}) => {
  const circleSize = size === 'small' ? 40 : size === 'medium' ? 60 : 80;
  const fontSize = size === 'small' ? 16 : size === 'medium' ? 24 : 32;
  const companyNameSize = size === 'small' ? 14 : size === 'medium' ? 20 : 28;
  const sloganSize = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
  
  return (
    <View style={styles.container}>
      <View style={[styles.circle, {width: circleSize, height: circleSize}]}>
        <Text style={[styles.logoText, {fontSize}]}>mg</Text>
        <View style={styles.dot}></View>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.companyName, {fontSize: companyNameSize}]}>MG Health Tech</Text>
        <Text style={[styles.slogan, {fontSize: sloganSize}]}>Make Healthcare Accessible & Accurate</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    width: '100%',
  },
  circle: {
    backgroundColor: '#FF5722', // Bright orange color from the logo
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'System',
    marginBottom: -5, // Adjust the position of the text
  },
  dot: {
    position: 'absolute',
    top: '25%',
    right: '25%',
    width: 6,
    height: 6,
    backgroundColor: 'white',
    borderRadius: 3,
  },
  textContainer: {
    marginLeft: 10,
    flexDirection: 'column',
  },
  companyName: {
    color: '#0D47A1', // Deep blue color to match the logo
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  slogan: {
    color: '#333',
    fontWeight: '400',
  },
});

export default MGLogo;
