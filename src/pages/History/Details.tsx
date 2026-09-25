import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import {
  Card,
  Divider,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native-paper';
import StarRating from 'react-native-star-rating';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { settings } from '../../api';
import { CreditCardInput } from 'react-native-credit-card-input-view';
import Toast from 'react-native-toast-message';

import Time from '../../assets/icons/whiteTime.svg';
import Plat from '../../assets/icons/plat.svg';
import Persone from '../../assets/icons/person.svg';
import Car from '../../assets/icons/car.svg';

import { useTranslation } from "react-i18next";
import AsyncStorage from '@react-native-async-storage/async-storage';

moment.locale('fr');
const windowWidth = Dimensions.get('window').width;

// Ligne "libellé : valeur" alignée sur une même rangée pour une lecture claire et homogène,
// quel que soit le type de réservation (avant : titre/valeur empilés, mise en page variable).
const InfoRow = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) => {
  // Certaines clés i18n incluent déjà un ":" (ex. "Durée :"), d'autres non (ex. "City") :
  // on retire un éventuel ":" existant avant d'en ajouter un seul, pour ne jamais le dupliquer.
  const cleanLabel = label.replace(/\s*:\s*$/, '');
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        {/* Emplacement d'icône toujours réservé (même vide) pour que le texte du
            libellé démarre au même x sur toutes les lignes, avec ou sans icône. */}
        <View style={styles.infoIcon}>{icon}</View>
        <Text style={styles.infoTitle}>{cleanLabel} :</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={3}>{value}</Text>
    </View>
  );
};

// Ligne icône + texte (ex: présence voiture, nombre de passagers, plat commandé)
const IconValueRow = ({ icon, value }: { icon: React.ReactNode; value: React.ReactNode }) => (
  <View style={styles.rowIconGroup}>
    {icon}
    <Text style={styles.infoValueItem}>{value}</Text>
  </View>
);

