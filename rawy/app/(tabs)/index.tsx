import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      <ThemedText type="title">Rawy</ThemedText>
      <ThemedText>اكتشف عالم البودكاست مع راوي.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  logo: {
    width: 160,
    height: 160,
  },
});
