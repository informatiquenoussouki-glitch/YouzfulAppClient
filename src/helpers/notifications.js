import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import { logAlert } from './alertsLog';

// Notification reçue en premier plan → Toast + cloche
async function afficherNotificationForeground(remoteMessage) {
  const title = remoteMessage?.notification?.title || 'Administration YouzFul';
  const body  = remoteMessage?.notification?.body  || 'Vous avez un nouveau message.';

  Toast.show({ type: 'info', text1: title, text2: body, visibilityTime: 5000 });
  await logAlert(title, body, { type: 'admin_message' });
}

// Enregistre le token FCM côté serveur
export async function registerFcmToken(token, userToken) {
  try {
    const fcmToken = token || (await messaging().getToken());
    if (!fcmToken) return;
    await fetch('https://api.youz-ful.com/User/RegisterFCM.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ fcm_token: fcmToken }),
    });
  } catch {}
}

// Initialise Firebase Messaging — appelé depuis index.tsx au login
export function initNotifications(userToken, navigationRef) {
  messaging().requestPermission().catch(() => {});
  registerFcmToken(null, userToken);

  const unsubMessage = messaging().onMessage(async (remoteMessage) => {
    await afficherNotificationForeground(remoteMessage);
  });

  const unsubToken = messaging().onTokenRefresh(() => {
    registerFcmToken(null, userToken);
  });

  return () => {
    unsubMessage();
    unsubToken();
  };
}
