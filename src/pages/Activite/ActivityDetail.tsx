import React, { useState, useEffect, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { GetPackagesByActivity } from "../../api/settings";
import { t } from "i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ActivityDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { activity } = route.params as any;

  // 1. Nettoyage et vérification des coordonnées
  const lat = useMemo(() => {
    const v = activity?.latitude;
    return v ? parseFloat(String(v).replace(/[^0-9.\-]/g, "")) : null;
  }, [activity?.latitude]);

  const lng = useMemo(() => {
    const v = activity?.longitude;
    return v ? parseFloat(String(v).replace(/[^0-9.\-]/g, "")) : null;
  }, [activity?.longitude]);

  const hasValidLocation = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) && lat !== 0;

  // 2. Génération d'une URL de carte statique (plus fiable qu'une WebView)
  // Note: Si vous n'avez pas de clé Google, ceci utilise une alternative gratuite
  const staticMapUrl = `https://static-maps.yandex.ru/1.x/?lang=en_US&ll=${lng},${lat}&z=14&l=map&pt=${lng},${lat},pm2rdl`;

  const token = useSelector(({ userReducer }: any) => userReducer.token);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const [selectedDurations, setSelectedDurations] = useState<{ [key: number]: number }>({});

  // 30 min → "30 min", 60 → "1 heure", 90 → "1h30" ...
  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return h === 1 ? "1 heure" : `${h} heures`;
    return `${h}h${m}`;
  };

  // Multiples de la durée de base du package (ex: base 30 min -> 30,60,90,120,150,180)
  const getDurationOptions = (baseDuration: number) => {
    const steps = 6;
    const options = [];
    for (let i = 1; i <= steps; i++) options.push(baseDuration * i);
    return options;
  };

  // Prix pour la durée choisie : prix exact de la table si durée de base, sinon calcul proportionnel
  const computePackagePrice = (item: any, duration: number) => {
    const baseDuration = Number(item.duration) || 30;
    const basePrice = Number(item.price) || 0;
    if (duration === baseDuration) return basePrice;
    return Math.round(basePrice * (duration / baseDuration) * 100) / 100;
  };

  useEffect(() => {
    let isMounted = true;
    const fetchPackages = async () => {
      if (!activity?.id) return;
      const cacheKey = `cachedPackages_${activity.id}`;
      try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached && isMounted) {
          setPackages(JSON.parse(cached));
          setLoading(false);
        }
        const res = await GetPackagesByActivity(token, activity.id);
        if (res?.status === "success" && isMounted) {
          setPackages(res.packages || []);
          await AsyncStorage.setItem(cacheKey, JSON.stringify(res.packages));
        }
      } catch (err) {
        console.error("❌ Erreur API:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPackages();
    return () => { isMounted = false; };
  }, [activity?.id]);

  const getFullImageUrl = (path: string | null) => {
    if (!path) return "https://admin.youz-ful.com/default.jpg";
    return path.startsWith("http") ? path : `https://admin.youz-ful.com/${path.replace(/^\/+/, "")}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🖼️ Image Header */}
      <Image 
        source={{ uri: getFullImageUrl(activity?.image) }} 
        style={styles.image} 
      />

      <View style={styles.info}>
        <Text style={styles.title}>{activity.name || "Activité"}</Text>
        {activity?.price && <Text style={styles.price}>USD {activity.price}</Text>}

        {/* 🗺️ Carte (Remplacée par une Image Statique pour éviter le rectangle vide) */}
        {hasValidLocation ? (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.mapContainer}
            onPress={() => navigation.navigate("MapScreen", {
              location: { latitude: lat, longitude: lng, name: activity.name }
            })}
          >
            <Image 
              source={{ uri: staticMapUrl }} 
              style={styles.mapStatic}
              resizeMode="cover"
            />
            <View style={styles.mapTag}>
              <Text style={styles.mapTagText}>📍 {t("Voir sur la carte")}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.mapPlaceholder}>
             <Text style={styles.noMap}>Localisation non disponible</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.text}>{activity?.description || "Aucune description disponible"}</Text>

        <Text style={styles.sectionTitle}>Packages</Text>
        {loading && packages.length === 0 ? (
          <ActivityIndicator color="#1da3c6" />
        ) : (
          packages.map((item) => {
            const baseDuration = Number(item.duration) || 30;
            const currentDuration = selectedDurations[item.id] || baseDuration;
            const currentPrice = computePackagePrice(item, currentDuration);
            const durationOptions = getDurationOptions(baseDuration);

            return (
              <View key={item.id} style={styles.packageCard}>
                <View style={styles.packageHeader}>
                  <Text style={styles.packageName}>{item.name}</Text>
                  <Text style={styles.packagePrice}>USD {currentPrice.toFixed(2)}</Text>
                </View>

                {expanded[item.id] && <Text style={styles.packageDetails}>{item.description}</Text>}

                <Text style={styles.durationLabel}>{t("Durée") || "Durée"}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.durationRow}>
                  {durationOptions.map((duration) => {
                    const isSelected = duration === currentDuration;
                    const price = computePackagePrice(item, duration);
                    return (
                      <TouchableOpacity
                        key={duration}
                        style={[styles.durationChip, isSelected && styles.durationChipSelected]}
                        onPress={() => setSelectedDurations(p => ({ ...p, [item.id]: duration }))}
                      >
                        <Text style={[styles.durationChipText, isSelected && styles.durationChipTextSelected]}>
                          {formatDuration(duration)}
                        </Text>
                        <Text style={[styles.durationChipPrice, isSelected && styles.durationChipTextSelected]}>
                          USD {price.toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <View style={styles.packageFooter}>
                  <TouchableOpacity onPress={() => setExpanded(p => ({...p, [item.id]: !p[item.id]}))}>
                    <Text style={styles.moreText}>{expanded[item.id] ? "Fermer" : "Voir détails"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.selectBtn}
                    onPress={() => navigation.navigate("CalendarScreen", {
                      packageData: { ...item, price: currentPrice, duration: currentDuration },
                    })}
                  >
                    <Text style={styles.selectBtnText}>Sélectionner</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  image: { width: "100%", height: 250 },
  info: { padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#000" },
  price: { color: "#1da3c6", fontSize: 18, fontWeight: "700", marginVertical: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#000" },
  text: { fontSize: 14, color: "#666", lineHeight: 22 },
  
  // Styles de la Carte Statique
  mapContainer: {
    width: "100%",
    height: 180,
    borderRadius: 15,
    marginTop: 10,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    elevation: 2,
  },
  mapStatic: { width: "100%", height: "100%" },
  mapTag: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingPx: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  mapTagText: { fontSize: 12, fontWeight: "bold", color: "#1da3c6" },
  mapPlaceholder: { height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 10 },
  noMap: { color: "#999", fontStyle: 'italic' },

  // Packages
  packageCard: { backgroundColor: "#ffffff", borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: "#eee" },
  packageHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  packageName: { fontSize: 16, fontWeight: "600", flex: 1 },
  packagePrice: { color: "#1da3c6", fontWeight: "bold" },
  packageDetails: { fontSize: 13, color: "#777", marginBottom: 10 },
  durationLabel: { fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 6 },
  durationRow: { marginBottom: 10 },
  durationChip: {
    borderWidth: 1,
    borderColor: "#1da3c6",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    alignItems: "center",
  },
  durationChipSelected: { backgroundColor: "#1da3c6" },
  durationChipText: { fontSize: 13, fontWeight: "600", color: "#1da3c6" },
  durationChipPrice: { fontSize: 11, color: "#1da3c6", marginTop: 2 },
  durationChipTextSelected: { color: "#fff" },
  packageFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moreText: { color: "#1da3c6", fontWeight: "600" },
  selectBtn: { backgroundColor: "#d64e41", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  selectBtnText: { color: "#ffffff", fontWeight: "bold" }
});
