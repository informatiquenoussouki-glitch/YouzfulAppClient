import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { CreditCardInput } from "react-native-credit-card-input-view";
import { setReservation } from "../../api/settings";
import { t } from "i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
const windowWidth = Dimensions.get('window').width;


export default function CheckoutScreen() {
   const navigation = useNavigation();
  const route = useRoute();
  const { packageData, selectedDate, total, childCount, adultCount } = route.params;
  const user = useSelector((state: any) => state.userReducer?.user);

  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const navigatee = () => setVisible(true);
  const hideModal = () => setVisible(false); 

  const [loadingValidation, setLoadingValidation] = useState(false);


  // ✅ Nouvelle version : enregistre uniquement la réservation
async function finishProcess() {
  hideModal(); // fermer le premier modal

  // ⚡ 1) Afficher modal succès immédiatement
  setSuccessVisible(true);

  // ⚡ 2) Afficher loading 0.8 sec
  setLoadingValidation(true);
  setTimeout(() => setLoadingValidation(false), 800);

  // 🚀 3) API en arrière-plan (NE BLOQUE RIEN)
  (async () => {
    try {
      const payload = {
        userid: user?.id,
        package_id: packageData?.id,
        date_selected: selectedDate,
        adult_count: adultCount || 1,
        child_count: childCount || 0,
        total_price: parseFloat(total),
        status: "en_attente",
      };

      console.log("📤 Envoi réservation :", payload);

      const res = await setReservation(payload);
      console.log("📥 Réponse API :", res);

      if (res.status !== "success") {
        Alert.alert("Erreur", res.message || t("errreser"));
      }

    } catch (err) {
      console.error("❌ Erreur API :", err);
      Alert.alert("Erreur", "Problème de connexion avec le serveur.");
    }
  })();
}



  return (
    <View style={styles.container}>
      {/* === Détails package === */}
      <View style={styles.card}>
        <Image source={packageData.image} style={styles.image} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{packageData.activityName}</Text>
          <Text style={styles.subtitle}>{packageData.name}</Text>
          <Text style={styles.date}>{selectedDate}</Text>
          <Text style={styles.freeCancel}>{t("anulation")}</Text>
        </View>
      </View>

      {/* === Détails utilisateur === */}
      <Text style={styles.section}>Contact details</Text>
      <View>
        <TextInput style={styles.input} placeholder="First name" defaultValue={user?.fname || ""} />
        <TextInput style={styles.input} placeholder="Last name" defaultValue={user?.lname || ""} />
        <TextInput style={styles.input} placeholder="Email" defaultValue={user?.mail || ""} />
        <TextInput style={styles.input} placeholder="Phone" defaultValue={user?.tel || ""} />
      </View>

      {/* === Pied === */}
      <View style={styles.footer}>
        <Text style={styles.total}>USD {total}</Text>
        <TouchableOpacity style={styles.continueBtn} onPress={navigatee}>
          <Text style={styles.continueText}>Continuer</Text>
        </TouchableOpacity>
      </View>

      {/* === Modal Réservation === */}
      <Modal visible={visible} transparent animationType="slide" onRequestClose={hideModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackground}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t("confirmreser")}</Text>

            <Text style={{ textAlign: "center", marginBottom: 20, color: "#555" }}>
             {t("confir2")}
            </Text>

            {isLoading ? (
              <ActivityIndicator size="large" color="#1da3c6" />
            ) : (
              <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.payBtn} onPress={finishProcess}>
                  <Text style={styles.payText}>{t("confirmButton")}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={hideModal} style={styles.cancelBtn}>
                  <Text style={styles.cancelText}>{t("canceltDate")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ✅ Nouveau Modal de confirmation (style moderne) */}
<Modal
  visible={successVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setSuccessVisible(false)}
>
  <View style={styles.overlay}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>

        {/* LOADING */}
        {loadingValidation ? (
          <>
            <ActivityIndicator size="large" color="#000" />
            <Text style={{ marginTop: 15, fontSize: 16, color: "#555" }}>
              {t("loadingValidation") || "Validation en cours..."}
            </Text>
          </>
        ) : (
          <>
            {/* SUCCESS ICON */}
            <Ionicons
              name="checkmark-circle"
              size={72}
              color="#22c55e"
              style={{ marginBottom: 10 }}
            />

            {/* TITLE */}
            <Text style={styles.modalTitle}>{t("savereser")}</Text>

            {/* MESSAGE */}
            <Text style={styles.modalMessage}>
              {t("reservationSuccess")}
            </Text>

            {/* LINK */}
            <TouchableOpacity
              onPress={() => {
                setSuccessVisible(false);
                navigation.navigate("HistoryStack");
              }}
              style={styles.modalLinkContainer}
            >
              <Text style={styles.modalLink}>{t("seeMyRequests")}</Text>
            </TouchableOpacity>

            {/* OK */}
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => {
                setSuccessVisible(false);
                navigation.navigate("YouzFul");
              }}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </>
        )}

      </View>
    </View>
  </View>
</Modal>


    </View>
  );
}


const styles = StyleSheet.create({

  // ✅ Overlay noir léger
overlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.4)',
  justifyContent: 'center',
  alignItems: 'center',
},

// ✅ Conteneur du modal
modalContainer: {
  backgroundColor: '#fff',
  width: windowWidth - 60,
  borderRadius: 16,
  padding: 25,
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 6,
},

modalContent: {
  alignItems: 'center',
  justifyContent: 'center',
},

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

modalLinkContainer: {
  marginBottom: 10,
},

modalLink: {
  fontSize: 15,
  fontWeight: '600',
  color: '#000',
  textDecorationLine: 'underline',
},

// ✅ Bouton OK (moderne)
okButton: {
  width: '100%',
  backgroundColor: '#000',
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 5,
},

okButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '700',
},

  successOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.6)",
  justifyContent: "center",
  alignItems: "center",
},
successBox: {
  width: "80%",
  backgroundColor: "#fff",
  borderRadius: 20,
  padding: 25,
  alignItems: "center",
  elevation: 8,
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 8,
},
checkCircle: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: "#2e7d32", // 🟢 vert succès
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 20,
},
checkText: {
  color: "#fff",
  fontSize: 42,
  fontWeight: "bold",
},
successTitle: {
  fontSize: 20,
  fontWeight: "bold",
  color: "#2e7d32",
  marginBottom: 8,
  textAlign: "center",
},
successMessage: {
  textAlign: "center",
  color: "#444",
  fontSize: 15,
  lineHeight: 22,
  marginBottom: 25,
},


  container: { flex: 1, backgroundColor: "transparent", padding: 16 },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 10,
    marginBottom: 20,
  },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  title: { fontWeight: "bold", fontSize: 16 },
  subtitle: { color: "#666", marginVertical: 2 },
  date: { color: "#1da3c6", fontWeight: "600" },
  freeCancel: { color: "green", fontWeight: "500", fontSize: 13, marginTop: 4 },
  section: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  total: { fontSize: 18, fontWeight: "bold", color: "#1da3c6" },
  continueBtn: {
    backgroundColor: "#d64e41",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  continueText: { color: "#fff", fontWeight: "600" },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  
  buttonGroup: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  payBtn: {
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  payText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelBtn: { marginTop: 15, alignItems: "center" },
  cancelText: { color: "#d64e41", fontWeight: "600" },
});
