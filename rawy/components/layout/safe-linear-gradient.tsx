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
 *   gradient view isn't registered.
 */
export default function SafeLinearGradient(props: Props) {
  const { colors, style, children, ...rest } = props;

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

  const bg = colors && colors.length ? colors[0] : 'transparent';
  return (
    <View style={[{ backgroundColor: bg }, style]} {...rest}>
      {children}
    </View>
  );
}
