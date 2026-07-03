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

  const isCancelled = item?.status === "4" || item?.etat === "4" || item?.situation === "4";

  // Situation : État d'avancement de la mission (Haut) avec gestion d'expiration logique
  const renderSituationStatus = () => {
    const status = item?.status || item?.etat || item?.situation || "0";

    // Correction logique UX : Si la commande est dans le passé (diff < 0) et qu'elle n'est ni en cours, ni finie, ni annulée
    if (diff < 0 && String(status) !== "2" && String(status) !== "3" && String(status) !== "4" && String(status) !== "ongoing" && String(status) !== "inprogress" && String(status) !== "completed" && String(status) !== "finished" && String(status) !== "cancelled") {
      return (
        <View style={[styles.situationBadge, { backgroundColor: '#FFEBEE', borderColor: '#EF5350' }]}>
          <Text style={[styles.situationText, { color: '#D32F2F' }]}>⏰ Demande Expirée</Text>
        </View>
      );
    }

    switch (String(status)) {
      case "0":
      case "pending":
        return (
          <View style={[styles.situationBadge, { backgroundColor: '#FFF3E0', borderColor: '#FFB74D' }]}>
            <Text style={[styles.situationText, { color: '#F57C00' }]}>⏳ En attente d'acceptation</Text>
          </View>
        );
      case "1":
      case "accepted":
      case "confirmed":
        return (
          <View style={[styles.situationBadge, { backgroundColor: '#E8F5E9', borderColor: '#81C784' }]}>
            <Text style={[styles.situationText, { color: '#388E3C' }]}>✅ Demande Confirmée</Text>
          </View>
        );
      case "2":
      case "ongoing":
      case "inprogress":
        return (
          <View style={[styles.situationBadge, { backgroundColor: '#E1F5FE', borderColor: '#4FC3F7' }]}>
            <Text style={[styles.situationText, { color: '#0288D1' }]}>🚀 Mission en cours</Text>
          </View>
        );
      case "3":
      case "completed":
      case "finished":
        return (
          <View style={[styles.situationBadge, { backgroundColor: '#EDE7F6', borderColor: '#B39DDB' }]}>
            <Text style={[styles.situationText, { color: '#5E35B1' }]}>🏁 Mission terminée</Text>
          </View>
        );
      case "4":
      case "cancelled":
        return (
          <View style={[styles.situationBadge, { backgroundColor: '#FFEBEE', borderColor: '#EF5350' }]}>
            <Text style={[styles.situationText, { color: '#D32F2F' }]}>❌ Annulée</Text>
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
              if (result) {
                Toast.show({ text1: "Succès", text2: "Demande annulée avec succès", type: "success" });
                fetchData();
              }
            } catch (error) {
              console.log("Erreur annulation:", error);
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
      fetchData();
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [type, id]);

  if (isLoading) {
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
                <View style={styles.inputGroup}>
                  <View style={styles.rowIcon}>
                    <Time width={16} height={16} fill="#6C2B8F" />
                    <Text style={styles.infoTitle}>{t("dateSelec")} :</Text>
                  </View>
                  <Text style={styles.infoValue}>
                    {moment(item?.date || item?.date_selected).format("DD/MM/YYYY")} {t("at")} {item?.time}h
                  </Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.infoTitle}>{t("city")} :</Text>
                  <Text style={styles.infoValue}>{item?.ville || "-"}</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.infoTitle}>{t("address")} :</Text>
                  <Text style={styles.infoValue}>{item?.adress || "-"}</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.infoTitle}>{t("Durée")} :</Text>
                  <Text style={styles.infoValue}>{item?.duree || 0}h</Text>
                </View>
                {item?.children && item.children.length > 0 && (
                  <View style={[styles.inputGroup, { marginTop: 10 }]}>
                    <Text style={[styles.infoTitle, { marginBottom: 5 }]}>{t("detailenfant")} :</Text>
                    {item.children.map((child: any, index: number) => (
                      <Text key={index} style={styles.infoValueItem}>
                        👧 {t("child")} {index + 1} - {child.age} {t("ansSexe")} {child.sex === "M" ? "Garçon" : "Fille"}
                      </Text>
                    ))}
                  </View>
                )}
              </>
            )}

            {type === "guide" && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.infoTitle}>{t("dateSelec")} :</Text>
                  <Text style={styles.infoValue}>{moment(item?.date || item?.date_selected).format("DD/MM/YYYY")} {t("at")} {item?.time}h</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.infoTitle}>{t("address")} :</Text>
                  <Text style={styles.infoValue}>{item?.adress || "-"}, {item?.ville || "-"}</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.infoTitle}>{t("typevisite")} :</Text>
                  <Text style={styles.infoValue}>{item?.typevisite_label || "-"}</Text>
                </View>
                <View style={styles.rowIconGroup}>
                  <Car width={16} height={16} />
                  <Text style={styles.infoValue}> {item?.withCar === "Oui" ? t("withCar") : t("withoutCar")}</Text>
                </View>
              </>
            )}

            {type === "activité" && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.infoTitle}>{t("dateSelec")} :</Text>
                  <Text style={styles.infoValue}>{moment(item?.date || item?.date_selected).format("DD/MM/YYYY")}</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.infoTitle}>{t("Activity")} :</Text>
                  <Text style={styles.infoValue}>{item?.activity_name || "-"}</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.infoTitle}>{t("formul")} :</Text>
                  <Text style={styles.infoValue}>{item?.package_name || "-"}</Text>
                </View>
              </>
            )}

            {type === "transfert" && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.infoTitle}>{t("dateSelec")} :</Text>
                  <Text style={styles.infoValue}>{moment(item?.date || item?.date_selected).format("DD/MM/YYYY")} {t("at")} {item?.time}h</Text>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.infoTitle}>{t("typevisite")} :</Text>
                  <Text style={styles.infoValue}>{item?.typevisite_label || item?.typevisites || "-"}</Text>
                </View>
                <View style={styles.rowIconGroup}>
                  <Persone width={16} height={16} />
                  <Text style={styles.infoValue}> {item?.nbrpersonne || 0} passagers</Text>
                </View>
              </>
            )}

            {type === "resto" && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.infoTitle}>{t("dateSelec")} :</Text>
                  <Text style={styles.infoValue}>{moment(item?.date || item?.date_selected).format("DD/MM/YYYY")}</Text>
                </View>
                {platsArray.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={[styles.infoTitle, { marginBottom: 8 }]}>{t("Plats")} :</Text>
                    {platsArray.map((plat: any, index: number) => (
                      <View key={index} style={styles.rowIconGroup}>
                        <Plat width={16} height={16} />
                        <Text style={styles.infoValueItem}>{plat.nom} × {plat.qte}</Text>
                      </View>
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
  inputGroup: { marginBottom: 14 },
  rowIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  rowIconGroup: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoTitle: { fontSize: 15, color: "#2C3E50", fontWeight: "700", marginLeft: 6 },
  infoValue: { fontSize: 15, color: "#4A4A4A" },
  infoValueItem: { fontSize: 15, color: "#4A4A4A", marginLeft: 10 },
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