const HistoryScreenDetails: React.FC<{ navigation: any; route: any }> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation();

  const { id, type } = route.params;
  const user = useSelector(({ userReducer }: any) => userReducer.user);
  const token = useSelector(({ userReducer }: any) => userReducer.token);
  
  const [item, updateItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleAvis, setVisibleAvis] = useState(false);
  const [avis, setAvis] = useState('');
  const [note, setNote] = useState(0);
  const [card, setCard] = useState({
    card_number: '',
    cvc: '',
    exp_month: '',
    exp_year: '',
  });
  const [cartError, setcartError] = useState({
    cvc: 'incomplete',
    expiry: 'incomplete',
    number: 'incomplete',
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const cacheKey = `cachedHistoryDetails_${type}_${id}`;

      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        updateItem(JSON.parse(cachedData));
      }

      const data = await settings.AllReservationDetails(token, type, id);

      if (!data) {
        console.log("⚠️ API vide pour", type, id);
        return;
      }

      const cachedCities = await AsyncStorage.getItem("cities");
      if (cachedCities && !isNaN(data.ville)) {
        const cities = JSON.parse(cachedCities);
        const found = cities.find(
          (v) => v.id == data.ville || v.value == data.ville
        );
        if (found) data.ville = found.label || found.name;
      }

      const cachedTypes = await AsyncStorage.getItem("guide_typevisite");
      if (cachedTypes) {
        const list = JSON.parse(cachedTypes);
        const typeVisitId =
          data?.typevisites ||
          data?.typevisite ||
          data?.idtypevisite ||
          data?.type_visite;

        if (typeVisitId) {
          const found = list.find(
            (t) => String(t.id) === String(typeVisitId)
          );

          if (found) {
            data.typevisite_label = found.label;
            data.typevisite_description = found.description;
            data.typevisite_price = found.price;
            data.typevisite_periode = found.periode;
          }
        }
      }

      if (type === "resto") {
        data.date = data.date || data.createdat;
        data.adress = data.adress ?? "";
      }

      updateItem(data);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) {
      console.log("❌ fetchData error :", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Variables de calcul de temps globales pour le rendu
  const realDate = item?.date ?? item?.createdat;
  const diff = moment(realDate, "YYYY-MM-DD")
    .startOf("day")
    .diff(moment(new Date(), "YYYY-MM-DD").startOf("day"), "days");

  const isCancelled =
    item?.statut_prestataire === "annuler" ||
    item?.status === "4" ||
    item?.etat === "4" ||
    item?.situation === "4";

  // Situation : État d'avancement de la mission (Haut), basé sur le statut réel du
  // prestataire (statut_prestataire) plutôt que sur status/etat/situation, qui ne
  // distinguait jamais "en attente" de "en cours" (champ jamais renseigné par l'API).
  const renderSituationStatus = () => {
    const status = (item?.statut_prestataire || "en_attente").toString().toLowerCase().trim();

    if (isCancelled) {
      return (
        <View style={[styles.situationBadge, { backgroundColor: '#FFEBEE', borderColor: '#EF5350' }]}>
          <Text style={[styles.situationText, { color: '#D32F2F' }]}>❌ Annulée</Text>
        </View>
      );
    }

    // Expirée : date déjà passée et la mission n'a jamais démarré ni été terminée
    if (diff < 0 && status !== "en_cours" && status !== "termine") {
      return (
        <View style={[styles.situationBadge, { backgroundColor: '#FFEBEE', borderColor: '#EF5350' }]}>
          <Text style={[styles.situationText, { color: '#D32F2F' }]}>⏰ Demande Expirée</Text>
        </View>
      );
    }

    switch (status) {
      case "en_attente":
        return (
          <View style={[styles.situationBadge, { backgroundColor: '#FFF3E0', borderColor: '#FFB74D' }]}>
            <Text style={[styles.situationText, { color: '#F57C00' }]}>⏳ En attente d'acceptation</Text>
          </View>
        );
      case "accepte":
        return (
          <View style={[styles.situationBadge, { backgroundColor: '#E8F5E9', borderColor: '#81C784' }]}>
            <Text style={[styles.situationText, { color: '#388E3C' }]}>✅ Demande Confirmée</Text>
          </View>
        );
      case "en_cours":
        return (
          <View style={[styles.situationBadge, { backgroundColor: '#E1F5FE', borderColor: '#4FC3F7' }]}>
            <Text style={[styles.situationText, { color: '#0288D1' }]}>🚀 Mission en cours</Text>
          </View>
        );
      case "termine":
        return (
          <View style={[styles.situationBadge, { backgroundColor: '#EDE7F6', borderColor: '#B39DDB' }]}>
            <Text style={[styles.situationText, { color: '#5E35B1' }]}>🏁 Mission terminée</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.situationBadge, { backgroundColor: '#ECEFF1', borderColor: '#B0BEC5' }]}>
            <Text style={[styles.situationText, { color: '#455A64' }]}>{status}</Text>
          </View>
        );
    }
  };

  // 🔥 Fonction d'annulation de la demande client
  const handleCancelReservation = () => {
    Alert.alert(
      t("cancelTitle") || "Annuler la demande",
      t("cancelConfirm") || "Êtes-vous sûr de vouloir annuler cette demande ?",
      [
        { text: t("Non") || "Non", style: "cancel" },
        {
          text: t("Oui") || "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              let result = await settings.CancelReservation(token, type, item?.id);
              if (result?.status === "annuler") {
             Toast.show({ text1: "Succès", text2: "Demande annulée avec succès", type: "success" });
                fetchData();
              } else {
                Toast.show({
                  text1: "Erreur",
                  text2: result?.message || "L'annulation a échoué, veuillez réessayer.",
                  type: "error",
                });
              }
            } catch (error) {
              console.log("Erreur annulation:", error);
              Toast.show({
                text1: "Erreur",
                text2: "Impossible de contacter le serveur, veuillez réessayer.",
                type: "error",
              });
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  async function setNoteAvis() {
    if (!item?.id) return;
    if (avis?.length < 3) return;

    setIsLoading(true);
    let payload = { id: item.id, type: type, note: note, avis: avis, userid: user?.id };
    let result = await settings.SetNoteAvis(token, payload);

    if (result?.status === "success") {
      setVisibleAvis(false);
      Toast.show({ text1: "Votre avis a été envoyé", text2: t("reviewSent"), type: "success" });
      fetchData();
    } else {
      Toast.show({ text1: "Erreur", text2: t("reviewError"), type: "error" });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [type, id]);

  if (isLoading && !item) {
    return (
      <SafeAreaView style={[styles.backgroundStyle, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6C2B8F" />
      </SafeAreaView>
    );
  }

  function _onChange(form: any) {
    let ex = {
      card_number: form.values.number,
      cvc: form.values.cvc,
      exp_month: form.values.expiry[0] + '' + form.values.expiry[1],
      exp_year: '20' + form.values.expiry[3] + '' + form.values.expiry[4],
    };
    setCard(ex);
    setcartError(form.status);
  }

  async function finishProcess() {
    if (cartError.cvc === 'incomplete' || cartError.expiry === 'incomplete' || cartError.number === 'incomplete') {
      return;
    }
    setIsLoading(true);
    let obj = {
      card: card,
      user: { name: user.fname + ' ' + user.lname, email: user.mail },
      request: { id: item?.id, type: type, price: item?.totalprice },
    };
    let resultt = await settings.SetBabySettingPayment(obj, token);
    if (resultt) {
      fetchData();
      setVisible(false);
    }
    setIsLoading(false);
  }

  function FirstCapitalize(str: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const platsArray = type === "resto" && Array.isArray(item?.plats) ? item.plats : [];

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}> 
          
          {/* HAUT : Type de Demande + Situation Réelle Corrigée */}
          <View style={{ flexDirection: "column", width: '100%', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.cardTitle}>
                {type === 'resto' ? t("restaurateur") : type === 'babysitter' ? t("babysitter") : type === 'guide' ? t("guide") : FirstCapitalize(type)}
              </Text>
              <Text style={{ fontSize: 13, color: '#7F8C8D', fontWeight: '500' }}>ID: #{item?.id}</Text>
            </View>
            {renderSituationStatus()}
          </View>

          <Divider style={styles.divider} />
          
          {/* Contenu de la demande */}
          <Card.Content style={{ paddingHorizontal: 0, paddingTop: 15 }}>
            {type === "babysitter" && (
              <>
                <InfoRow
                  icon={<Time width={16} height={16} fill="#6C2B8F" />}
                  label={t("dateSelec")}
                  value={`${moment(item?.date || item?.date_selected).format("DD/MM/YYYY")} ${t("at")} ${item?.time}h`}
                />
                <InfoRow label={t("city")} value={item?.ville || "-"} />
                <InfoRow label={t("address")} value={item?.adress || "-"} />
                <InfoRow label={t("Durée")} value={`${item?.duree || 0}h`} />
                {item?.children && item.children.length > 0 && (
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>{t("detailenfant")}</Text>
                    {item.children.map((child: any, index: number) => (
                      <Text key={index} style={styles.infoValueItem}>
                        👧 {t("child")} {index + 1} — {child.age} {t("ansSexe")}, {child.sex === "M" ? "Garçon" : "Fille"}
                      </Text>
                    ))}
                  </View>
                )}
              </>
            )}

            {type === "guide" && (
              <>
                <InfoRow
                  label={t("dateSelec")}
                  value={`${moment(item?.date || item?.date_selected).format("DD/MM/YYYY")} ${t("at")} ${item?.time}h`}
                />
                <InfoRow label={t("address")} value={`${item?.adress || "-"}, ${item?.ville || "-"}`} />
                <InfoRow label={t("typevisite")} value={item?.typevisite_label || "-"} />
                <IconValueRow
                  icon={<Car width={16} height={16} />}
                  value={item?.withCar === "Oui" ? t("withCar") : t("withoutCar")}
                />
              </>
            )}

            {type === "activité" && (
              <>
                <InfoRow label={t("dateSelec")} value={moment(item?.date || item?.date_selected).format("DD/MM/YYYY")} />
                <InfoRow label={t("Activity")} value={item?.activity_name || "-"} />
                <InfoRow label={t("formul")} value={item?.package_name || "-"} />
              </>
            )}

            {type === "transfert" && (
              <>
                <InfoRow
                  label={t("dateSelec")}
                  value={`${moment(item?.date || item?.date_selected).format("DD/MM/YYYY")} ${t("at")} ${item?.time}h`}
                />
                <InfoRow label={t("typevisite")} value={item?.typevisite_label || item?.typevisites || "-"} />
                <IconValueRow icon={<Persone width={16} height={16} />} value={`${item?.nbrpersonne || 0} passagers`} />
              </>
            )}

            {type === "resto" && (
              <>
                <InfoRow label={t("dateSelec")} value={moment(item?.date || item?.date_selected).format("DD/MM/YYYY")} />
                {platsArray.length > 0 && (
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>{t("Plats")}</Text>
                    {platsArray.map((plat: any, index: number) => (
                      <IconValueRow key={index} icon={<Plat width={16} height={16} />} value={`${plat.nom} × ${plat.qte}`} />
                    ))}
                  </View>
                )}
              </>
            )}
          </Card.Content>

          {/* SECTION ACTIONS DYNAMIQUES */}
          <View style={styles.bottomContainer}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              {item?.etatpayement === "1" ? (
                <View style={styles.badge}><Text style={styles.paid}>💰 {t("paid") || "Payé"}</Text></View>
              ) : diff < 0 || isCancelled ? (
                <View style={styles.badge}>
                  <Text style={styles.expired}>{isCancelled ? "❌ Annulée" : t("expired") || "Expiré"}</Text>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => setVisible(true)} style={styles.payButton}>
                    <Text style={styles.payButtonText}>💳 {t("pay") || "Payer"}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={handleCancelReservation} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>{t("cancel") || "Annuler"}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <Text style={styles.priceText}>
              {(type === "activité" ? item?.total_price : item?.totalprice) || 0} €
            </Text>
          </View>

          {item?.etatpayement === "1" && item?.note === "0" && (
            <TouchableOpacity style={styles.Bottombutton} onPress={() => setVisibleAvis(true)}>
              <Text style={styles.buttonText}>{t("leaveReview")}</Text>
            </TouchableOpacity>
          )}
        </Card>
      </ScrollView>

      {/* Modales */}
      <Modal visible={visibleAvis} onDismiss={() => setVisibleAvis(false)} contentContainerStyle={styles.containerStyle2}>
        <View style={styles.modalInner}>
          <Text style={styles.Label3}>{t("reviewTitle")}</Text>
          <TextInput
            placeholder={t("reviewPlaceholder")}
            value={avis}
            onChangeText={text => setAvis(text)}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={{ width: '100%', marginBottom: 15 }}
            activeOutlineColor="#6C2B8F"
          />
          <StarRating disabled={false} maxStars={5} rating={note} selectedStar={rating => setNote(rating)} fullStarColor={'#FFC107'} containerStyle={{ width: '60%', marginVertical: 15 }} />
          <TouchableOpacity style={styles.buttonStyle} onPress={setNoteAvis}>
            <Text style={styles.buttonText}>{t("send")}</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.containerStyle2}>
        <ScrollView>
          <CreditCardInput autoFocus requiresName requiresCVC labelStyle={{ color: 'black', fontSize: 12 }} inputStyle={{ fontSize: 16, color: 'black' }} validColor={'black'} invalidColor={'red'} placeholderColor={'darkgray'} onChange={_onChange} />
          <TouchableOpacity style={styles.buttonStyle} onPress={finishProcess}>
            <Text style={styles.buttonText}>{t("pay")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </SafeAreaView>
  ); 
};

const styles = StyleSheet.create({
  backgroundStyle: { backgroundColor: 'transparent', flex: 1 },
  container: { paddingTop: 25, paddingHorizontal: 20, paddingBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 4 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#2C3E50' },
  divider: { backgroundColor: '#E6E8EB', height: 1, marginVertical: 10 },
  situationBadge: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, marginTop: 6, alignSelf: 'flex-start' },
  situationText: { fontSize: 13, fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  infoLabel: { flexDirection: 'row', alignItems: 'center', width: '42%' },
  infoIcon: { width: 22, marginRight: 6, alignItems: 'flex-start' },
  rowIconGroup: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoTitle: { fontSize: 15, color: "#2C3E50", fontWeight: "700", flexShrink: 1 },
  infoValue: { flex: 1, fontSize: 15, color: "#4A4A4A", textAlign: 'left' },
  infoValueItem: { fontSize: 15, color: "#4A4A4A", marginLeft: 10 },
  sectionBox: { backgroundColor: '#F7F5FA', borderRadius: 10, padding: 12, marginTop: 6, marginBottom: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#6C2B8F', marginBottom: 8 },
  bottomContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#E6E8EB' },
  priceText: { fontSize: 22, color: '#2C3E50', fontWeight: '700', marginLeft: 10 },
  badge: { borderRadius: 20, overflow: 'hidden' },
  paid: { backgroundColor: '#4CAF50', color: '#fff', fontSize: 14, fontWeight: '600', paddingVertical: 6, paddingHorizontal: 14 },
  expired: { backgroundColor: '#F44336', color: '#fff', fontSize: 14, fontWeight: '600', paddingVertical: 6, paddingHorizontal: 14 },
  
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  payButton: { backgroundColor: '#6C2B8F', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8 },
  payButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  cancelButton: { backgroundColor: '#FFF5F5', borderColor: '#FEB2B2', borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  cancelButtonText: { color: '#E53E3E', fontSize: 14, fontWeight: '600' },

  Bottombutton: { backgroundColor: '#6C2B8F', paddingVertical: 12, borderRadius: 10, width: '100%', marginTop: 20 },
  buttonStyle: { width: '100%', backgroundColor: '#6C2B8F', borderRadius: 10, paddingVertical: 12, marginTop: 15 },
  buttonText: { color: "#fff", fontWeight: "600", textAlign: "center", fontSize: 16 },
  containerStyle2: { backgroundColor: '#fff', width: windowWidth - 40, alignSelf: 'center', borderRadius: 18, padding: 22, elevation: 8 },
  modalInner: { width: "100%", alignItems: "center" },
  Label3: { fontSize: 18, fontWeight: '600', color: '#6C2B8F', textAlign: 'center', marginBottom: 15 },
});

export default HistoryScreenDetails;