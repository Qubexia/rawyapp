import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import SafeLinearGradient from "@/components/safe-linear-gradient";
import {
  InputField,
  Card,
  ErrorBanner,
  SubmitButton,
} from "@/components/register";
import useLogin from "@/hooks/use-login";
import styles from "@/sheets/register";
import { router, Stack } from "expo-router";

export default function LoginScreen() {
  const { fields, setField, errors, isLoading, serverError, handleSubmit } =
    useLogin();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeLinearGradient colors={["#FFFFFF", "#F6F8FC"]} style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                { justifyContent: "center" },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.header}>
                <Text style={styles.appName}>Rawy</Text>
                <Text style={styles.tagline}>Discover · Listen · Create</Text>
              </View>

              <Card style={styles.card}>
                <Text style={styles.cardTitle}>Welcome back</Text>

                <AnimatedForm>
                  <InputField
                    label="Email Address"
                    leftIcon={
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color={errors.email ? "#EF4444" : "#000000"}
                      />
                    }
                    placeholder="you@example.com"
                    value={fields.email}
                    onChangeText={(v) => setField("email", v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    error={errors.email}
                  />

                  <Text style={styles.label}>Password</Text>
                  <View
                    style={[
                      styles.inputGroup,
                      !!errors.password && styles.inputGroupError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={errors.password ? "#EF4444" : "#000000"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Your password"
                      placeholderTextColor="#6B7A90"
                      value={fields.password}
                      onChangeText={(v) => setField("password", v)}
                      secureTextEntry={!isPasswordVisible}
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={
                          isPasswordVisible ? "eye-outline" : "eye-off-outline"
                        }
                        size={18}
                        color="#6B7A90"
                      />
                    </TouchableOpacity>
                  </View>
                  {!!errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}

                  <ErrorBanner message={serverError} />

                  <View style={styles.submitWrapper}>
                    <SubmitButton onPress={handleSubmit} loading={isLoading}>
                      <>
                        <Text style={styles.submitText}>Sign In</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color="#FFFFFF"
                          style={{ marginLeft: 8 }}
                        />
                      </>
                    </SubmitButton>
                  </View>
                </AnimatedForm>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <TouchableOpacity
                    onPress={() => {
                      router.push("/register");
                    }}
                  >
                    <Text style={styles.footerLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </SafeLinearGradient>
    </>
  );
}

function AnimatedForm({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
