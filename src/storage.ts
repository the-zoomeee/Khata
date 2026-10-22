import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

const PIN_KEY = 'app_pin_hash';
const DEFAULT_DESC_KEY = 'default_online_desc';

export async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export async function getStoredPinHash(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(PIN_KEY);
  } catch {
    return null;
  }
}

export async function savePinHash(hash: string): Promise<void> {
  await AsyncStorage.setItem(PIN_KEY, hash);
}

export async function clearPin(): Promise<void> {
  await AsyncStorage.removeItem(PIN_KEY);
}

export const STORAGE_KEYS = { home: 'home', khata: 'khata', online: 'online', vc: 'vc'  };

export async function getStore<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setStore<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`${title}\n\n${message}`);
    if (ok) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

export async function getDefaultDesc(): Promise<string> {
  try {
    const v = await AsyncStorage.getItem(DEFAULT_DESC_KEY);
    return v && v.trim() ? v : 'Paytm';
  } catch {
    return 'Paytm';
  }
}

export async function saveDefaultDesc(desc: string): Promise<void> {
  await AsyncStorage.setItem(DEFAULT_DESC_KEY, desc.trim() || 'Paytm');
}