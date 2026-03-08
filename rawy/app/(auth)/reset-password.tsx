import React from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, Surface, useTheme } from "react-native-paper";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Lock, KeyRound, ArrowLeft, CheckCircle } from "lucide-react-native";

import { FormInput } from "@/components/ui/FormInput";
import { useResetPassword } from "@/hooks/auth/use-reset-password";
import { Spacing, Radius } from "@/constants/theme";

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const { email } = useLocalSearchParams<{ email: string }>();

  const { control, errors, isLoading, serverError, handleSubmit } =
    useResetPassword(email ?? "");

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: "#FFFFFF" }]}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Back button */}
              <Button
                mode="text"
                icon={() => (
                  <ArrowLeft size={18} color={theme.colors.onSurfaceVariant} />
                )}
                onPress={() => router.back()}
                style={styles.backButton}
                labelStyle={{ color: theme.colors.onSurfaceVariant }}
              >
                Back
              </Button>

              {/* Card */}
              <Surface style={styles.card} elevation={2}>
                <View style={styles.iconRow}>
                  <KeyRound
                    size={40}
                    color={theme.colors.primary}
                    strokeWidth={1.5}
                  />
                </View>

                <Text variant="headlineSmall" style={styles.cardTitle}>
                  Reset password
                </Text>
                <Text variant="bodyMedium" style={styles.cardSubtitle}>
                  Enter the 6-digit code sent to {email ?? "your email"}, then
                  choose a new password.
                </Text>

                <View style={styles.form}>
                  <FormInput
                    name="otp"
                    control={control}
                    label="6-digit code"
                    placeholder="123456"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}

                    icon={
                      <CheckCircle
                        size={20}
                        color={
                          errors.otp
                            ? theme.colors.error
                            : theme.colors.onSurfaceVariant
                        }
                      />
                    }
                  />

                  <FormInput
                    name="newPassword"
                    control={control}
                    label="New Password"
                    placeholder="Min. 8 characters"
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isLoading}
                    icon={
                      <Lock
                        size={20}
                        color={
                          errors.newPassword
                            ? theme.colors.error
                            : theme.colors.onSurfaceVariant
                        }
                      />
                    }
                  />

                  <FormInput
                    name="confirmPassword"
                    control={control}
                    label="Confirm New Password"
                    placeholder="Repeat your new password"
                    secureTextEntry
                    autoCapitalize="none"
                    editable={!isLoading}
                    icon={
                      <Lock
                        size={20}
                        color={
                          errors.confirmPassword
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
                    Reset password
                  </Button>

                  <Button
                    mode="text"
                    onPress={() => router.push("/(auth)/forgot-password" as any)}
                    style={{ marginTop: Spacing.xs }}
                    labelStyle={{
                      color: theme.colors.onSurfaceVariant,
                      fontSize: 13,
                    }}
                  >
                    Didn&apos;t receive a code? Resend
                  </Button>
                </View>
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
    alignSelf: "flex-start",
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  iconRow: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontWeight: "700",
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  cardSubtitle: {
    color: "#6B7280",
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  form: { gap: Spacing.md },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },
  errorText: { color: "#DC2626", fontSize: 13 },
  submitButton: { borderRadius: Radius.sm, marginTop: Spacing.sm },
  submitContent: { paddingVertical: Spacing.xs },
  submitLabel: { fontWeight: "700", fontSize: 15 },
});
