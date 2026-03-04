/**
 * Token storage wrapper that prefers `expo-secure-store` but falls back to
 * `@react-native-async-storage/async-storage` when the native SecureStore
 * module isn't available (e.g., running in Expo Go without prebuilt native
 * modules).
 */

const memoryCache: Record<string, string | null> = {};

export async function setItem(key: string, value: string): Promise<void> {
  memoryCache[key] = value;
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
  // Always check memory first — solves the Android "read after write" lag
  if (memoryCache[key] !== undefined) {
    console.debug(`[TokenStorage] Cache hit for ${key}`);
    return memoryCache[key];
  }

  console.debug(`[TokenStorage] Cache miss for ${key}, reading from disk...`);
  try {
    const SecureStore = await import('expo-secure-store');
    const value = await SecureStore.getItemAsync(key);
    memoryCache[key] = value;
    return value;
  } catch (e) {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const value = await AsyncStorage.default.getItem(key);
    memoryCache[key] = value;
    return value;
  }
}

export async function deleteItem(key: string): Promise<void> {
  memoryCache[key] = null;
  try {
    const SecureStore = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(key);
    return;
  } catch (e) {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.default.removeItem(key);
  }
}
