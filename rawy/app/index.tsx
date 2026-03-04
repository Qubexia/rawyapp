import { Redirect } from 'expo-router';

export default function Index() {
    // Check onboarding status if needed in the future using AsyncStorage.
    // Currently redirecting directly to onboarding for demonstration.
    return <Redirect href={"/onboarding" as any} />;
}
