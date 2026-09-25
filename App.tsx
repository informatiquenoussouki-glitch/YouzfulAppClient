import * as React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppContainer from './src/AppContainer';
import SplashScreen from 'react-native-splash-screen';
import messaging from '@react-native-firebase/messaging';
import {
  setupNotificationChannel,
  requestNotificationPermission,
  displayPushNotification,
} from './src/helpers/pushNotification';

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: '#2e7d32', // 🟢 vert foncé (succès)
        borderLeftWidth: 0,          // ❌ pas de bande à gauche
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 18,
        minHeight: 70,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
        fontFamily: 'Mulish-Regular',
      }}
      text2Style={{
        fontSize: 15,
        color: '#f5f5f5',
        fontFamily: 'Mulish-Regular',
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        backgroundColor: '#d32f2f', // 🔴 rouge
        borderLeftWidth: 0,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 18,
        minHeight: 70,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
        fontFamily: 'Mulish-Regular',
      }}
      text2Style={{
        fontSize: 15,
        color: '#f5f5f5',
        fontFamily: 'Mulish-Regular',
      }}
    />
  ),

  info: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: '#2183AC', // 🔵 bleu pour info
        borderLeftWidth: 0,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 18,
        minHeight: 70,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        fontFamily: 'Mulish-Regular',
      }}
      text2Style={{
        fontSize: 14,
        color: '#f5f5f5',
        fontFamily: 'Mulish-Regular',
      }}
    />
  ),
};
export default function App() {
  React.useEffect(() => {
    SplashScreen.hide();

    // Initialisation du canal + permissions notifications
    setupNotificationChannel();
    requestNotificationPermission();

    // Handler FCM quand l'app est en premier plan
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const title = remoteMessage.notification?.title ?? remoteMessage.data?.title ?? 'YouzFul';
      const body = remoteMessage.notification?.body ?? remoteMessage.data?.body ?? '';
      await displayPushNotification(title, body, remoteMessage.data ?? {});
    });

    return unsubscribe;
  }, []);
  return (
    <SafeAreaProvider>
      <AppContainer />
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}