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
import {
  Text
} from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';

import LinearGradient from 'react-native-linear-gradient';
import StarRating from 'react-native-star-rating';
import { useSelector, useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import { settings } from '../../api';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { COLOR } from '../../helpers/functions';
import { setAddress, setCityR, resetPanel } from "../../redux/actions/Restaurant";

import { useTranslation } from 'react-i18next';

import AsyncStorage from '@react-native-async-storage/async-storage';

moment.locale('fr');
const RestoScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { t } = useTranslation(); // ✅ Hook de traduction

  const dispatch = useDispatch();
  const data = useSelector(({ RestaurantReducer }: any) => RestaurantReducer);
  const token = useSelector(({ userReducer }: any) => userReducer.token);

 const [cities, setCities] = useState([]);
const [selectedCity, setSelectedCity] = useState(null);
const [items, updateItems] = useState([]);
const [isLoading, setIsLoading] = useState<boolean>(true);


 
/// 🔹 Récupère la liste des villes avec cache
useEffect(() => {
  const fetchCities = async () => {
    try {
      const cacheKey = 'cachedCities';

      // 1️⃣ Charger depuis le cache d'abord
      const cachedCities = await AsyncStorage.getItem(cacheKey);
      if (cachedCities) {
        console.log('📦 Villes chargées depuis AsyncStorage');
        setCities(JSON.parse(cachedCities));
      }

      // 2️⃣ Charger depuis API ensuite
      const result = await settings.Cities();

      // Backend renvoie : { status: "success", data: [...] }
      const cityArray = result?.data ?? [];

      if (Array.isArray(cityArray)) {
        const cityOptions = cityArray.map((val) => ({
          label: val?.name,
          value: val?.id,
        }));

        setCities(cityOptions);

        // 💾 Mise à jour du cache
        await AsyncStorage.setItem(cacheKey, JSON.stringify(cityOptions));

        console.log('💾 Villes mises à jour dans AsyncStorage');
      } else {
        console.warn("⚠️ cityArray n'est pas un tableau :", cityArray);
      }

    } catch (err) {
      console.error('❌ Erreur lors du chargement des villes :', err);
    }
  };

  fetchCities();
}, []);


  // 🔹 Récupère la liste des restaurants pour la ville sélectionnée avec cache
useEffect(() => {
  if (!selectedCity) return; // Arrête si aucune ville n'est sélectionnée

  const fetchRestaurants = async () => {
    try {
      const cacheKey = `cachedRestaurants_${selectedCity}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);

      if (cachedData) {
        console.log(`📦 Restaurants de la ville ${selectedCity} chargés depuis AsyncStorage`);
        updateItems(JSON.parse(cachedData));
      } else {
        console.log('🌐 Chargement depuis API...');
        setIsLoading(true);

        const resto = await settings.Restaurants(token, selectedCity);
        const restoData = Array.isArray(resto) ? resto : resto?.data || [];

        updateItems(restoData);

        // 💾 Sauvegarde du cache pour cette ville
        await AsyncStorage.setItem(cacheKey, JSON.stringify(restoData));
        console.log(`💾 Restaurants de la ville ${selectedCity} sauvegardés localement`);
      }
    } catch (err) {
      console.error('❌ Erreur API :', err);
      updateItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  fetchRestaurants();
}, [selectedCity]);

const handleRefresh = async () => {
  if (!selectedCity) {
    console.log("❗ Aucune ville sélectionnée. Rafraîchissement annulé.");
    return;
  }
  try {
    setIsLoading(true);
    const resto = await settings.Restaurants(token, selectedCity);
    const formattedResto = Array.isArray(resto) ? resto : resto?.data || [];
    updateItems(formattedResto);
    console.log("🔄 Rafraîchissement réussi :", formattedResto);
  } catch (err) {
    console.error("❌ Erreur lors du rafraîchissement :", err);
    updateItems([]);
  } finally {
    setIsLoading(false);
  }
};

 
  // Navigation
  const navigatee = (item: any) => {
    if (data?.storeid !== null) {
      Toast.show({
        text1: t("oneRestaurantOnly"),
        type: 'info',
        position: 'top',
      });
    } else {
      dispatch(setAddress(item?.adresse));
      navigation.navigate('RestoStep2', { id: item?.id });
    }
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigatee(item)}>
        {item.logo ? <Image
          style={styles.CardImage}
          resizeMode={'cover'}
          source={{
            uri: item?.logo,
          }}
        /> :
          <Image
            style={styles.CardImage}
            resizeMode={'cover'}
            source={require("../../assets/images/resto.png")}
          />
        }
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={['#D3D3D3', '#000000']}
          style={{ flex: 1, padding: 10 }}>
          <Text style={[styles.Label, { color: "#fff" }]}>{item?.name}</Text>
          <View
            style={{
              width: '70%',
            }}>
            <StarRating
              disabled={true}
              maxStars={5}
              rating={Number(item?.note)}
              fullStarColor={'#FFC107'}
              starSize={20}
            />
          </View>
          <Text style={styles.LabelTime}>{item?.time}</Text>
          <Text style={styles.LabelAddress}>
            {item?.adresse},{item?.ville}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <Text style={styles.LabelText}>{t("chooseCity")} <Text style={{ color: 'red' }}>*</Text>  :</Text>
      <View style={styles.cardInput}>
   <RNPickerSelect
onValueChange={(value) => {
  const selected = cities.find((c) => c.value === value);
  if (selected) {
    setSelectedCity(selected.label);

    // ✅ Enregistre uniquement le nom dans Redux
    dispatch(setCityR(selected.label));

    console.log("🌍 Ville enregistrée :", selected.label);
  } else {
    console.warn("⚠️ Aucune ville trouvée pour la valeur :", value);
  }
}}


  items={cities}
  value={cities.find((c) => c.label === selectedCity)?.value || null}
  placeholder={{ label: t("chooseCity"), value: null }}
  useNativeAndroidPickerStyle={true}
  style={pickerSelectStyles}
/>



      </View>

      <Text style={styles.Title}>{t("chooseRestaurant")}</Text>

    {isLoading && selectedCity ? (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color={COLOR.gris} />
  </View>
) : (
  <FlatList
    data={items}
    renderItem={renderItem}
    keyExtractor={(item: any, index: number) =>
      item?.id ? item.id.toString() : index.toString()
    }
    extraData={items}
    refreshing={isLoading && !!selectedCity} // rafraîchit uniquement si ville sélectionnée
    onRefresh={handleRefresh}
    ListEmptyComponent={
      <View style={styles.ContentContainer}>
        <Text adjustsFontSizeToFit style={styles.ContentStyle}>
          {selectedCity ? t("emptyList") : t("selectCityFirst")}
        </Text>
      </View>
    }
  />
)}

      {data?.storeid !== null && (
        <TouchableOpacity
          onPress={() => dispatch(resetPanel())}
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
          <Text style={[styles.Label, { textAlign: 'center' }]}>
            {t("resetCart")}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  CardImage: {
    width: '40%',
    height: '100%',
  },
  Title: {
     fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginVertical: 25,
    textTransform: 'uppercase',
  }, 
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  LabelText:{
     fontSize: 17,
    fontWeight: '700',
    color: '#2E2E2E',
     marginTop:10,
     textAlign:'center'
     
  },
  buttonStyle: {
    height: 50,
    width: 250,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLOR.arrow,
  },
  Label: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
    textAlign: 'left',
    color: COLOR.arrow,
    marginBottom: 5,
  },
  LabelTime: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
    textAlign: 'left',
    color: '#fff',
    marginVertical: 10,
  },
  LabelAddress: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
    textAlign: 'left',
    color: '#fff',
  },
  ContentContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  ContentStyle: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    paddingVertical: 50,
    paddingBottom: 30,
    textAlign: 'left',
    marginTop: 200,
   
  justifyContent: 'center',
  alignItems: 'center',
 
  },
  container: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 20,
  },
  cardInput: {
     borderWidth: 1,
    width: '80%',
    borderColor: '#C4C4C4',
    borderRadius: 5,
    backgroundColor: '#fff',
    height: 45,
    justifyContent: "center",
    marginTop:10,
    marginLeft:30
  },
  card: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    height: 120,
    margin: 5,
    elevation: 2,
    width:'90%',
    marginLeft:20
  }

});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default RestoScreen;
