import { LogBox } from 'react-native';

// Désactive l'avertissement spécifique aux listes imbriquées du ScrollView
LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { useSelector } from 'react-redux';
import {
  ActivityIndicator,
  Divider,
  Button,
  Modal,
  Text,
} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { settings } from '../../api';
import { ButtonComponent } from '../../components';
import { useTranslation } from 'react-i18next';
import { useUnpaidCheck } from '../../hooks/useUnpaidCheck';
import UnpaidMissionModal from '../../components/UnpaidMissionModal';

const windowWidth = Dimensions.get('window').width;
moment.locale('fr');

const BabySitterScreenRecap: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();

  // Récupération sécurisée des données du store Redux
  const token = useSelector(({ userReducer }: any) => userReducer.token);
  const id = useSelector(({ userReducer }: any) => userReducer.user.id);
  const data = useSelector(({ babySitting }: any) => babySitting);
  const globalsettings = useSelector(({ globalSetting }: any) => globalSetting);

  const { unpaidMission, checkBeforeSubmit, clearUnpaid } = useUnpaidCheck();
  const [visible, setVisible] = useState(false);
  const [loadingValidation, setLoadingValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0);
  const [globalDuration, setGlobalDuration] = useState(3);

  // Synchronisation et calcul dynamique du montant total au montage/changement
  useEffect(() => {
    const thbs = globalsettings?.THBS ? parseFloat(globalsettings.THBS) : 0;
    const countChildren = data?.childs?.length || 1;
    
    // Récupération de la durée globale de garde de l'étape 3
    const finalDuration = data?.duree ? parseFloat(data.duree) : 3;
    setGlobalDuration(finalDuration);

    // Partie 1: Tarif de Base = THBS * Nombre d'enfants * Durée globale
    const baseTotal = thbs * countChildren * finalDuration;

    // Partie 2: Somme des Suppléments = Tarif Option * Heures de l'Option (Pas de multiplication par enfant)
    const totalSkillsPrice = data?.skill ? data.skill.reduce((sum: number, item: any) => {
      const skillPrice = item?.price ? parseFloat(item.price) : 0;
      const skillCount = Number(item.count) || Number(item.hours) || 1;
      return sum + (skillPrice * skillCount);
    }, 0) : 0;
    
    setCalculatedTotalPrice(baseTotal + totalSkillsPrice);
  }, [data, globalsettings]);

  const hideModal = () => {
    if (!loadingValidation) {
      setVisible(false);
    }
  };

  // Traitement et envoi de la réservation vers l'API Backend
  const navigatee = async () => {
    const canSubmit = await checkBeforeSubmit();
    if (!canSubmit) return;
    setIsLoading(true);
    setVisible(true);
    setLoadingValidation(true);

    try {
      const thbs = globalsettings?.THBS ? parseFloat(globalsettings.THBS) : 0;
      const countChildren = data?.childs?.length || 1;
      const finalDuration = data?.duree ? parseFloat(data.duree) : 3;

      const baseTotal = thbs * countChildren * finalDuration;

      // Recalcul strict et unifié de la formule principale pour le payload API
      const totalSkillsPrice = data?.skill ? data.skill.reduce((sum: number, item: any) => {
        const skillPrice = item?.price ? parseFloat(item.price) : 0;
        const skillCount = Number(item.count) || Number(item.hours) || 1;
        return sum + (skillPrice * skillCount);
      }, 0) : 0;

      const preciseTotalPrice = baseTotal + totalSkillsPrice;

      const payload = {
        ...data,
        user_id: id,
        duree: String(finalDuration),
        skill: data.skill ? data.skill.map((val: any) => ({
          code: val.value,
          id: val.id,
          count: val.count || val.hours || 1, 
        })) : [],
        languages: data.languages ? data.languages.map((val: any) => ({
          code: val.code,
          id: val.id,
        })) : [],
        date_start: data.date_start,
        heure_start: data.heure_start,
        totalprice: preciseTotalPrice,
      };

      const result = await settings.SetBabySetting(payload, token);

      setTimeout(() => {
        setLoadingValidation(false);
        setIsLoading(false);
        console.log("✅ Réservation enregistrée avec succès:", result);
      }, 1000);

    } catch (error) {
      console.error("❌ Échec lors de la requête API:", error);
      setLoadingValidation(false);
      setIsLoading(false);
      setVisible(false);

      Toast.show({
        text1: t("errorTitle"),
        text2: t("errorOccurred"),
        type: "error",
        position: "top",
      });
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('recapTitle')}</Text>

        <View style={styles.card}>
          {/* Langues parlées demandées */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('languages')}</Text>
            <Text style={styles.value}>
              {data?.languages && data.languages.length > 0 
                ? data.languages.map((val: any) => val.item).join(', ') 
                : t('none')}
            </Text>
          </View>

          {/* Suppléments & Compteurs individuels associés */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('skills')}</Text>
            {data?.skill && data.skill.length > 0 ? (
              data.skill.map((val: any, idx: number) => {
                const count = val.count || val.hours || 1;
                return (
                  <Text key={idx} style={styles.value}>
                    • {val.label} : {count}h (+{val.price}€/h)
                  </Text>
                );
              })
            ) : (
              <Text style={styles.value}>{t('none')}</Text>
            )}
          </View>

          {/* Liste récapitulative des Enfants */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('childrenToKeep')}</Text>
            {data?.childs && data.childs.length > 0 ? (
              data.childs.map((val: any, idx: number) => (
                <Text key={idx} style={styles.value}>
                  • {val.sex === 'B' ? t('boy') : t('girl')} - {val.age} {t('yearsOld')}
                </Text>
              ))
            ) : (
              <Text style={styles.value}>1 {t('child')}</Text>
            )}
          </View>

          {/* Date, horaire de début et durée totale globale */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('dateTime')}</Text>
            <Text style={styles.value}>
              {moment(data.date_start).format('DD/MM/YYYY')} à {data.heure_start} ({globalDuration}h {t('total') || 'au total'})
            </Text>
          </View>

          {/* Adresse complète du rendez-vous */}
          <View style={styles.section}>
            <Text style={styles.label}>{t('meetingAddress')}</Text>
            <Text style={styles.value}>
              {data.adress}, {data.ville}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Affichage du Prix Final Calculé */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t('totalPrice')}</Text>
            <Text style={styles.priceValue}>{calculatedTotalPrice.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Bouton de confirmation finale */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="check-all"
            contentStyle={{ flexDirection: 'row-reverse', height: 50 }}
            style={styles.button}
            onPress={navigatee}
            loading={isLoading}
            disabled={isLoading}
          >
            {t('confirmButton')}
          </Button>
        </View>

        {/* Boîte de dialogue Modale : Statut et Succès du traitement */}
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            {loadingValidation ? (
              <>
                <ActivityIndicator size="large" color="#000" />
                <Text style={styles.loadingText}>{t("loadingValidation")}</Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={80} color="#22c55e" style={{ marginBottom: 15 }} />
                <Text style={styles.modalTitle}>{t('reservationConfirmed')}</Text>
                <Text style={styles.modalMessage}>{t('yourBabysitterReservationHasBeenConfirmed')}</Text>

                <TouchableOpacity onPress={() => navigation.navigate('HistoryStack')} style={styles.modalLinkContainer}>
                  <Text style={styles.modalLink}>{t('seeMyRequests')}</Text>
                </TouchableOpacity>

                <ButtonComponent title={t('backToHome')} press={() => navigation.navigate("YouzFul")} isLoading={false} />
              </>
            )}
          </View>
        </Modal>
      </ScrollView>
      <UnpaidMissionModal
        visible={!!unpaidMission}
        mission={unpaidMission}
        onPaid={clearUnpaid}
        onDismiss={clearUnpaid}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1 },
  title: { fontSize: 26, fontWeight: '700', color: '#0f172a', textAlign: 'center', marginVertical: 25 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '92%', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  section: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "700", color: "#64748b", textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 16, color: "#1e293b", fontWeight: "500", marginTop: 4 },
  divider: { backgroundColor: "#e2e8f0", height: 1, marginVertical: 15 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  priceLabel: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  priceValue: { fontSize: 20, fontWeight: "800", color: "#2563eb" },
  buttonContainer: { alignItems: 'center', marginTop: 30 },
  button: { width: 280, borderRadius: 12, backgroundColor: '#000', justifyContent: 'center' },
  modalContainer: { backgroundColor: '#fff', width: windowWidth - 50, alignSelf: 'center', borderRadius: 20, padding: 25 },
  modalContent: { alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 16, color: "#64748b", fontWeight: '500' },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#0f172a', textAlign: 'center', marginBottom: 10 },
  modalMessage: { fontSize: 15, color: '#475569', textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  modalLinkContainer: { marginBottom: 20 },
  modalLink: { fontSize: 16, fontWeight: '600', color: '#2563eb', textDecorationLine: 'underline' },
});

export default BabySitterScreenRecap;