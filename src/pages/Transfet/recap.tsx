import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { Text, Divider, Modal, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ButtonComponent } from "../../components";

const windowWidth = Dimensions.get("window").width;

const TransfertRecap: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  
  // 🔹 États pour le modal et le chargement
  const [visible, setVisible] = useState(false);
  const [loadingValidation, setLoadingValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Récupérer les données transmises
  const data = route.params?.recapData;

  const hideModal = () => {
    if (!loadingValidation) {
      setVisible(false);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setVisible(true);
    setLoadingValidation(true);

    try {
      // Simulation ou Appel API ici (identique à la logique BabySitter)
      // await settings.SetTransfert(data, token); 

      // Délai UX pour montrer la validation
      setTimeout(() => {
        setLoadingValidation(false);
        setIsLoading(false);
      }, 1500);

    } catch (error) {
      console.error("❌ Erreur:", error);
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

  if (!data) {
    console.warn("⚠️ Pas de données transfert reçues !");
    return (
      <SafeAreaView style={styles.background}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          {t("noRecapData")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollContainer}
      >
        <Text style={styles.title}>{t("recapTitle")}</Text>

        <View style={styles.cardContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>{t("meetingPoint")} </Text>
            <Text style={styles.value}>{data.city}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{t("visitWanted")} :</Text>
            <Text style={styles.value}>{data.destination}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{t("visitStart")} : </Text>
            <Text style={styles.value}>
              {data.date} {data.time}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>{t("passengersNumberRecap")}</Text>
            <Text style={styles.normalText}>{data.nbrPassager}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t("priceRecap")}</Text>
            <Text style={styles.priceValue}>{data.totalPrice} SAR</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <ButtonComponent
            title={t("confirmButton")}
            press={handleConfirm}
            isLoading={isLoading}
          />
        </View>

        {/* --- Modal de Succès / Loading (Méthode identique) --- */}
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
                <Ionicons
                  name="checkmark-circle"
                  size={80}
                  color="#22c55e"
                  style={{ marginBottom: 15 }}
                />
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
                  title={t("backToHome")}
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
  normalText: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "400",
  },
  scrollContainer: { flex: 1, paddingHorizontal: 20 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    marginVertical: 25,
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  infoRow: { marginBottom: 15 },
  label: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  value: { fontSize: 15, color: "#475569", marginTop: 3 },
  divider: { backgroundColor: "#e2e8f0", height: 1, marginVertical: 15 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: { fontSize: 17, fontWeight: "700", color: "#000" },
  priceValue: { fontSize: 17, fontWeight: "700", color: "#2563eb" },
  buttonContainer: { alignItems: "center", marginBottom: 40 },
  // Styles du Modal
  modalContainer: {
    backgroundColor: "#fff",
    width: windowWidth - 50,
    alignSelf: "center",
    borderRadius: 20,
    padding: 25,
  },
  modalContent: { alignItems: "center" },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },
  modalLinkContainer: { marginBottom: 20 },
  modalLink: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
    textDecorationLine: "underline",
  },
});

export default TransfertRecap;
