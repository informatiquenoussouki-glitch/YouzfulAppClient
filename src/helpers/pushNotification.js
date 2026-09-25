import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHANNEL_ID = 'youzful_main';
const FCM_TOKEN_KEY = 'fcm_token';

export async function setupNotificationChannel() {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'YouzFul Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
}

export async function requestNotificationPermission() {
  // Vérifie d'abord le statut actuel — on ne demande que si pas encore déterminé
  const current = await notifee.getNotificationSettings();
  // AuthorizationStatus : 1 = autorisé, -1 = refusé, 0 = non déterminé
  if (current.authorizationStatus === 1) return current; // déjà accordé, rien à faire
  if (current.authorizationStatus === -1) return current; // refusé, ne pas re-demander
  return await notifee.requestPermission();
}

export async function displayPushNotification(title, body, data = {}) {
  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      smallIcon: 'ic_notification',
      pressAction: { id: 'default' },
      sound: 'default',
    },
    ios: {
      sound: 'default',
    },
  });
}

// Programme une notification locale à une date précise (fonctionne app fermée)
export async function scheduleLocalNotification(id, title, body, date, data = {}) {
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date instanceof Date ? date.getTime() : date,
  };
  await notifee.createTriggerNotification(
    {
      id,
      title,
      body,
      data,
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        smallIcon: 'ic_notification',
        pressAction: { id: 'default' },
        sound: 'default',
      },
      ios: { sound: 'default' },
    },
    trigger,
  );
}

export async function cancelScheduledNotification(id) {
  try {
    await notifee.cancelTriggerNotification(id);
  } catch (_) {}
}

export async function getFCMToken() {
  try {
    const cached = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    if (cached) return cached;
    const token = await messaging().getToken();
    if (token) await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    return token;
  } catch (e) {
    console.error('❌ getFCMToken:', e);
    return null;
  }
}

// À appeler depuis les settings API après le login pour enregistrer le token
export async function saveFCMTokenToBackend(apiSaveToken, authToken) {
  try {
    const fcmToken = await getFCMToken();
    if (!fcmToken || !authToken) return;
    await apiSaveToken(fcmToken, authToken);
  } catch (e) {
    console.warn('⚠️ saveFCMTokenToBackend:', e);
  }
}
