
import React, { useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

const LOGO_SIZE = 120;
const EXIT_START = 2200; // Time before exit starts

interface SplashScreenAnimatedProps {
  onFinish: () => void;
}

export default function SplashScreenAnimated({ onFinish }: SplashScreenAnimatedProps) {
  // Shared values for independent control
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.9);
  const textOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  const handleFinish = useCallback(() => {
    onFinish();
  }, [onFinish]);

  useEffect(() => {
    // 1. Logo Entrance: Fade in and Scale
    logoOpacity.value = withTiming(1, { 
      duration: 700, 
      easing: Easing.out(Easing.cubic) 
    });
    logoScale.value = withTiming(1, { 
      duration: 900, 
      easing: Easing.out(Easing.back(1.2)) 
    });

    // 2. Text Entrance: Delayed fade in (the "fade" effect)
    textOpacity.value = withDelay(500, withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.quad) 
    }));

    // 3. Exit: Smooth fade out of everything
    containerOpacity.value = withDelay(EXIT_START, 
      withTiming(0, { duration: 500, easing: Easing.inOut(Easing.quad) }, () => {
        runOnJS(handleFinish)();
      })
    );
  }, [handleFinish]);

  // Animated Styles
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={styles.centerContent}>
        <Animated.View style={logoStyle}>
          <Image
            source={require('@/assets/images/app-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Animated.Text style={styles.title}>
            Rawy
          </Animated.Text>
          <Animated.Text style={styles.subtitle}>
            Your World of Podcasts
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 38,
    fontFamily: 'Inter_700Bold',
    color: '#111827',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
});
