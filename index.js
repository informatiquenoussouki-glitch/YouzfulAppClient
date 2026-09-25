/**
 * @format
 */
import { LogBox } from 'react-native';

// LE PATCH DOIT ÊTRE TOUT EN HAUT AVANT LES AUTRES IMPORTS
if (!global.ViewPropTypes) {
  Object.defineProperty(global, 'ViewPropTypes', {
    get() {
      return require('deprecated-react-native-prop-types').ViewPropTypes;
    },
    configurable: true,
    enumerable: true
  });
}

// Handler FCM pour l'état app fermée / tuée — DOIT être enregistré ici avant AppRegistry
import messaging from '@react-native-firebase/messaging';
import { displayPushNotification, setupNotificationChannel } from './src/helpers/pushNotification';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  await setupNotificationChannel();
  const title = remoteMessage.notification?.title ?? remoteMessage.data?.title ?? 'YouzFul';
  const body = remoteMessage.notification?.body ?? remoteMessage.data?.body ?? '';
  await displayPushNotification(title, body, remoteMessage.data ?? {});
});

// Masquer les avertissements visuels
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

// Maintenant on charge le reste de l'application
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { enableScreens } from 'react-native-screens';
import axios from 'axios';

enableScreens(true);

// --- DIAGNOSTIC TEMPORAIRE 429 ---
// Logue chaque requête sortante (toutes passent par le module axios singleton,
// même celles faites via `axios.get(...)` direct dans src/api/settings.js) pour
// identifier précisément quelle URL déclenche le "Too Many Requests".
// À retirer une fois la cause confirmée.
let __requestWindow = [];
axios.interceptors.request.use((config) => {
  const url = `${config.baseURL || ''}${config.url}`;
  const now = Date.now();
  __requestWindow.push({ url, time: now });
  __requestWindow = __requestWindow.filter((r) => now - r.time < 60000);
  console.log(
    `📡 [${new Date(now).toISOString()}] → ${(config.method || 'get').toUpperCase()} ${url} | ${__requestWindow.length} requêtes dans la dernière minute`
  );
  return config;
});
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 429) {
      console.error(
        `🚨 429 TOO MANY REQUESTS → ${error.config?.baseURL || ''}${error.config?.url} | ${__requestWindow.length} requêtes dans la dernière minute`,
        '\nStack:', new Error().stack
      );
    }
    return Promise.reject(error);
  }
);

AppRegistry.registerComponent(appName, () => App);