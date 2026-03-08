/**
 * Notifications utility — handles push token registration and permission checks.
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { STORAGE_KEYS } from './constants';

/**
 * Configure how notifications are displayed when the app is in the foreground.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registers the device for push notifications and returns the token.
 * Requests permission if not already granted.
 */
export async function getPushToken(): Promise<string | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    console.debug('[Notifications] Must use physical device for Push Notifications');
    // Return a dev token for simulation if in dev mode, or null
    return __DEV__ ? 'dev-push-token' : null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.debug('[Notifications] Failed to get push token for push notification!');
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.experienceId;
    const token = await Notifications.getDevicePushTokenAsync();
    // Alternatively, use getExpoPushTokenAsync if using Expo Push Service. 
    // But backend is configured for FCM (Firebase), so getDevicePushTokenAsync is appropriate for Android/FCM.
    console.debug('[Notifications] Device push token retrieved:', token.data);
    return token.data;
  } catch (err) {
    console.error('[Notifications] Error getting device push token:', err);
    return null;
  }
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
