import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { Text, TextInput, Button } from 'react-native-paper';
import { setDateInfo } from '../../redux/actions/babySitting';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';

moment.locale('fr');

const BabySitterScreenStep3: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const globalsettings = useSelector(({ globalSetting }: any) => globalSetting);
  const id = useSelector(({ userReducer }: any) => userReducer.user.id);
  const data = useSelector(({ babySitting }: any) => babySitting);

  // 1️⃣ Calcul du total exact des heures choisies à l'Étape 1
  const extras = data?.skill || [];
  const totalExtraHours = extras.reduce((sum: number, item: any) => {
    return sum + (Number(item?.hours) || 0);
  }, 0);

  // LOGIQUE CORRIGÉE : Le minimum est égal aux suppléments. Si 0h de suppléments, le minimum par défaut passe à 1h.
  const absoluteMin = totalExtraHours > 0 ? totalExtraHours : 1;

  // 2️⃣ Initialisation de la durée avec ce minimum dynamique (1h, 2h, 5h, etc.)
  const [duree, setDuree] = useState<number>(absoluteMin);
  const [info, setInfo] = useState('');
  const [adress, setAddress] = useState('');

  // Initialisation par défaut à J+1
  const new_date = moment().add(1, 'days').toDate();
  const [startDate, setstartDate] = useState(new_date);
  const [open, setOpen] = useState(false);
  const [startTime, setstartTime] = useState(new_date);
  const [openT, setOpenT] = useState(false);

  // Ajustement automatique si l'état de Redux change au retour sur l'écran
  useEffect(() => {
    if (duree < absoluteMin) {
      setDuree(absoluteMin);
    }
  }, [absoluteMin]);

  // Actions de contrôle du compteur d'heures tactile
  const incrementDuration = () => setDuree(prev => prev + 1);
  const decrementDuration = () => {
    if (duree > absoluteMin) {
      setDuree(prev => prev - 1);
    } else {
      Toast.show({
        text1: t('attention') || 'Information',
        text2: `${t('minDurationAlert') || 'La durée minimale pour cette réservation est de'} ${absoluteMin}h`,
        type: 'info',
        position: 'top',
      });
    }
  };

  function navigatee() {
    // Validation des champs obligatoires
    if (!adress) {
      Toast.show({
        text1: t('errorTitle'),
        text2: t('errorIncomplete'),
        type: 'error',
        position: 'top',
      });
      return;
    }

    // Sécurité temporelle anti-dates passées
    const selectedDateTime = moment(
      `${moment(startDate).format('YYYY-MM-DD')} ${moment(startTime).format('HH:mm')}`,
      'YYYY-MM-DD HH:mm'
    ).toDate();

    if (selectedDateTime < new Date()) {
      Toast.show({
        text1: t('errorTitle') || 'Erreur',
        text2: t('pastDateTimeError') || 'Impossible de réserver à une date ou heure passée.',
        type: 'error',
        position: 'top',
      });
      return;
    }

    // Calcul du prix : Durée globale choisie * Taux de base (THBS)
    const Price = duree * Number(globalsettings?.THBS || 0);
    
    dispatch(
      setDateInfo(
        moment(startDate).format('YYYY-MM-DD'),
        moment(startTime).format('HH:mm'),
        adress,
        data.ville, // Transmis depuis la Step 1 via Redux
        info,
        id,
        String(duree), // Doit être une string pour l'API
        Price
      )
    );
    navigation.navigate('BabySitterScreenRecap');
  }

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('babysitterRequestStep3')}</Text>

        <View style={styles.card}>
          {/* Détails supplémentaires */}
          <Text style={styles.label}>{t('detailRequest')}</Text>
          <TextInput
            placeholder={t('detailPlaceholder')}
            value={info}
            onChangeText={setInfo}
            multiline
            numberOfLines={5}
            mode="outlined"
            style={styles.textarea}
            activeOutlineColor="#000"
          />

          {/* DATE */}
          <View style={styles.inputContainer}>
            <Text style={styles.LabelText}>
              {t("visitStart")} <Text style={{ color: "red" }}>*</Text> :
            </Text>
          </View>

          <View style={styles.inputRow}>
            <FontAwesome name="calendar" size={24} color="#000" />
            <TouchableOpacity onPress={() => setOpen(true)} style={styles.inputTouchable}>
              <Text style={styles.inputText}>
                {moment(startDate).format("DD/MM/YYYY")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* HEURE */}
          <View style={styles.inputContainer}>
            <Text style={styles.LabelText}>
              {t("heureVisite")} <Text style={{ color: "red" }}>*</Text> :
            </Text>
          </View>

          <View style={styles.inputRow}>
            <FontAwesome name="clock-o" size={26} color="#000" />
            <TouchableOpacity onPress={() => setOpenT(true)} style={styles.inputTouchable}>
              <Text style={styles.inputText}>
                {moment(startTime).format("HH:mm")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* COMPTEUR DE DURÉE INTERACTIF AVEC LE NOUVEAU MINIMUM */}
          <Text style={styles.label}>
            {t('duration')} <Text style={{ color: 'red' }}>*</Text>
          </Text>
          
          <View style={styles.counterContainer}>
            <TouchableOpacity 
              onPress={decrementDuration} 
              style={[styles.counterButton, duree <= absoluteMin && styles.counterButtonDisabled]}
            >
              <FontAwesome name="minus" size={16} color={duree <= absoluteMin ? "#94a3b8" : "#fff"} />
            </TouchableOpacity>
            
            <View style={styles.counterValueBox}>
              <Text style={styles.counterValueText}>{duree} h</Text>
            </View>

            <TouchableOpacity onPress={incrementDuration} style={styles.counterButton}>
              <FontAwesome name="plus" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.minHintText}>
            {t('minAllowedHint') || 'Minimum requis'} : {absoluteMin}h
          </Text>

          {/* ADRESSE */}
          <Text style={styles.label}>
            {t('address')} <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('addressPlaceholder')}
            value={adress}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="check"
            contentStyle={{ flexDirection: 'row-reverse' }}
            style={styles.button}
            onPress={navigatee}
          >
            {t('finalize')}
          </Button>
        </View>

        {/* Modals DatePicker (Sans l'attribut corrompu textColor) */}
        <DatePicker
          modal
          open={open}
          date={startDate}
          mode="date"
          minimumDate={new Date()}
          locale={i18n.language.startsWith("ar") ? "ar" : i18n.language.startsWith("en") ? "en" : "fr"}
          title={t("selectDate")}
          confirmText={t("confirmtDate")}
          cancelText={t("canceltDate")}
          theme="light"
          onConfirm={(date) => {
            setOpen(false);
            setstartDate(date);
            
            const now = new Date();
            if (date.toDateString() === now.toDateString() && startTime < now) {
              setstartTime(now);
            }
          }}
          onCancel={() => setOpen(false)}
        />

        <DatePicker
          modal
          open={openT}
          date={startTime}
          mode="time"
          locale={i18n.language.startsWith("ar") ? "ar" : i18n.language.startsWith("en") ? "en" : "fr"}
          title={t("selectDate")}
          confirmText={t("confirmtDate")}
          cancelText={t("canceltDate")}
          theme="light"
          onConfirm={(timeData) => {
            setOpenT(false);
            const now = new Date();
            
            if (startDate.toDateString() === now.toDateString() && timeData < now) {
              Toast.show({
                text1: t('errorTitle') || 'Heure invalide',
                text2: t('pastTimeError') || 'Vous ne pouvez pas choisir une heure passée.',
                type: 'error',
                position: 'top',
              });
              setstartTime(now);
            } else {
              setstartTime(timeData);
            }
          }}
          onCancel={() => setOpenT(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1, backgroundColor: '#fff' },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  LabelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 5,
  },
  inputRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 12,
    height: 55,
    width: 180,
    alignItems: 'center',
  },
  inputTouchable: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
    color: "#333",
  },
  textarea: {
    width: '100%',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  textInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#cbd5e1',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 13,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
    justifyContent: 'flex-start',
  },
  counterButton: {
    width: 45,
    height: 45,
    backgroundColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonDisabled: {
    backgroundColor: '#e2e8f0',
    borderColor: '#cbd5e1',
    borderWidth: 1,
  },
  counterValueBox: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValueText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  minHintText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    fontWeight: '500',
  },
  buttonContainer: { alignItems: 'center', marginTop: 30 },
  button: {
    height: 50,
    width: 260,
    borderRadius: 12,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
});

export default BabySitterScreenStep3;