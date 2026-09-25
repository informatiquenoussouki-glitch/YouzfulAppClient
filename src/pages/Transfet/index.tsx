import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import moment from "moment";
import Toast from "react-native-toast-message";
import DatePicker from "react-native-date-picker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { settings } from '../../api';
import { useNavigation } from "@react-navigation/native";
import { ButtonComponent } from "../../components";
import { useUnpaidCheck } from "../../hooks/useUnpaidCheck";
import UnpaidMissionModal from "../../components/UnpaidMissionModal";

const windowWidth = Dimensions.get("window").width;
moment.locale("fr");

const TransfertGuideScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const token = useSelector(({ userReducer }: any) => userReducer.token);
  const user = useSelector(({ userReducer }: any) => userReducer.user);

  const { unpaidMission, checkBeforeSubmit, clearUnpaid } = useUnpaidCheck();
  // 🔹 Données
  const [allData, setAllData] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]); 
  const [trajets, setTrajets] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  // 🔹 Sélections
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedTrajetName, setSelectedTrajetName] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  // 🔹 Prix et Passagers
  const [nbrPassager, setNbrPassager] = useState(1);
  const [maxPassagers, setMaxPassagers] = useState(20); 
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // 🔹 Date et Heure
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);

  // 1. Récupération des Villes
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const result = await settings.Cities();
        setCities(result?.data?.map((val: any) => ({ label: val.name, value: val.id })) ?? []);
      } catch (err) { console.error(err); }
    };
    fetchCities();
  }, []);

  // 2. Data par Ville
  useEffect(() => {
    if (!selectedCity) return;
    const fetchAllData = async () => {
      const data = await settings.VisitTypeTransfert(token || "", selectedCity);
      if (data && Array.isArray(data)) {
        setAllData(data);
        const uniqueTypes = [...new Set(data.map(item => item.description))].map(t => ({ label: t, value: t }));
        setTypes(uniqueTypes);
      }
    };
    fetchAllData();
    setSelectedType(null);
    setSelectedTrajetName(null);
    setSelectedVehicleId(null);
  }, [selectedCity]);

  // 3. Trajets par Type
  useEffect(() => {
    if (selectedType) {
      const filtered = allData.filter(item => item.description === selectedType);
      const uniqueNames = [...new Set(filtered.map(item => item.label.trim()))]
        .map(name => ({ label: name, value: name }));
      setTrajets(uniqueNames);
      setSelectedTrajetName(null);
      setSelectedVehicleId(null);
    }
  }, [selectedType]);

  // 4. Véhicules par Trajet (Mis à jour avec la colonne .vehicule)
  useEffect(() => {
    if (selectedTrajetName) {
      const filteredVehicles = allData
        .filter(item => item.label.trim() === selectedTrajetName && item.description === selectedType)
        .map(item => ({
          label: item.vehicule || "Véhicule standard",
          value: item.id,
          price: item.price
        }));
      setVehicles(filteredVehicles);
      setSelectedVehicleId(null);
    }
  }, [selectedTrajetName]);

  // 5. LOGIQUE : Calcul prix (Haramain) + Capacité Stricte (Mis à jour avec la colonne .vehicule)
  useEffect(() => {
    const vehicle = vehicles.find(v => v.value === selectedVehicleId);
    if (vehicle) {
      const basePrice = Number(vehicle.price) || 0;
      setUnitPrice(basePrice);

      let capacity = 20;
      const labelLower = vehicle.label.toLowerCase();
      
      // Gestion des capacités selon le nom du véhicule direct de la colonne BDD
      if (labelLower.includes("sedan")) capacity = 4;
      else if (labelLower.includes("staria 7")) capacity = 7;
      else if (labelLower.includes("staria 8")) capacity = 8;
      else if (labelLower.includes("staria 10")) capacity = 10;
      else if (labelLower.includes("hiace 11")) capacity = 11;
      else {
        const capacityMatch = vehicle.label.match(/\d+/);
        capacity = capacityMatch ? parseInt(capacityMatch[0]) : 20;
      }

      setMaxPassagers(capacity);
      if (nbrPassager > capacity) setNbrPassager(capacity);

      // Multiplication si Train/Haramain
      const typeLower = selectedType?.toLowerCase() || "";
      const multiplyByPerson = typeLower.includes("train") || typeLower.includes("haramain");
      setTotalPrice(multiplyByPerson ? basePrice * nbrPassager : basePrice);
    } else {
      setTotalPrice(0);
      setUnitPrice(0);
    }
  }, [selectedVehicleId, nbrPassager, selectedType]);

  const handleConfirm = async () => {
    if (!selectedVehicleId) return Toast.show({ text1: t("choix"), type: "info" });
    const vehicleLabel = vehicles.find(v => v.value === selectedVehicleId)?.label;
    const finalLabel = `${selectedTrajetName} (${vehicleLabel})`;

    const recapData = {
      city: cities.find(c => c.value === selectedCity)?.label,
      destination: finalLabel,
      date: moment(startDate).format("DD/MM/YYYY"),
      time: moment(startTime).format("HH:mm"),
      nbrPassager,
      totalPrice,
    };

    if (!token) {
      navigation.navigate("TransfertRecap", { recapData });
      return;
    }

    const canSubmit = await checkBeforeSubmit();
    if (!canSubmit) return;

    try {
      await settings.SetTransfert({
        userid: user?.id,
        ville: recapData.city,
        typevisites: finalLabel,
        date: moment(startDate).format("YYYY-MM-DD"),
        time: moment(startTime).format("HH:mm"),
        nbrpersonne: nbrPassager,
        totalprice: totalPrice,
      }, token);

      navigation.navigate("TransfertRecap", { recapData });
    } catch (err) { Toast.show({ type: "error", text1: t("transfertError") }); }
  };

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>{t("transfert")}</Text>

        <View style={styles.container}>
          {/* VILLE */}
          <Text style={styles.label}>{t("vilDepart")} *</Text>
          <View style={styles.inputWrapper}>
            <RNPickerSelect onValueChange={setSelectedCity} items={cities} value={selectedCity} placeholder={{ label: t("selectCity1"), value: null }} style={pickerSelectStyles} />
          </View>

          {/* MESSAGE ALERTE CONNEXION */}
          {selectedCity && !token && (
            <View style={styles.loginAlert}>
              <Ionicons name="information-circle" size={20} color="#0369a1" />
              <Text style={styles.loginAlertText}>
                Veuillez vous connecter pour suivre les tarifs et continuer votre réservation.
              </Text>
            </View>
          )}

          {selectedCity && (
            <>
              <Text style={styles.label}>Type de service *</Text>
              <View style={styles.inputWrapper}>
                <RNPickerSelect onValueChange={setSelectedType} items={types} value={selectedType} placeholder={{ label: "Choisir un type", value: null }} style={pickerSelectStyles} />
              </View>
            </>
          )}

          {selectedType && (
            <>
              <Text style={styles.label}>Trajet *</Text>
              <View style={styles.inputWrapper}>
                <RNPickerSelect onValueChange={setSelectedTrajetName} items={trajets} value={selectedTrajetName} placeholder={{ label: "Choisir le trajet", value: null }} style={pickerSelectStyles} />
              </View>
            </>
          )}

          {selectedTrajetName && (
            <>
              <Text style={styles.label}>Option de transport *</Text>
              <View style={styles.inputWrapper}>
                <RNPickerSelect onValueChange={setSelectedVehicleId} items={vehicles} value={selectedVehicleId} placeholder={{ label: "Choisir le véhicule", value: null }} style={pickerSelectStyles} />
              </View>
            </>
          )}

          <Text style={styles.label}>Date & Heure *</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => setOpenDate(true)} style={{ width: '48%' }}>
              <TextInput value={moment(startDate).format("DD/MM/YYYY")} mode="outlined" editable={false} style={styles.input} pointerEvents="none" right={<TextInput.Icon icon="calendar" />} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOpenTime(true)} style={{ width: '48%' }}>
              <TextInput value={moment(startTime).format("HH:mm")} mode="outlined" editable={false} style={styles.input} pointerEvents="none" right={<TextInput.Icon icon="clock-outline" />} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t("passengersNumber")} (Max: {maxPassagers}) *</Text>
          <View style={styles.passengerContainer}>
            <TouchableOpacity onPress={() => nbrPassager > 1 && setNbrPassager(nbrPassager - 1)}>
              <Ionicons name="remove-circle" size={45} color={nbrPassager > 1 ? "#000" : "#ccc"} />
            </TouchableOpacity>
            <Text style={styles.passengerText}>{nbrPassager}</Text>
            <TouchableOpacity onPress={() => nbrPassager < maxPassagers && setNbrPassager(nbrPassager + 1)}>
              <Ionicons name="add-circle" size={45} color={nbrPassager < maxPassagers ? "#000" : "#ccc"} />
            </TouchableOpacity>
          </View>

          <View style={styles.totalContainer}>
            <View>
              <Text style={styles.unitPriceText}>
                Prix: {unitPrice} SAR {(selectedType?.toLowerCase().includes("train") || selectedType?.toLowerCase().includes("haramain")) ? "/ pers." : "/ véhicule"}
              </Text>
              <Text style={styles.totalLabel}>💰 Total :</Text>
            </View>
            <Text style={styles.totalValue}>
              {Number(totalPrice || 0).toFixed(2)} SAR
            </Text>
          </View>

          <ButtonComponent title={token ? t("confirmtDate") : "Voir le récapitulatif"} press={handleConfirm} isLoading={false} />
        </View>

        <DatePicker modal open={openDate} date={startDate} mode="date" onConfirm={(d) => { setOpenDate(false); setStartDate(d); }} onCancel={() => setOpenDate(false)} />
        <DatePicker modal open={openTime} date={startTime} mode="time" onConfirm={(t) => { setOpenTime(false); setStartTime(t); }} onCancel={() => setOpenTime(false)} />
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
  backgroundStyle: { flex: 1, backgroundColor: "transparent" },
  container: { paddingHorizontal: 25, paddingVertical: 10 },
  title: { fontSize: 22, fontWeight: "bold", textTransform: "uppercase", textAlign: "center", marginVertical: 20, color: "#000" },
  label: { fontSize: 14, fontWeight: "700", marginTop: 15, color: "#444", marginBottom: 5 },
  inputWrapper: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, backgroundColor: "#f8fafc", height: 50, justifyContent: "center", overflow: 'hidden' },
  input: { backgroundColor: "#f8fafc", height: 50 },
  loginAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0f2fe', padding: 12, borderRadius: 10, marginTop: 15, borderWidth: 1, borderColor: '#bae6fd' },
  loginAlertText: { fontSize: 12, color: '#0369a1', marginLeft: 8, flex: 1, lineHeight: 18 },
  passengerContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 10, backgroundColor: '#f1f5f9', padding: 10, borderRadius: 15 },
  passengerText: { fontSize: 24, fontWeight: "bold", marginHorizontal: 30 },
  totalContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 25, padding: 20, borderRadius: 15, backgroundColor: "#000" },
  unitPriceText: { color: "#94a3b8", fontSize: 12 },
  totalLabel: { fontSize: 18, fontWeight: "600", color: "#fff" },
  totalValue: { fontSize: 22, fontWeight: "bold", color: "#fbbf24" },
});

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: { fontSize: 16, color: "black", paddingHorizontal: 10, paddingRight: 30 },
  inputIOS: { fontSize: 16, color: "black", paddingHorizontal: 10, paddingRight: 30 },
});

export default TransfertGuideScreen;