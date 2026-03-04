import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
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
            <View style={styles.card}>
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
                    color={activeTab === "creator" ? "#6C63FF" : "#8A9BB0"}
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
                    color="#6C63FF"
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
                {/* Name */}
                <Text style={styles.label}>Full Name</Text>
                <View
                  style={[
                    styles.inputGroup,
                    !!errors.name && styles.inputGroupError,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={errors.name ? "#EF4444" : "#6C63FF"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Ahmed Khalid"
                    placeholderTextColor="#6B7A90"
                    value={fields.name}
                    onChangeText={(v) => setField("name", v)}
                    autoCapitalize="words"
                    editable={!isLoading}
                  />
                </View>
                {!!errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}

                {/* Email */}
                <Text style={styles.label}>Email Address</Text>
                <View
                  style={[
                    styles.inputGroup,
                    !!errors.email && styles.inputGroupError,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={errors.email ? "#EF4444" : "#6C63FF"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#6B7A90"
                    value={fields.email}
                    onChangeText={(v) => setField("email", v)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
                {!!errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                {/* Show Name (creator only) */}
                {activeTab === "creator" && (
                  <>
                    <Text style={styles.label}>Podcast / Show Name</Text>
                    <View
                      style={[
                        styles.inputGroup,
                        !!errors.showName && styles.inputGroupError,
                      ]}
                    >
                      <Ionicons
                        name="radio-outline"
                        size={18}
                        color={errors.showName ? "#EF4444" : "#6C63FF"}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="My Awesome Show"
                        placeholderTextColor="#6B7A90"
                        value={fields.showName}
                        onChangeText={(v) => setField("showName", v)}
                        autoCapitalize="words"
                        editable={!isLoading}
                      />
                    </View>
                    {!!errors.showName && (
                      <Text style={styles.errorText}>{errors.showName}</Text>
                    )}
                  </>
                )}

                {/* Password */}
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
                    color={errors.password ? "#EF4444" : "#6C63FF"}
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
                {!!serverError && (
                  <View style={styles.serverErrorBanner}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color="#EF4444"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.serverErrorText}>{serverError}</Text>
                  </View>
                )}

                {/* Submit */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  style={styles.submitWrapper}
                >
                  <SafeLinearGradient
                    colors={
                      isLoading
                        ? ["#4A45B0", "#7B5EA7"]
                        : ["#6C63FF", "#9B59B6"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Text style={styles.submitText}>Get Started</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color="#FFFFFF"
                          style={{ marginLeft: 8 }}
                        />
                      </>
                    )}
                  </SafeLinearGradient>
                </TouchableOpacity>
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
            </View>

            {/* Bottom spacer */}
            <View style={{ height: 32 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeLinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // ── Header ────────────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 32 : 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
  },
  logoBadge: {
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  logoBadgeGradient: {
    width: 72,
    height: 72,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  waveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
  },
  waveBar: {
    width: 4,
    borderRadius: 4,
    backgroundColor: "#6C63FF",
  },
  appName: {
    fontSize: 42,
    fontWeight: "900",
    color: "#181818",
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 13,
    color: "rgba(56, 56, 56, 0.69)",
    letterSpacing: 2.5,
    marginTop: 4,
    textTransform: "uppercase",
  },

  // ── Card ──────────────────────────────────────────────────────
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(16,24,40,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 20,
    textAlign: "center",
  },

  // ── Tab bar ───────────────────────────────────────────────────
  tabContainer: {
    flexDirection: "row",
    height: 52,
    backgroundColor: "rgba(15,23,42,0.04)",
    borderRadius: 26,
    padding: 4,
    marginBottom: 24,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
  },
  tabIndicator: {
    position: "absolute",
    top: 4,
    left: 0,
    height: 44,
    backgroundColor: "#6C63FF",
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8A9BB0",
  },
  activeTabText: {
    color: "#FFFFFF",
  },

  // ── Creator hint ──────────────────────────────────────────────
  creatorHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(17,24,39,0.03)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
  },
  creatorHintText: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    lineHeight: 17,
  },

  // ── Form inputs ───────────────────────────────────────────────
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 58,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "rgba(15,23,42,0.06)",
  },
  inputGroupError: {
    borderColor: "#EF4444",
    backgroundColor: "rgba(239, 68, 68, 0.03)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    height: "100%",
    fontWeight: "500",
  },
  eyeIcon: {
    padding: 8,
    marginRight: -6,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "500",
    marginTop: -10,
    marginBottom: 12,
    marginLeft: 6,
  },
  serverErrorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.06)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  serverErrorText: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },

  // ── Submit button ─────────────────────────────────────────────
  submitWrapper: {
    marginTop: 8,
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButton: {
    height: 58,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ── Divider ───────────────────────────────────────────────────
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    color: "#4A5568",
    fontSize: 13,
    marginHorizontal: 12,
    fontWeight: "600",
  },

  // ── Footer ────────────────────────────────────────────────────
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#6B7A90",
    fontSize: 14,
    fontWeight: "500",
  },
  footerLink: {
    color: "#6C63FF",
    fontSize: 14,
    fontWeight: "700",
  },
});
