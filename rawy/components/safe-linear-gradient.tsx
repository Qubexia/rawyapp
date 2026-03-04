import React from 'react';
import { View, ViewProps, StyleProp, ViewStyle, UIManager, Platform } from 'react-native';

type Props = ViewProps & {
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * SafeLinearGradient
 * - Uses `expo-linear-gradient` on platforms where it's available.
 * - Falls back to a plain `View` (using the first color) when the native
 *   gradient view isn't registered (prevents "Unable to get the view config"
 *   runtime warning in environments like Expo Go / web where native module
 *   may not be present).
 */
export default function SafeLinearGradient(props: Props) {
  const { colors, style, children, ...rest } = props;

  // Check if the native view manager for ExpoLinearGradient is registered.
  // If it's missing (e.g., running in Expo Go without native plugin), avoid
  // requiring the native module to prevent view config warnings.
  const viewManagerName = 'ExpoLinearGradient';
  let canUseNative = false;
  try {
    if (UIManager && typeof UIManager.getViewManagerConfig === 'function') {
      canUseNative = !!UIManager.getViewManagerConfig(viewManagerName);
    }
  } catch (e) {
    canUseNative = false;
  }

  if (canUseNative) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { LinearGradient } = require('expo-linear-gradient');
      if (LinearGradient) {
        return (
          // @ts-ignore - dynamic require
          <LinearGradient colors={colors || ['transparent']} style={style} {...rest}>
            {children}
          </LinearGradient>
        );
      }
    } catch (e) {
      // fall through to fallback view
    }
  }

  // Fallback: use a View with the first color as background.
  const bg = colors && colors.length ? colors[0] : 'transparent';
  return (
    <View style={[{ backgroundColor: bg }, style]} {...rest}>
      {children}
    </View>
  );
}
