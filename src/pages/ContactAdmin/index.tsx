import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput as RNTextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Text } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ContactAdmin as sendMsg, getMesMessagesAdmin } from '../../api/settings';
import { resetAdminMessagesCount } from '../../helpers/adminMessagesPoller';

const ContactAdminScreen: React.FC<{ navigation: any }> = () => {
  const { t } = useTranslation();
  const userToken = useSelector(({ userReducer }: any) => userReducer.token);

  const [sujet, setSujet] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errSujet, setErrSujet] = useState(false);
  const [errMessage, setErrMessage] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      const res = await getMesMessagesAdmin(userToken);
      if (res?.code === 200 && Array.isArray(res.data)) {
        setMessages(res.data);
        // Marque comme lus côté poller aussi
        await resetAdminMessagesCount();
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [userToken]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const onRefresh = () => { setRefreshing(true); loadMessages(); };

  async function send() {
    let valid = true;
    if (!sujet.trim()) { setErrSujet(true); valid = false; } else { setErrSujet(false); }
    if (!message.trim()) { setErrMessage(true); valid = false; } else { setErrMessage(false); }
    if (!valid) return;

    setIsSending(true);
    try {
      const res = await sendMsg(userToken, { sujet: sujet.trim(), message: message.trim() });
      if (res?.code === 200) {
        Toast.show({ type: 'success', text1: t('contactSuccessTitle'), text2: t('contactSuccessMsg'), position: 'top' });
        setSujet('');
        setMessage('');
        loadMessages();
      } else {
        Toast.show({ type: 'error', text1: t('errorTitle'), text2: res?.message || t('generic'), position: 'top' });
      }
    } catch {
      Toast.show({ type: 'error', text1: t('errorTitle'), text2: t('generic'), position: 'top' });
    }
    setIsSending(false);
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.pageTitle}>{t('contactAdminTitle')}</Text>
        <Text style={styles.subtitle}>{t('contactAdminSubtitle')}</Text>

        {/* ── Formulaire envoi ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('contactNewMessage')}</Text>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('contactSubject')}</Text>
            <View style={[styles.inputWrapper, errSujet && styles.inputError]}>
              <Ionicons name="mail-outline" size={18} color="#6c757d" style={styles.icon} />
              <RNTextInput
                style={styles.input}
                placeholder={t('contactSubjectPlaceholder')}
                value={sujet}
                onChangeText={setSujet}
                placeholderTextColor="#adb5bd"
              />
            </View>
            {errSujet && <Text style={styles.labelError}>{t('contactSubjectRequired')}</Text>}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('contactMessage')}</Text>
            <View style={[styles.textareaWrapper, errMessage && styles.inputError]}>
              <RNTextInput
                style={styles.textarea}
                placeholder={t('contactMessagePlaceholder')}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholderTextColor="#adb5bd"
              />
            </View>
            {errMessage && <Text style={styles.labelError}>{t('contactMessageRequired')}</Text>}
          </View>

          <TouchableOpacity style={styles.button} onPress={send} disabled={isSending}>
            {isSending
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>{t('send')}</Text>
            }
          </TouchableOpacity>
        </View>

        {/* ── Historique ── */}
        <Text style={styles.sectionTitle}>{t('contactHistory')}</Text>

        {loading && <ActivityIndicator style={{ marginTop: 20 }} color="#000" />}

        {!loading && messages.length === 0 && (
          <Text style={styles.emptyText}>{t('contactNoMessages')}</Text>
        )}

        {messages.map((item) => (
          <View key={item.id} style={styles.messageCard}>
            {/* Message du client */}
            <View style={styles.msgHeader}>
              <Ionicons name="person-circle-outline" size={18} color="#555" />
              <Text style={styles.msgAuthor}>{t('contactYou')}</Text>
              <Text style={styles.msgDate}>{formatDate(item.created_at)}</Text>
            </View>
            <Text style={styles.msgSubject}>{item.sujet}</Text>
            <Text style={styles.msgBody}>{item.message}</Text>

            {/* Statut */}
            <View style={[styles.badge, item.statut === 'traite' ? styles.badgeDone : styles.badgePending]}>
              <Text style={styles.badgeText}>
                {item.statut === 'traite' ? t('contactReplied') : item.statut === 'lu' ? t('contactRead') : t('contactPending')}
              </Text>
            </View>

            {/* Réponse admin */}
            {!!item.reponse_admin && (
              <View style={styles.replyBox}>
                <View style={styles.msgHeader}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#1D9E75" />
                  <Text style={[styles.msgAuthor, { color: '#1D9E75' }]}>{t('contactAdminLabel')}</Text>
                  <Text style={styles.msgDate}>{formatDate(item.reponse_at)}</Text>
                </View>
                <Text style={styles.replyText}>{item.reponse_admin}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#212529', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#6c757d', textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 24, elevation: 2, borderWidth: 1, borderColor: '#e4e4ec' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#212529', marginBottom: 16 },
  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#495057', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa',
    borderRadius: 10, borderWidth: 1, borderColor: '#ced4da', height: 48, paddingHorizontal: 12,
  },
  textareaWrapper: {
    backgroundColor: '#f8f9fa', borderRadius: 10, borderWidth: 1,
    borderColor: '#ced4da', paddingHorizontal: 12, paddingVertical: 10, minHeight: 120,
  },
  inputError: { borderColor: '#dc3545' },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: '#212529' },
  textarea: { fontSize: 14, color: '#212529', minHeight: 100 },
  labelError: { fontSize: 12, color: '#dc3545', marginTop: 3 },
  button: { backgroundColor: '#000', paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#adb5bd', marginTop: 20, fontSize: 14 },
  messageCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#e4e4ec', elevation: 1,
  },
  msgHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  msgAuthor: { fontSize: 13, fontWeight: '700', color: '#495057', flex: 1 },
  msgDate: { fontSize: 11, color: '#adb5bd' },
  msgSubject: { fontSize: 15, fontWeight: '700', color: '#212529', marginBottom: 4 },
  msgBody: { fontSize: 14, color: '#495057', lineHeight: 20 },
  badge: { alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgePending: { backgroundColor: '#fff3cd' },
  badgeDone: { backgroundColor: '#d1f2eb' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  replyBox: {
    marginTop: 14, padding: 12, backgroundColor: '#f0fdf8',
    borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#1D9E75',
  },
  replyText: { fontSize: 14, color: '#1e6a4a', lineHeight: 20 },
});

export default ContactAdminScreen;
