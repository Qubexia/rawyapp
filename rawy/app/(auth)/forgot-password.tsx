import React from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import { Stack, router } from 'expo-router';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';

import { FormInput } from '@/components/ui/FormInput';
import { useForgotPassword } from '@/hooks/auth/use-forgot-password';
import { Spacing, Radius } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const { control, errors, isLoading, serverError, success, email, handleSubmit } =
    useForgotPassword();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: '#FFFFFF' }]}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Back button */}
              <Button
                mode="text"
                icon={() => <ArrowLeft size={18} color={theme.colors.onSurfaceVariant} />}
                onPress={() => router.back()}
                style={styles.backButton}
                labelStyle={{ color: theme.colors.onSurfaceVariant }}
              >
                Back
              </Button>

              {/* Card */}
              <Surface style={styles.card} elevation={2}>
                {success ? (
                  /* ── Success state ── */
                  <View style={styles.successContainer}>
                    <CheckCircle size={56} color={theme.colors.primary} strokeWidth={1.5} />
                    <Text
                      variant="headlineSmall"
                      style={[styles.cardTitle, { marginTop: Spacing.md }]}
                    >
                      Check your email
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={[styles.cardSubtitle, { textAlign: 'center' }]}
                    >
                      We sent a 6-digit reset code to{'\n'}
                      <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
                        {email}
                      </Text>
                    </Text>

                    <Button
                      mode="contained"
                      onPress={() =>
                        router.push({
                          pathname: '/(auth)/reset-password' as any,
                          params: { email },
                        })
                      }
                      contentStyle={styles.submitContent}
                      style={[styles.submitButton, { marginTop: Spacing.xl }]}
                      labelStyle={styles.submitLabel}
                    >
                      Enter reset code
                    </Button>

                    <Button
                      mode="text"
                      onPress={() => router.back()}
                      style={{ marginTop: Spacing.sm }}
                      labelStyle={{ color: theme.colors.onSurfaceVariant }}
                    >
                      Back to sign in
                    </Button>
                  </View>
                ) : (
                  /* ── Form state ── */
                  <>
                    <Text variant="headlineSmall" style={styles.cardTitle}>
                      Forgot password?
                    </Text>
                    <Text variant="bodyMedium" style={styles.cardSubtitle}>
                      Enter your email and we&apos;ll send you a reset code
                    </Text>

                    <View style={styles.form}>
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

                      {!!serverError && (
                        <Surface style={styles.errorBanner} elevation={0}>
                          <Text style={styles.errorText}>{serverError}</Text>
                        </Surface>
                      )}

                      <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={isLoading}
                        disabled={isLoading}
                        contentStyle={styles.submitContent}
                        style={styles.submitButton}
                        labelStyle={styles.submitLabel}
                      >
                        Send reset code
                      </Button>
                    </View>
                  </>
                )}
              </Surface>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    color: '#6B7280',
    marginBottom: Spacing.xl,
  },
  form: { gap: Spacing.md },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  errorText: { color: '#DC2626', fontSize: 13 },
  submitButton: { borderRadius: Radius.sm, marginTop: Spacing.sm },
  submitContent: { paddingVertical: Spacing.xs },
  submitLabel: { fontWeight: '700', fontSize: 15 },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
});
