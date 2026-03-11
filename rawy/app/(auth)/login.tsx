/**
 * Login screen with React Native Paper + Lucide Icons + React Hook Form.
 */

import React from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Button, Surface, useTheme } from "react-native-paper";
import { Stack, router } from "expo-router";
import { Mail, Lock, ArrowRight, Headphones } from "lucide-react-native";

import { FormInput } from "@/components/ui/FormInput";
import useLogin from "@/hooks/auth/use-login";
import { useGoogleAuth } from "@/hooks/auth/use-google-auth";
import { Palette, Spacing, Radius } from "@/constants/theme";

export default function LoginScreen() {
  const theme = useTheme();
  const { control, errors, isLoading, serverError, handleSubmit } = useLogin();
  const { signInWithGoogle, googleLoading, googleError, isReady } =
    useGoogleAuth();

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
              {/* ── Brand Header ── */}
              <View style={styles.header}>
                <View
                  style={[
                    styles.logoContainer,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <Headphones
                    size={36}
                    color={theme.colors.primary}
                    strokeWidth={1.5}
                  />
                </View>
                <Text
                  variant="headlineLarge"
                  style={[styles.appName, { color: theme.colors.onBackground }]}
                >
                  Rawy
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.tagline,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Discover · Listen · Create
                </Text>
              </View>

              {/* ── Card ── */}
              <Surface style={styles.card} elevation={2}>
                <Text variant="headlineSmall" style={styles.cardTitle}>
                  Welcome back
                </Text>
                <Text variant="bodyMedium" style={styles.cardSubtitle}>
                  Sign in to continue listening
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

                  <FormInput
                    name="password"
                    control={control}
                    label="Password"
                    placeholder="Your password"
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
                      <Text style={styles.errorText}>
                        {serverError || googleError}
                      </Text>
                    </Surface>
                  )}

                  {/* Forgot password link */}
                  <TouchableOpacity
                    onPress={() =>
                      router.push("/(auth)/forgot-password" as any)
                    }
                    style={styles.forgotLink}
                    activeOpacity={0.7}
                  >
                    <Text
                      variant="bodySmall"
                      style={[
                        styles.forgotLinkText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      Forgot password?
                    </Text>
                  </TouchableOpacity>

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
                    Sign In
                  </Button>

                  <TouchableOpacity
                    onPress={() => router.push("/(legal)/terms" as any)}
                    style={styles.termsLink}
                    activeOpacity={0.7}
                  >
                    <Text variant="bodySmall" style={styles.termsText}>
                      By continuing, you agree to our{" "}
                      <Text variant="bodySmall" style={styles.termsLinkText}>
                        Terms & Conditions
                      </Text>
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.divider}>
                  <View
                    style={[
                      styles.dividerLine,
                      {
                        backgroundColor:
                          theme.colors.outlineVariant || theme.colors.outline,
                      },
                    ]}
                  />
                  <Text variant="labelMedium" style={styles.dividerText}>
                    or
                  </Text>
                  <View
                    style={[
                      styles.dividerLine,
                      {
                        backgroundColor:
                          theme.colors.outlineVariant || theme.colors.outline,
                      },
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
                    Don&apos;t have an account?{" "}
                  </Text>
                  <Button
                    mode="text"
                    compact
                    onPress={() => router.push("/(auth)/register" as any)}
                    labelStyle={styles.footerLink}
                  >
                    Sign Up
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
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: Radius.xl,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  appName: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 36,
    letterSpacing: 1,
  },
  tagline: {
    color: "rgba(255,255,255,0.7)",
    marginTop: Spacing.xs,
  },
  card: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    backgroundColor: "#FFFFFF",
  },
  cardTitle: {
    fontWeight: "700",
    color: Palette.text.lightPrimary,
    textAlign: "center",
  },
  cardSubtitle: {
    color: Palette.text.lightSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  form: {
    gap: Spacing.sm,
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
  },
  submitButton: {
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  submitContent: {
    height: 52,
    flexDirection: "row-reverse",
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  socialButton: {
    borderRadius: Radius.md,
    borderColor: Palette.light.border,
    backgroundColor: "#FFFFFF",
  },
  socialContent: {
    height: 52,
  },
  socialLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: Palette.text.lightSecondary,
  },
  footerLink: {
    fontWeight: "600",
  },
  termsLink: {
    alignSelf: "center",
    paddingVertical: Spacing.xs,
  },
  termsText: {
    color: Palette.text.lightSecondary,
  },
  termsLinkText: {
    color: Palette.text.lightSecondary,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  forgotLink: {
    alignSelf: "flex-end",
    paddingVertical: Spacing.xs,
  },
  forgotLinkText: {
    fontWeight: "600",
  },
});
