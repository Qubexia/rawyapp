/**
 * Register screen with React Native Paper + Lucide Icons + React Hook Form.
 * Supports Listener and Creator tabs.
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  useWindowDimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Button, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Headphones,
  Mic,
  Radio,
  Info,
} from 'lucide-react-native';

import { FormInput } from '@/components/ui/FormInput';
import { useRegister } from '@/hooks/use-register';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { Palette, Spacing, Radius } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const {
    activeTab,
    setActiveTab,
    control,
    errors,
    isLoading,
    serverError,
    handleSubmit,
  } = useRegister();
  
  const { signInWithGoogle, googleLoading, googleError, isReady } = useGoogleAuth();

  // Animation values
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: activeTab === 'user' ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab]);

  const tabWidth = width - 2 * Spacing.lg - 2 * Spacing.lg; // outer + card padding
  const indicatorTranslateX = indicatorPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [4, tabWidth / 2],
  });

  return (
    <View
      style={[styles.root, { backgroundColor: '#FFFFFF' }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Brand Header ── */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: theme.colors.primaryContainer }]}>
                <Headphones size={36} color={theme.colors.primary} strokeWidth={1.5} />
              </View>
              <Text variant="headlineLarge" style={[styles.appName, { color: theme.colors.onBackground }]}>
                Rawy
              </Text>
              <Text variant="bodyMedium" style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>
                Discover · Listen · Create
              </Text>
            </View>

            {/* ── Card ── */}
            <Surface style={styles.card} elevation={2}>
              <Text variant="headlineSmall" style={styles.cardTitle}>
                Create your account
              </Text>

              {/* Tab bar */}
              <View style={styles.tabContainer}>
                <Animated.View
                  style={[
                    styles.tabIndicator,
                    {
                      transform: [{ translateX: indicatorTranslateX }],
                      width: tabWidth / 2 - 4,
                    },
                  ]}
                />
                <TouchableOpacity
                  style={styles.tabButton}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('user')}
                >
                  <Headphones
                    size={16}
                    color={activeTab === 'user' ? '#FFFFFF' : Palette.text.lightTertiary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'user' && styles.activeTabText,
                    ]}
                  >
                    Listener
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tabButton}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('creator')}
                >
                  <Mic
                    size={16}
                    color={
                      activeTab === 'creator'
                        ? Palette.primary[700]
                        : Palette.text.lightTertiary
                    }
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'creator' && styles.activeCreatorTabText,
                    ]}
                  >
                    Creator
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Creator hint */}
              {activeTab === 'creator' && (
                <View style={styles.creatorHint}>
                  <Info
                    size={15}
                    color={Palette.primary[500]}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.creatorHintText}>
                    As a creator you can publish podcasts and grow your audience.
                  </Text>
                </View>
              )}

              {/* Form */}
              <Animated.View style={[styles.form, { opacity: fadeAnim }]}>
                <FormInput
                  name="name"
                  control={control}
                  label="Full Name"
                  placeholder="e.g. Ahmed Khalid"
                  autoCapitalize="words"
                  editable={!isLoading}
                  icon={
                    <User
                      size={20}
                      color={
                        errors.name
                          ? theme.colors.error
                          : theme.colors.onSurfaceVariant
                      }
                    />
                  }
                />

                <FormInput
                  name="email"
                  control={control}
                  label="Email Address"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  icon={
                    <Mail
                      size={20}
                      color={
                        errors.email
                          ? theme.colors.error
                          : theme.colors.onSurfaceVariant
                      }
                    />
                  }
                />

                {activeTab === 'creator' && (
                  <FormInput
                    name="showName"
                    control={control}
                    label="Podcast / Show Name"
                    placeholder="My Awesome Show"
                    autoCapitalize="words"
                    editable={!isLoading}
                    icon={
                      <Radio
                        size={20}
                        color={
                          errors.showName
                            ? theme.colors.error
                            : theme.colors.onSurfaceVariant
                        }
                      />
                    }
                  />
                )}

                <FormInput
                  name="password"
                  control={control}
                  label="Password"
                  placeholder="At least 8 characters"
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                  icon={
                    <Lock
                      size={20}
                      color={
                        errors.password
                          ? theme.colors.error
                          : theme.colors.onSurfaceVariant
                      }
                    />
                  }
                />

                {/* Server error */}
                {(!!serverError || !!googleError) && (
                  <Surface style={styles.errorBanner} elevation={0}>
                    <Text style={styles.errorText}>{serverError || googleError}</Text>
                  </Surface>
                )}

                {/* Submit */}
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={isLoading}
                  contentStyle={styles.submitContent}
                  style={styles.submitButton}
                  labelStyle={styles.submitLabel}
                  icon={() => <ArrowRight size={18} color="#FFFFFF" />}
                >
                  Get Started
                </Button>
              </Animated.View>

              {/* Divider */}
              <View style={styles.divider}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: theme.colors.outlineVariant || theme.colors.outline },
                  ]}
                />
                <Text variant="labelMedium" style={styles.dividerText}>
                  or
                </Text>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: theme.colors.outlineVariant || theme.colors.outline },
                  ]}
                />
              </View>

              {/* Google Sign In */}
              <Button
                mode="outlined"
                onPress={signInWithGoogle}
                loading={googleLoading}
                disabled={!isReady || googleLoading || isLoading}
                contentStyle={styles.socialContent}
                style={styles.socialButton}
                labelStyle={styles.socialLabel}
                textColor={Palette.text.lightPrimary}
                icon="google"
              >
                Continue with Google
              </Button>

              <View style={{ height: Spacing.lg }} />

              {/* Footer */}
              <View style={styles.footer}>
                <Text variant="bodyMedium" style={styles.footerText}>
                  Already have an account?{' '}
                </Text>
                <Button
                  mode="text"
                  compact
                  onPress={() => router.push('/login')}
                  labelStyle={styles.footerLink}
                >
                  Sign In
                </Button>
              </View>
            </Surface>

            <View style={{ height: Spacing.xl }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 36,
    letterSpacing: 1,
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs,
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontWeight: '700',
    color: Palette.text.lightPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  // ── Tab bar ──
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Palette.light.surfaceVariant,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.md,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: Radius.sm,
    backgroundColor: Palette.primary[500],
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text.lightTertiary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  activeCreatorTabText: {
    color: Palette.primary[700],
  },
  // ── Creator hint ──
  creatorHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary[50],
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  creatorHintText: {
    flex: 1,
    fontSize: 12,
    color: Palette.primary[700],
  },
  // ── Form ──
  form: {
    gap: Spacing.sm,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
  submitButton: {
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  submitContent: {
    height: 52,
    flexDirection: 'row-reverse',
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  socialButton: {
    borderRadius: Radius.md,
    borderColor: Palette.light.border,
    backgroundColor: '#FFFFFF',
  },
  socialContent: {
    height: 52,
  },
  socialLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  // ── Divider ──
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: Palette.text.lightTertiary,
  },
  // ── Footer ──
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: Palette.text.lightSecondary,
  },
  footerLink: {
    fontWeight: '600',
  },
});
