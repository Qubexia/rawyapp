/**
 * Token storage wrapper that prefers `expo-secure-store` but falls back to
 * `@react-native-async-storage/async-storage` when the native SecureStore
 * module isn't available (e.g., running in Expo Go without prebuilt native
 * modules).
 */

export async function setItem(key: string, value: string): Promise<void> {
  try {
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
    return;
  } catch (e) {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.default.setItem(key, value);
  }
}

export async function getItem(key: string): Promise<string | null> {
  try {
    const SecureStore = await import('expo-secure-store');
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return await AsyncStorage.default.getItem(key);
  }
}

export async function deleteItem(key: string): Promise<void> {
  try {
    const SecureStore = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(key);
    return;
  } catch (e) {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.default.removeItem(key);
  }
}
