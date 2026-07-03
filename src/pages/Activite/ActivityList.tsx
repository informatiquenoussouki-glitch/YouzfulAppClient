import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { GetActivitiesByDestination } from "../../api/settings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "i18next";

export default function ActivityListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { destination_id } = route.params as any;

  const token = useSelector(({ userReducer }: any) => userReducer.token);

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 👈 reload state

  // CHARGEMENT PRINCIPAL + CACHE
  const loadActivities = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true); // 👈 loader seulement au premier chargement

    const cacheKey = `cachedActivities_${destination_id}`;

    try {
      // ⚡ 1) Charger depuis cache
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached && !isRefresh) {
        setActivities(JSON.parse(cached));
        setLoading(false);
      }

      // 🚀 2) API EN ARRIÈRE-PLAN
      const res = await GetActivitiesByDestination(token, destination_id);

      if (res?.status === "success") {
        setActivities(res.activities);
        await AsyncStorage.setItem(cacheKey, JSON.stringify(res.activities));
      }
    } catch (err) {
      console.log("❌ Erreur chargement activités :", err);
    } finally {
      setLoading(false);
      setRefreshing(false); // 👈 stop refresh
    }
  };

  useEffect(() => {
    loadActivities();
  }, [destination_id]);

  // 🔄 Fonction reload manuelle
  const onRefresh = () => {
    setRefreshing(true);
    loadActivities(true); // 👈 reload = chargement complet
  };

  const handlePress = (item: any) => {
    navigation.navigate("ActivityDetail", { activity: { ...item } });
  };

  const getFullImageUrl = (path: string | null) => {
    if (!path) return "https://admin.youz-ful.com/default.jpg";
    if (path.startsWith("http")) return path;
    return `https://admin.youz-ful.com/${path.replace(/^\/+/, "")}`;
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1da3c6" />
        <Text style={{ marginTop: 10, color: "#555" }}>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1da3c6"]} />
      }
    >
      {activities.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => handlePress(item)}
        >
          <Image
            source={{ uri: getFullImageUrl(item.image) }}
            style={styles.image}
          />

          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>

            {item.price ? (
              <Text style={styles.price}>USD {item.price}</Text>
            ) : null}

            {item.address ? (
              <Text style={styles.address}>📍 {item.address}</Text>
            ) : null}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent", padding: 16 },
  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 18,
    overflow: "hidden",
    elevation: 3,
  },
  image: { width: "100%", height: 180 },
  info: { padding: 12 },
  name: { fontSize: 18, fontWeight: "600", color: "#222" },
  price: { color: "#1da3c6", marginTop: 6, fontWeight: "500" },
  address: { marginTop: 4, color: "#777", fontSize: 14 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 70 },
});
