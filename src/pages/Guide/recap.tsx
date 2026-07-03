import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Toast from "react-native-toast-message";
import moment from "moment";
import { ActivityIndicator, Text, Divider, Button, Modal } from "react-native-paper";
import { useSelector } from "react-redux";
import { COLOR } from "../../helpers/functions";
import { settings } from "../../api";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { ButtonComponent } from "../../components";
import { Colors } from "react-native/Libraries/NewAppScreen";

moment.locale("fr");
const windowWidth = Dimensions.get("window").width;

const GuideRecap: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const token = useSelector(({ userReducer }: any) => userReducer.token);
  const user = useSelector(({ userReducer }: any) => userReducer.user);
  const data = useSelector(({ GuideReducer }: any) => GuideReducer);
  const [visible, setVisible] = useState(false);
  const [result, setResult] = useState<any>(null);
  

 // ⚠️ remove the useEffect(...) that auto-runs on mount

const [loading, setLoading] = useState(false); // 🔹 état local pour le spinner

const saveGuide = async () => {
 try {
    const result = await settings.SetGuide(
      {
        ...data,
        languages: data.languages.map((val: any) => ({
          code: val.code,
          id: val.id,
        })),
      },
      token
    );

    setResult(result);

    Toast.show({
      text1: t("successTitle"),
      text2: t("successMessage"),
      type: "success",
      position: "top",
    });

    return true;

  } catch (err) {
    console.error("Erreur SetGuide:", err);

    Toast.show({
      text1: t("errorTitle"),
      text2: t("errorSubmitGuide"),
      type: "error",
      position: "top",
    });

    return false;
  }
};


  const hideModal = () => setVisible(false);
console.log("🟦 Recap description =", data?.description)

  

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollContainer}>
        <Text style={styles.title}>{t("recapTitle")}</Text>

        {/* ---- CONTENU DU RECAP ---- */}
        <View style={styles.cardContainer}>
          {/* Point de RDV */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t("meetingPoint")}</Text>
            <Text style={styles.value}>
              {data?.adress}, {data?.ville}
            </Text>
          </View>
          {/* Type visite  */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t("visitWanted")}</Text>
            <Text style={styles.value}>
              {data?.typevisite}
             
              
            </Text>
          </View>
          {/* description de Type visite  */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t("visitDescription")}</Text>
            <Text style={styles.value}>
               {data?.description}
              
              
            </Text>
          </View>

          {/* Langues */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t("guideLanguagesSpoken")}</Text>
            <Text style={styles.value}>
              {data?.languages.map((val: any) => val.item).join(", ")}
            </Text>
          </View>

          {/* Avec voiture */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t("guideWithCarRecap")}</Text>
            <Text style={styles.value}>{data?.withCar}</Text>
          </View>

          {/* Nombre passagers */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t("passengersNumberRecap")}</Text>
            <Text style={styles.value}>{data?.nbrpersonne}</Text>
          </View>

          {/* Début visite */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t("visitStart")}</Text>
            <Text style={styles.value}>
              {t("visitStarts", {
                date: data?.date,
                time: data?.time,
                duree: data?.duree,
                
              })}
            </Text>
          </View>

          

          

          <Divider style={styles.divider} />

          {/* Prix */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t("priceRecap")}</Text>
            <Text style={styles.priceValue}>{data?.totalprice} SAR</Text>
          </View>
        </View>

        {/* Bouton principal */}
        <View style={styles.buttonContainer}>
      <Button
  mode="contained"
  icon="arrow-right"
  contentStyle={{ flexDirection: "row-reverse" }}
  style={styles.button}
  onPress={async () => {

    // 🔵 1. Ouvrir le modal et montrer le loader
    setVisible(true);
    setLoading(true);

    // 🔵 2. Lancer API en arrière-plan (sans attendre)
    saveGuide().then((ok) => {
      if (!ok) {
        Toast.show({
          text1: t("errorTitle"),
          text2: t("errorSubmitGuide"),
          type: "error",
          position: "top",
        });
      }
    });

    // 🔵 3. Garder le loader 1 seconde maximum
    setTimeout(() => {
      setLoading(false); // afficher succès
    }, 900);  // ⏳ 0.9 seconde = très fluide
  }}
>
  {t("confirmButton")}
</Button>




  
        </View>

        {/* ---- MODAL CONFIRMATION ---- */}
   <Modal
  visible={visible}
  onDismiss={() => setVisible(false)}
  contentContainerStyle={styles.modalContainer}
>
  <View style={styles.modalContent}>

    {loading ? (
      <>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 15, fontSize: 16, color: "#555" }}>
          {t("loadingValidation") }
        </Text>
      </>
    ) : (
      <>
        <Ionicons name="checkmark-circle" size={72} color="#4CAF50" />
        <Text style={styles.modalTitle}>{t("reservationConfirmed")}</Text>
        <Text style={styles.modalMessage}>
          {t("yourGuideReservationHasBeenConfirmed")}
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate("HistoryStack")}
          style={styles.modalLinkContainer}
        >
          <Text style={styles.modalLink}>{t("seeMyRequests")}</Text>
        </TouchableOpacity>

        <ButtonComponent
          title={t("makeAnotherRequest")}
          press={() => navigation.navigate("YouzFul")}
          isLoading={false}
        />
      </>
    )}

  </View>
</Modal>


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: "transparent" },
  scrollContainer: { flex: 1, paddingHorizontal: 20 },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    marginVertical: 25,
  },

  /** --- Carte principale --- **/
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    
  },

  /** --- Lignes d’infos --- **/
  infoRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
  },
  value: {
    fontSize: 15,
    color: "#475569",
    marginTop: 3,
  },
  divider: {
    backgroundColor: "#e2e8f0",
    height: 1,
    marginVertical: 15,
  },

  /** --- Prix --- **/
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },
  priceValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2563eb",
  },

  /** --- Boutons --- **/
  buttonContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  button: {
    height: 50,
    width: 260,
    borderRadius: 12,
    backgroundColor: "#000",
    justifyContent: "center",
  },

  /* MODAL */
  modalContainer: {
    backgroundColor: '#fff',
    width: windowWidth - 60,
    alignSelf: 'center',
    borderRadius: 16,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalContent: { alignItems: 'center', justifyContent: 'center' },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  modalLinkContainer: { marginBottom: 10 },
  modalLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    textDecorationLine: 'underline',
  },
});

export default GuideRecap;
