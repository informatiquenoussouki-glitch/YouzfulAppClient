import AsyncStorage from '@react-native-async-storage/async-storage';
import { displayPushNotification } from './pushNotification';

const STORAGE_KEY = 'alertsLog';
const MAX_ENTRIES = 100;

export async function logAlert(title, message, data = null) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      message,
      timestamp: Date.now(),
      // data : { reservationId, type } quand l'alerte concerne une réservation précise,
      // utilisé par la cloche de notifications pour naviguer vers son détail.
      data,
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));

    // Affiche aussi une vraie notification système (visible même app fermée si appelé en background)
    await displayPushNotification(title, message, data ?? {});
  } catch (e) {
    console.error('❌ Erreur logAlert :', e);
  }
}

export async function getRecentAlerts(hours = 24) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return list.filter((a) => a.timestamp >= cutoff);
  } catch (e) {
    console.error('❌ Erreur getRecentAlerts :', e);
    return [];
  }
}
