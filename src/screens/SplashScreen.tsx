import React from 'react';
import { Image, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { colors } from '../theme';
import { View } from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.background} />
      <Image
        source={require('../../assets/images/splash.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    width: width,
    height: height,
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 82, 64, 0.2)', // Primary color with opacity
  },
  icon: {
    width: 150,
    height: 150,
  },
});

export default SplashScreen;
