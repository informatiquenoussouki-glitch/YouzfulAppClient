import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  View,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import { Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { settings } from '../../api';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { COLOR } from '../../helpers/functions';
import CART from '../../assets/icons/addedCart.svg';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';

moment.locale('fr');

const RestoStep2: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {

  const { t } = useTranslation();
  const { id } = route.params;

  const token = useSelector(({ userReducer }: any) => userReducer.token);
  const data = useSelector(({ RestaurantReducer }: any) => RestaurantReducer);

  const [isLoading, setIsLoading] = useState(true);
  const [items, updateItems] = useState<any[]>([]);

  const CACHE_KEY = `resto_menu_${id}`;

  /** ---------------------------------------------------
   * ⚡ 1) Charger immédiatement depuis le cache
   * --------------------------------------------------*/
  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);

      if (cached) {
        const parsed = JSON.parse(cached);
        updateItems(parsed);
        setIsLoading(false); // ➜ Affichage instantané
        console.log("⚡ Cache chargé :", parsed.length);
      }
    } catch (e) {
      console.log("❌ Erreur chargement cache :", e);
    }
  };

  /** ---------------------------------------------------
   * 🌐 2) Charger depuis API en arrière-plan
   * --------------------------------------------------*/
  const fetchDataFromAPI = async () => {
    try {
      const resto = await settings.RestaurantById(token, id);

      if (Array.isArray(resto)) {
        updateItems(resto);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(resto));

        console.log("🟢 API chargée & cache mis à jour :", resto.length);
      } else {
        console.log("⚠️ Format API inattendu :", resto);
      }
    } catch (err) {
      console.log("❌ Erreur API :", err);
    }
  };

  /** ---------------------------------------------------
   * 🚀 3) useEffect optimisé
   * --------------------------------------------------*/
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      await loadCachedData();   // ⚡ Affichage immédiat
      fetchDataFromAPI();       // 🌐 API ensuite (non bloquant)
    };

    init();
  }, []);

  /** ---------------------------------------------------
   * 🎨 Render plat
   * --------------------------------------------------*/
  const renderItem = ({ item }: any) => {
    let addedItem = data?.plats.find((val: any) => val.id === item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('RestoStep3', { item, id })}
      >
        <Image
          style={styles.CardImage}
          resizeMode="cover"
          source={
            item.urlpic
              ? { uri: item.urlpic }
              : require("../../assets/images/plate.jpeg")
          }
        />

        <View style={{ flex: 1, padding: 10 }}>
          <Text style={styles.Label}>{item?.name}</Text>
          <Text style={styles.LabelAddress}>{item?.ingrediants}</Text>

          <Text style={styles.LabelAddress1}>⏱️ {t("livraison")}{item?.time_delevery ? item.time_delevery : t("delivery_standard")}</Text>

          

          <View style={styles.priceRow}>
            {addedItem ? <CART width={20} height={20} fill="#000" /> : <View />}
            <Text style={styles.LabelTime}>
              {t("price1", { value: item?.price })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };



  /** ---------------------------------------------------
   * 🎬 Render final
   * --------------------------------------------------*/
  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <Text style={styles.Title}>{t("whichDish")}</Text>

      <View style={styles.container}>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          extraData={items}
          refreshing={false}
          onRefresh={fetchDataFromAPI}
          ListEmptyComponent={
            <View style={styles.ContentContainer}>
              <Text style={styles.ContentStyle}>{t("noRestaurant")}</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

/* ---------------------------------------------------
 * 🎨 Styles
 * --------------------------------------------------*/
const styles = StyleSheet.create({
  backgroundStyle: { backgroundColor: 'transparent', flex: 1 },
  CardImage: { width: '40%', height: '100%' },
  Title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#000',
    textTransform: 'uppercase',
    marginTop: 10,
    textAlign: 'center',
  },
  Label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 5,
  },
  LabelTime: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    LabelAddress1: { fontSize: 11, fontWeight: '700', color: '#000',  marginTop:20},

  LabelAddress: { fontSize: 11, fontWeight: '700', color: '#000' },
  ContentContainer: { alignItems: 'center', paddingVertical: 20 },
  ContentStyle: { fontSize: 16, fontWeight: '400', paddingVertical: 40 },
  container: { flex: 1, paddingTop: 25, paddingHorizontal: 20 },
  card: { backgroundColor: '#fff', flexDirection: 'row', margin: 5, elevation: 2 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10
  },
});

export default RestoStep2;
