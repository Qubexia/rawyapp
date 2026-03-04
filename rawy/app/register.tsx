import React, { useState, useRef, useEffect } from 'react';
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
    ImageBackground,
    SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
    const router = useRouter();
    const { width } = useWindowDimensions();

    // Selected tab: 'user' or 'creator'
    const [activeTab, setActiveTab] = useState<'user' | 'creator'>('user');

    // Animation values
    const indicatorPosition = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Form Fields mapped to backend DTOs (RegisterDto / RegisterCreatorDto)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showName, setShowName] = useState(''); // Only for creator
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        // Animate the tab indicator
        Animated.spring(indicatorPosition, {
            toValue: activeTab === 'user' ? 0 : 1,
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
        outputRange: [4, (tabWidth / 2)],
    });

    const handleRegister = () => {
        // In a real app, integrate with the backend here.
        console.log('Registering', activeTab, { name, email, password, showName });
        // Assuming registration is successful, go to the main tabs
        router.replace('/(tabs)');
    };

    return (
        <ImageBackground
            source={require('../assets/images/register_bg.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.overlay} />
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={styles.keyboardAvoid}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <StatusBar style="light" />
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header section without back button */}
                        <View style={styles.header}>
                            <View style={styles.titlesContainer}>
                                <Text style={styles.title}>Welcome to Rawy</Text>
                                <Text style={styles.subtitle}>Discover, connect, and share your voice.</Text>
                            </View>
                        </View>

                        {/* Glassmorphism Card */}
                        <View style={styles.card}>
                            {/* Custom Tab Bar */}
                            <View style={styles.tabContainer}>
                                <Animated.View
                                    style={[
                                        styles.tabIndicator,
                                        { transform: [{ translateX: indicatorTranslateX }], width: (tabWidth / 2) - 4 },
                                    ]}
                                />
                                <TouchableOpacity
                                    style={styles.tabButton}
                                    activeOpacity={0.8}
                                    onPress={() => setActiveTab('user')}
                                >
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
                                    <Text
                                        style={[
                                            styles.tabText,
                                            activeTab === 'creator' && styles.activeTabText,
                                        ]}
                                    >
                                        Creator
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Dynamic Form Content */}
                            <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
                                <View style={styles.inputGroup}>
                                    <Ionicons name="person-outline" size={20} color="#8A8A8E" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Full Name"
                                        placeholderTextColor="#A1A1AA"
                                        value={name}
                                        onChangeText={setName}
                                        autoCapitalize="words"
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Ionicons name="mail-outline" size={20} color="#8A8A8E" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email Address"
                                        placeholderTextColor="#A1A1AA"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                {activeTab === 'creator' && (
                                    <View style={styles.inputGroup}>
                                        <Ionicons name="mic-outline" size={20} color="#8A8A8E" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Show/Podcast Name"
                                            placeholderTextColor="#A1A1AA"
                                            value={showName}
                                            onChangeText={setShowName}
                                            autoCapitalize="words"
                                        />
                                    </View>
                                )}

                                <View style={[styles.inputGroup, styles.lastInputGroup]}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#8A8A8E" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor="#A1A1AA"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!isPasswordVisible}
                                    />
                                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                                        <Ionicons
                                            name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                                            size={20}
                                            color="#8A8A8E"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.registerButton} activeOpacity={0.85} onPress={handleRegister}>
                                    <Text style={styles.registerButtonText}>Register</Text>
                                </TouchableOpacity>
                            </Animated.View>

                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => { router.back() }}>
                                    <Text style={styles.footerLink}>Log In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark gradient overlay for contrast
    },
    safeArea: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? 60 : 20,
        justifyContent: 'center', // Centers the content vertically slightly
        paddingBottom: 40,
    },
    header: {
        marginBottom: 30,
        marginTop: 40,
        alignItems: 'center', // Center align the new text
    },
    // backButton styles removed
    titlesContainer: {
        alignItems: 'center', // Center align the texts inside
    },
    title: {
        fontSize: 38, // Slightly larger
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 10,
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 17,
        color: 'rgba(255,255,255,0.9)', // Lighter for better contrast
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 24,
    },
    card: {
        backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)', // Adjust for Android rendering
        borderRadius: 32,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 2, // Minimal elevation for Android so the shadow doesn't muddy the card
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    tabContainer: {
        flexDirection: 'row',
        height: 56,
        backgroundColor: '#F4F4F5',
        borderRadius: 28,
        padding: 4,
        marginBottom: 30,
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        top: 4,
        left: 0,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#A1A1AA',
    },
    activeTabText: {
        color: '#18181B', // Darker text for active
    },
    formContainer: {
        flex: 1,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        height: 64,
        borderRadius: 20,
        paddingHorizontal: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    lastInputGroup: {
        marginBottom: 24,
    },
    inputIcon: {
        marginRight: 14,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        height: '100%',
        fontWeight: '500',
    },
    eyeIcon: {
        padding: 10,
        marginRight: -10,
    },
    registerButton: {
        height: 60,
        backgroundColor: '#6C63FF', // Primary accent wrapper
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 15,
        elevation: 8,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#64748B',
        fontSize: 15,
        fontWeight: '500',
    },
    footerLink: {
        color: '#6C63FF',
        fontSize: 15,
        fontWeight: '700',
    },
});
