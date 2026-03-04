import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthContext } from '@/context/auth-context';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
    const { isAuthenticated, isLoading } = useAuthContext();
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkOnboarding() {
            try {
                const value = await AsyncStorage.getItem('@has_seen_onboarding');
                console.debug('[Index] hasSeenOnboarding:', value);
                setHasSeenOnboarding(value === 'true');
            } catch (error) {
                console.error('[Index] Error reading onboarding state:', error);
                setHasSeenOnboarding(false);
            }
        }
        checkOnboarding();
    }, []);

    if (isLoading || hasSeenOnboarding === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                <ActivityIndicator size="large" color="#000000" />
            </View>
        );
    }

    if (isAuthenticated) {
        console.debug('[Index] Authenticated, redirecting to /(tabs)');
        return <Redirect href="/(tabs)" />;
    }

    if (!hasSeenOnboarding) {
        console.debug('[Index] Redirecting to /onboarding');
        return <Redirect href="/onboarding" />;
    }

    console.debug('[Index] Not authenticated, redirecting to /login');
    return <Redirect href="/login" />;
}
