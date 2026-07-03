import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

export const LANGUAGE_KEY = 'appLanguage';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (saved) return callback(saved);
    } catch (e) { /* ignore */ }

    const best = RNLocalize.findBestAvailableLanguage(['en', 'fr']);
    // Renvoie "en" ou "fr" (sans région)
    const guess = best?.languageTag?.split('-')?.[0] ?? 'en';
    return callback(guess);
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    try { await AsyncStorage.setItem(LANGUAGE_KEY, lng); } catch (e) {}
  },
};

export default languageDetector;
