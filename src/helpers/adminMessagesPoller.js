import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { getUnreadMessagesAdminCount } from '../api/settings';
import { logAlert } from './alertsLog';

const LAST_COUNT_KEY = 'adminMsgLastCount';
const POLL_INTERVAL_MS = 60000; // 1 minute

let _timer = null;
let _currentToken = null;

async function checkForNewMessages(token) {
  try {
    const res = await getUnreadMessagesAdminCount(token);
    if (!res || res.code !== 200) return;

    const newCount = res.count || 0;
    const raw = await AsyncStorage.getItem(LAST_COUNT_KEY);
    const lastCount = raw ? parseInt(raw, 10) : 0;

    if (newCount > lastCount) {
      const subject = res.last_subject || null;
      const title = 'Administration YouzFul';
      const body = subject
        ? subject
        : newCount === 1
          ? 'Vous avez un nouveau message.'
          : `${newCount} nouveaux messages.`;

      await logAlert(title, body, { type: 'admin_message' });
      Toast.show({
        type: 'info',
        text1: title,
        text2: body,
        position: 'top',
        visibilityTime: 5000,
      });
    }
    // Met à jour le compteur connu (même si 0 — pour détecter la prochaine vague)
    await AsyncStorage.setItem(LAST_COUNT_KEY, String(newCount));
  } catch {
    // Silencieux — ne pas casser l'app si le réseau est absent
  }
}

export function startAdminMessagesPoller(token) {
  if (_timer) stopAdminMessagesPoller();
  _currentToken = token;

  // Vérification immédiate au login
  checkForNewMessages(token);

  _timer = setInterval(() => {
    if (_currentToken) checkForNewMessages(_currentToken);
  }, POLL_INTERVAL_MS);
}

export function stopAdminMessagesPoller() {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
  }
  _currentToken = null;
}

// Appelé depuis ContactAdminScreen après lecture, pour remettre le compteur à 0
export async function resetAdminMessagesCount() {
  await AsyncStorage.setItem(LAST_COUNT_KEY, '0');
}
