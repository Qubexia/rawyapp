/**
 * Rawy Design System — theme tokens for the entire app.
 *
 * Provides:
 *  - Light & dark color palettes
 *  - Spacing, border-radius, typography scales
 *  - React Native Paper MD3 theme objects
 */

import { Platform } from 'react-native';
import {
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
} from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// ─── Brand palette ───────────────────────────────────────────────────────────

export const Palette = {
  primary: {
    50: '#F3F4F6',
    100: '#E5E7EB',
    200: '#D1D5DB',
    300: '#9CA3AF',
    400: '#6B7280',
    500: '#374151',
    600: '#1F2937',
    700: '#111827',
    800: '#000000',
    900: '#000000',
  },
  secondary: {
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
  },
  green: {
    400: '#34D399',
    500: '#00D2A0',
  },
  dark: {
    bg: '#0F0F1A',
    surface: '#1A1A2E',
    surfaceVariant: '#252540',
    elevated: '#2A2A45',
    border: '#35355A',
  },
  light: {
    bg: '#F8F9FC',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F3F8',
    elevated: '#FFFFFF',
    border: '#E4E7EC',
  },
  text: {
    darkPrimary: '#FFFFFF',
    darkSecondary: '#A0A0B8',
    darkTertiary: '#6B6B85',
    lightPrimary: '#111827',
    lightSecondary: '#6B7280',
    lightTertiary: '#9CA3AF',
  },
} as const;

// ─── Spacing & Radius ────────────────────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  hero: 32,
} as const;

// ─── Backward-compatible Colors export ───────────────────────────────────────

export const Colors = {
  light: {
    text: Palette.text.lightPrimary,
    background: Palette.light.bg,
    tint: '#000000',
    icon: Palette.text.lightSecondary,
    tabIconDefault: Palette.text.lightTertiary,
    tabIconSelected: '#000000',
  },
  dark: {
    text: Palette.text.darkPrimary,
    background: Palette.dark.bg,
    tint: '#FFFFFF',
    icon: Palette.text.darkSecondary,
    tabIconDefault: Palette.text.darkTertiary,
    tabIconSelected: '#FFFFFF',
  },
} as const;

// ─── React Native Paper MD3 Themes ──────────────────────────────────────────

const fontConfig = {
  fontFamily: FontFamily.regular,
};

export const PaperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#000000',
    primaryContainer: '#F3F4F6',
    secondary: Palette.secondary[500],
    secondaryContainer: Palette.secondary[400],
    background: Palette.light.bg,
    surface: Palette.light.surface,
    surfaceVariant: Palette.light.surfaceVariant,
    error: '#EF4444',
    onPrimary: '#FFFFFF',
    onBackground: Palette.text.lightPrimary,
    onSurface: Palette.text.lightPrimary,
    onSurfaceVariant: Palette.text.lightSecondary,
    outline: Palette.light.border,
    elevation: {
      level0: 'transparent',
      level1: Palette.light.surface,
      level2: Palette.light.surfaceVariant,
      level3: Palette.light.elevated,
      level4: Palette.light.elevated,
      level5: Palette.light.elevated,
    },
  },
};

export const PaperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FFFFFF',
    primaryContainer: '#374151',
    secondary: Palette.secondary[500],
    secondaryContainer: Palette.secondary[600],
    background: Palette.dark.bg,
    surface: Palette.dark.surface,
    surfaceVariant: Palette.dark.surfaceVariant,
    error: '#FF4757',
    onPrimary: '#FFFFFF',
    onBackground: Palette.text.darkPrimary,
    onSurface: Palette.text.darkPrimary,
    onSurfaceVariant: Palette.text.darkSecondary,
    outline: Palette.dark.border,
    elevation: {
      level0: 'transparent',
      level1: Palette.dark.surface,
      level2: Palette.dark.surfaceVariant,
      level3: Palette.dark.elevated,
      level4: Palette.dark.elevated,
      level5: Palette.dark.elevated,
    },
  },
};

// ─── Fonts (Expo-compatible) ─────────────────────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
