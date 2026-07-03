import * as React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppContainer from './src/AppContainer';
import SplashScreen from 'react-native-splash-screen';

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
  }, []);
  return (
    <SafeAreaProvider>
      <AppContainer />
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}