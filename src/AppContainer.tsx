import * as React from 'react';
import { StatusBar, Appearance, AppState, View, ActivityIndicator, Platform } from "react-native";
import { configureFonts, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { PersistGate } from 'redux-persist/es/integration/react';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import Main from './navigations';
import BackgroundLayout from './components/BackgroundLayout';

// Désactive dynamiquement le dark mode
const disableDarkMode = () => {
  try {
    const colorScheme = Appearance.getColorScheme();
    if (colorScheme === 'dark') {
      console.log("⚙️ Mode sombre détecté, mais ignoré.");
    }
  } catch (e) {
    console.log("⚠️ Impossible de forcer le thème clair :", e);
  }
};

// Appel au démarrage
disableDarkMode();

// Appel à chaque retour d’arrière-plan
AppState.addEventListener('change', state => {
  if (state === 'active') disableDarkMode();
});

// Configuration des polices pour MD3 (React Native Paper v5+)
const baseFont = {
  fontFamily: 'Mulish-Regular',
  fontWeight: 'normal' as 'normal',
};

const fontConfig = {
  displayLarge: { ...baseFont, fontSize: 57, lineHeight: 64, letterSpacing: 0 },
  displayMedium: { ...baseFont, fontSize: 45, lineHeight: 52, letterSpacing: 0 },
  displaySmall: { ...baseFont, fontSize: 36, lineHeight: 44, letterSpacing: 0 },
  headlineLarge: { ...baseFont, fontSize: 32, lineHeight: 40, letterSpacing: 0 },
  headlineMedium: { ...baseFont, fontSize: 28, lineHeight: 36, letterSpacing: 0 },
  headlineSmall: { ...baseFont, fontSize: 24, lineHeight: 32, letterSpacing: 0 },
  titleLarge: { ...baseFont, fontSize: 22, lineHeight: 28, letterSpacing: 0 },
  titleMedium: { ...baseFont, fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
  titleSmall: { ...baseFont, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  labelLarge: { ...baseFont, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  labelMedium: { ...baseFont, fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
  labelSmall: { ...baseFont, fontSize: 11, lineHeight: 16, letterSpacing: 0.5 },
  bodyLarge: { ...baseFont, fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
  bodyMedium: { ...baseFont, fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  bodySmall: { ...baseFont, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
  // Compatibilité pour vos anciens usages de variantes personnalisées
  regular: { ...baseFont, fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  medium: { fontFamily: 'Mulish-medium', fontWeight: 'normal' as 'normal', fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  light: { fontFamily: 'Mulish-light', fontWeight: 'normal' as 'normal', fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
  thin: { fontFamily: 'Mulish-ExtraLight', fontWeight: 'normal' as 'normal', fontSize: 14, lineHeight: 20, letterSpacing: 0.25 },
};

const theme = {
  ...MD3LightTheme, // Utilisation de MD3LightTheme (recommandé pour Paper v5)
  dark: false,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#000000',
    onSurface: '#000000', // Remplace 'text' en MD3
  },
};

const AppContainer: React.FC<{}> = () => {
  // Sécurité : Si le store est undefined
  if (!store) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Provider store={store}>
        {persistor ? (
          <PersistGate loading={null} persistor={persistor}>
            <BackgroundLayout>
              <StatusBar
                backgroundColor="transparent"
                barStyle="dark-content"
                translucent
              />
              <Main />
            </BackgroundLayout>
          </PersistGate>
        ) : (
          <Main />
        )}
      </Provider>
    </PaperProvider>
  );
};

export default AppContainer;