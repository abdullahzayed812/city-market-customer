import React, { useRef, useEffect } from 'react';
import { StyleSheet, Dimensions, StatusBar, Animated } from 'react-native';
import { View } from 'react-native';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      <Animated.Image
        source={require('../../assets/images/splash.png')}
        style={[styles.backgroundImage, { opacity: fadeAnim }]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundImage: {
    width,
    height,
    position: 'absolute',
  },
});

export default SplashScreen;
