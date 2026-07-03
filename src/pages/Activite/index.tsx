import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { GetDestinations, GetPays } from "../../api/settings";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ActiviteScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const searchInputRef = useRef<TextInput>(null);
  const token = useSelector(({ userReducer }: any) => userReducer.token);

  const [countries, setCountries] = useState<any[]>([]);
  const [activeCountry, setActiveCountry] = useState<string>("");
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true); // 👈 nouveau


  // ✅ Charger les pays dès le démarrage
  useEffect(() => {  
  const loadPays = async () => {
    setLoading(true);

    try {
      // 👇 Charger d'abord depuis le cache
      const cachedCountries = await AsyncStorage.getItem("cachedPays");
      if (cachedCountries) {
        const paysList = JSON.parse(cachedCountries);
        setCountries(paysList);

        if (paysList.length > 0) {
          const first = paysList[0].name;
          setActiveCountry(first);
          fetchDestinations(first);  // ⚡ chargement immédiat
        }

        setLoading(false); // 👈 ne pas bloquer le rendu
      }

      // 👇 API en arrière-plan (sans bloquer l'affichage)
      const res = await GetPays(token);
      if (res?.status === "success") {
        const fresh = res.pays || [];

        setCountries(fresh);
        await AsyncStorage.setItem("cachedPays", JSON.stringify(fresh));

        if (!cachedCountries && fresh.length > 0) {
          const first = fresh[0].name;
          setActiveCountry(first);
          fetchDestinations(first);
        }
      }
    } catch (err) {
      console.log("Erreur GetPays :", err);
    }
  };

  loadPays();
}, [token]);


  // ✅ Charger les destinations selon le pays sélectionné
  const fetchDestinations = async (country) => {
  setLoading(true);
  const cacheKey = `cachedDestinations_${country}`;

  try {
    // ⚡ Charger le cache
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      setDestinations(JSON.parse(cached));
      setLoading(false); // 👈 affichage immédiat
    }

    // 👇 API en arrière-plan
    const res = await GetDestinations(token);

    if (res?.status === "success") {
      const all = res.destinations || res.data || [];
      const filtered = all.filter(
        (i) => i.country?.toLowerCase() === country.toLowerCase()
      );

      setDestinations(filtered);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(filtered));
    }
  } catch (err) {
    console.log("Erreur destinations :", err);
  } finally {
    // Si on avait du cache on n'affiche plus de loader
    setLoading(false);
  }
};


  const handleCountrySelect = (countryName: string) => {
    console.log(`🖱️ Pays sélectionné : ${countryName}`);
    setActiveCountry(countryName);
    fetchDestinations(countryName);
  };

  const handleImagePress = (item: any) => {
    navigation.navigate("ActivityList", {
      destination_id: item.id,
      name: item.name,
    });
  };

  const getFullImageUrl = (path: string) => {
    if (!path) return "https://admin.youz-ful.com/default.jpg";
    if (path.startsWith("http")) return path;
    return `https://admin.youz-ful.com/${path.replace(/^\/+/, "")}`;
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#555" />
        <Text style={{ marginTop: 10, color: "#555" }}>{t("loading")}</Text>
      </View>
    );
  }   

  return (
    <ScrollView style={styles.container}>
      {/* 🔍 Barre de recherche */}
      <ImageBackground
        source={require("../../assets/images/ballon.png")}
        style={styles.background}
        imageStyle={{ opacity: 0.9 }}
      >
        <View style={styles.overlay}>
          <View style={styles.inputWrapper}>
            <Ionicons name="search-outline" size={22} color="#8c8c8c" />
            <TextInput
              style={styles.input}
              placeholder={t("search")}
              placeholderTextColor="#8c8c8c"
              ref={searchInputRef}
            />
          </View>
        </View>
      </ImageBackground>

      {/* 🌍 Liste dynamique des pays */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        {countries.map((country, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={() => handleCountrySelect(country.name)}
          >
            <Text
              style={[
                styles.tabText,
                activeCountry === country.name && styles.activeTabText,
              ]}
            >
              {country.name}
            </Text>
            {activeCountry === country.name && (
              <View style={styles.activeLine} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 🧭 Liste des destinations */}
      <View style={styles.content}>
        {destinations.length > 0 ? (
          <View style={styles.grid}>
            {destinations.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() => handleImagePress(item)}
              >
                <ImageBackground
                  source={{ uri: getFullImageUrl(item.image) }}
                  style={styles.image}
                  imageStyle={{ borderRadius: 10 }}
                >
                  <View style={styles.overlayText}>
                    <Text style={styles.imageText}>{item.name}</Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.dataText}>{t("aucpays")}</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default ActiviteScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  background: { width: "100%", height: 150, justifyContent: "center" },
  overlay: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e1e5eb",
    paddingHorizontal: 14,
    height: 52,
    elevation: 3,
  },
  input: { flex: 1, fontSize: 16, color: "#222", marginLeft: 10 },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  tab: { marginHorizontal: 16, alignItems: "center" },
  tabText: { fontSize: 16, color: "#000", fontWeight: "500" },
  activeTabText: { color: "#1da3c6", fontWeight: "700" },
  activeLine: { marginTop: 4, width: "100%", height: 3, backgroundColor: "#1da3c6" },
  content: { marginTop: 20, paddingHorizontal: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: { width: "48%", marginBottom: 14 },
  image: { width: "100%", height: 160, justifyContent: "center" },
  overlayText: {
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageText: { color: "#fff", fontSize: 18, fontWeight: "600", textAlign: "center" },
  dataText: { fontSize: 16, color: "#555", textAlign: "center", marginTop: 20 },
});
