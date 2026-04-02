import React from 'react';
import { TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Heart } from 'lucide-react-native';

interface AnimatedHeartProps {
  isLiked: boolean;
  onPress: () => void;
  size?: number;
  activeColor?: string;
  inactiveColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedHeart({
  isLiked,
  onPress,
  size = 24,
  activeColor = '#EF4444',
  inactiveColor = '#9CA3AF',
  style,
}: AnimatedHeartProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    // Provide tactile feedback
    Haptics.impactAsync(
      isLiked ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium
    ).catch(() => {});

    // Trigger bounce animation
    scale.value = withSequence(
      withSpring(0.8, { damping: 10, stiffness: 200 }),
      withSpring(1.2, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      activeOpacity={0.8} 
      style={style}
      accessibilityLabel={isLiked ? "Unlike" : "Like"}
      accessibilityHint={isLiked ? "Remove like from this episode" : "Like this episode"}
      accessibilityRole="button"
    >
      <Animated.View style={animatedStyle}>
        <Heart
          size={size}
          color={isLiked ? activeColor : inactiveColor}
          fill={isLiked ? activeColor : 'transparent'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
