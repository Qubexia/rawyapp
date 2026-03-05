/**
 * Notifications utility — handles push token registration.
 * NOTE: Currently uses a stub as expo-notifications is not installed.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

const STUB_TOKEN = 'stub-fcm-token-12345';

/**
 * Gets the device push token.
 */
export async function getPushToken(): Promise<string | null> {
  // In a real implementation, we would use expo-notifications
  // For now, we return a stub token to verify the registration flow.
  console.debug('[Notifications] Getting stub push token...');
  return STUB_TOKEN;
}

/**
 * Checks if we have a stored token that was already registered.
 */
export async function getStoredPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
}

/**
 * Saves the registered token locally.
 */
export async function saveStoredPushToken(token: string | null): Promise<void> {
  if (token) {
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN);
  }
}
