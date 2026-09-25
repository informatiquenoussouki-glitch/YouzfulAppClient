import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { ButtonComponent } from '../../components';
import { COLOR } from '../../helpers/functions';
import { settings } from '../../api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

const ForgetPasswordScreen = () => {
  const { t } = useTranslation();
  const [mail, setMail] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function Send() {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (!mail || !reg.test(mail)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setIsLoading(true);
    try {
      await settings.LostPass({ mail });
      setSent(true);
      setMail('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erreur réseau';
      Toast.show({
        text1: 'Erreur',
        text2: msg,
        type: 'error',
        position: 'top',
      });
    }
    setIsLoading(false);
  }

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.backgroundStyle}>
        <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
          <Text style={styles.Title}>{t('forgotPassword')}</Text>

          {sent ? (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#1D9E75" style={{ marginBottom: 12 }} />
              <Text style={styles.successText}>
                Si votre email est enregistré, vous recevrez un lien de réinitialisation dans quelques minutes.
              </Text>
              <Text style={styles.successHint}>Vérifiez également vos spams.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.description}>
                Entrez votre adresse email. Si elle est enregistrée, vous recevrez un lien pour créer un nouveau mot de passe.
              </Text>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('emailAddress')}</Text>
                <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
                  <Ionicons name="mail-outline" size={20} color="#6c757d" style={styles.icon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder={t('enterEmail')}
                    value={mail}
                    onChangeText={text => { setMail(text); setEmailError(false); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    underlineColorAndroid="transparent"
                  />
                </View>
                {emailError && <Text style={styles.labelError}>{t('emailRequired')}</Text>}
              </View>

              <ButtonComponent isLoading={isLoading} title={t('recoverPassword')} press={Send} />
            </>
          )}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: { backgroundColor: 'transparent', flex: 1 },
  container: { flex: 1, padding: 20 },
  Title: {
    fontSize: 26,
    fontWeight: '700',
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: COLOR.gris,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
    marginBottom: 28,
  },
  fieldContainer: { width: '100%', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#495057', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    height: 50,
    paddingHorizontal: 15,
  },
  inputWrapperError: { borderColor: '#dc3545' },
  textInput: { backgroundColor: '#ffffff', width: 270, height: 46.5, marginTop: 5 },
  icon: { marginRight: 10 },
  labelError: { fontSize: 14, color: '#dc3545', marginTop: 5, paddingLeft: 5 },
  successBox: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  successHint: { fontSize: 13, color: '#888', textAlign: 'center' },
});

export default ForgetPasswordScreen;
