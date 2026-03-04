import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  useWindowDimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SafeLinearGradient from "@/components/safe-linear-gradient";
import { useRegister } from "@/hooks/use-register";
import {
  InputField,
  Card,
  ErrorBanner,
  SubmitButton,
} from "@/components/register";
import styles from "@/sheets/register";

export default function RegisterScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const {
    activeTab,
    setActiveTab,
    fields,
    setField,
    errors,
    isLoading,
    serverError,
    handleSubmit,
  } = useRegister();

  // Animation values
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    // Animate the tab indicator
    Animated.spring(indicatorPosition, {
      toValue: activeTab === "user" ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();

    // Fade out and fade in the form
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab]);

  // Tab indicator dynamic styles
  const tabWidth = width - 96; // 24 outer padding * 2 + 24 card padding * 2
  const indicatorTranslateX = indicatorPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [4, tabWidth / 2],
  });

  return (
    <SafeLinearGradient
      colors={["#FFFFFF", "#F6F8FC", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Brand Header ── */}
            <View style={styles.header}>
              {/* Sound wave bars decoration */}

              <Text style={styles.appName}>Rawy</Text>
              <Text style={styles.tagline}>Discover · Listen · Create</Text>
            </View>

            {/* ── Card ── */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Create your account</Text>

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
                  onPress={() => setActiveTab("user")}
                >
                  <Ionicons
                    name="headset-outline"
                    size={16}
                    color={activeTab === "user" ? "#ffffff" : "#8A9BB0"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "user" && styles.activeTabText,
                    ]}
                  >
                    Listener
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tabButton}
                  activeOpacity={0.8}
                  onPress={() => setActiveTab("creator")}
                >
                  <Ionicons
                    name="mic-outline"
                    size={16}
                    color={activeTab === "creator" ? "#000000" : "#8A9BB0"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "creator" && styles.activeTabText,
                    ]}
                  >
                    Creator
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Creator context hint */}
              {activeTab === "creator" && (
                <View style={styles.creatorHint}>
                  <Ionicons
                    name="information-circle-outline"
                    size={15}
                      color="#000000"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.creatorHintText}>
                    As a creator you can publish podcasts and grow your
                    audience.
                  </Text>
                </View>
              )}

              {/* Form */}
              <Animated.View style={{ opacity: fadeAnim }}>
                <InputField
                  label="Full Name"
                  leftIcon={
                    <Ionicons
                      name="person-outline"
                        size={18}
                        color={errors.name ? "#EF4444" : "#000000"}
                    />
                  }
                  placeholder="e.g. Ahmed Khalid"
                  value={fields.name}
                  onChangeText={(v) => setField("name", v)}
                  autoCapitalize="words"
                  editable={!isLoading}
                  error={errors.name}
                />

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

                {activeTab === "creator" && (
                  <InputField
                    label="Podcast / Show Name"
                    leftIcon={
                      <Ionicons
                        name="radio-outline"
                          size={18}
                          color={errors.showName ? "#EF4444" : "#000000"}
                      />
                    }
                    placeholder="My Awesome Show"
                    value={fields.showName}
                    onChangeText={(v) => setField("showName", v)}
                    autoCapitalize="words"
                    editable={!isLoading}
                    error={errors.showName}
                  />
                )}

                {/* Password (kept custom for visibility toggle) */}
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
                    placeholder="At least 8 characters"
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

                {/* Server error */}
                <ErrorBanner message={serverError} />

                {/* Submit */}
                <View style={styles.submitWrapper}>
                  <SubmitButton onPress={handleSubmit} loading={isLoading}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={styles.submitText}>Get Started</Text>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="#FFFFFF"
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  </SubmitButton>
                </View>
              </Animated.View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.footerLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Bottom spacer */}
            <View style={{ height: 32 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeLinearGradient>
  );
}


