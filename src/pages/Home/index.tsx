import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
  Animated,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { useSelector, useDispatch } from 'react-redux';
import { settings } from '../../api';
import { ChangeColor } from '../../redux/actions/Signin';
import { setCity, setGlobalSettings } from '../../redux/actions/babySitting';
import { setCityR, resetPanel } from '../../redux/actions/Restaurant';
import { setCityG } from '../../redux/actions/guide';
import { COLOR } from '../../helpers/functions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowWidth = Dimensions.get('window').width;

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const token = useSelector(({ userReducer }: any) => userReducer?.token);

  const [items, setItems] = useState<any[]>([]);
  const [value, setValue] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const searchInputRef = useRef<TextInput>(null);
const [reviews, setReviews] = useState([]);
const [loadingReviews, setLoadingReviews] = useState(true);

useEffect(() => {
  const loadReviews = async () => {
    try {
      setLoadingReviews(true);

      const cacheKey = "cached_reviews";

      // ✅ 1) Charger depuis AsyncStorage immédiatement
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        setReviews(parsed);
        console.log("📦 Avis chargés depuis le cache :", parsed.length);
        setLoadingReviews(false); // ✅ Les avis s’affichent immédiatement
      }

      // ✅ 2) Charger la version fraîche depuis l’API en arrière-plan
      const res = await settings.AllReviews(token);

      if (res && Array.isArray(res)) {
        setReviews(res);

        // ✅ 3) Mettre à jour le cache
        await AsyncStorage.setItem(cacheKey, JSON.stringify(res));

        console.log("💾 Cache avis mis à jour :", res.length);
      }
    } catch (error) {
      console.log("❌ Erreur chargement avis :", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  if (token) loadReviews();
}, [token]);




   const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: 40,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    dispatch(ChangeColor(COLOR.primary1));
    const fetchData = async () => {
      if (token) {
        const data = await settings.getAllParams(token);
        dispatch(setGlobalSettings(data));
      }
      const data2 = await settings.Cities();
  
      
    };
    fetchData().catch(console.error);

    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        Toast.show({
          text2: "Tu n'as pas d'internet",
          type: 'error',
          position: 'top',
          autoHide: false,
        });
      }
    });
  }, [token]);

  const navigateTo = (
    type: 'Activités' | 'Baby-sitter' | 'Restaurant' | 'Guide touristique' | 'Transferts',
    color: string,
  ) => {
    dispatch(ChangeColor(color));
    if (type === t('babysitting') && value) dispatch(setCity(value));
    else if (type === t('restaurant')) {
      dispatch(resetPanel());
      if (value) dispatch(setCityR(value));
    } else if (type === t('guide') && value) {
      const n = items.find((val) => val.value === value);
      dispatch(setCityG(value, n?.id));
    } else if ((type === t('activité') || type === t('transport')) && value) {
      dispatch(setCity(value));
    }
    navigation.navigate(type);
  };

  const openYouzful = async () => {
    const url = 'https://youz-ful.com/';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else await Linking.openURL(url).catch(() => {
        Alert.alert('Erreur', "Impossible d'ouvrir le lien : " + url);
      });
    } catch (error) {
      Alert.alert('Erreur', "Une erreur est survenue lors de l'ouverture du lien.");
    }
  };

  
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        <View  style={styles.titleContainer}>
          <Text style={styles.title}>{t('makeRequest')}</Text>
          <Animated.View
        style={[styles.underline, { width: widthAnim }]}
      />
        </View>
        

        {/* Catégories principales */}
        <View style={styles.categoryContainer}>
          <View style={styles.row}>
            <CategoryIcon
              label={t('activité')}
              icon={require('../../assets/images/activites.png')}
              onPress={() => navigateTo(t('activité'), COLOR.arrow)}
            />
            <CategoryIcon
              label={t('guide')}
              icon={require('../../assets/images/guide-touristique.png')}
              onPress={() => navigateTo(t('guide'), COLOR.arrow)}
            />
            <CategoryIcon
              label={t('transport')}
              icon={require('../../assets/images/voiture.png')}
              onPress={() => navigateTo(t('transport'), COLOR.arrow)}
            />
          </View>

          <View style={styles.row}>
            <CategoryIcon
              label={t('babysitting')}
              icon={require('../../assets/images/mere.png')}
              onPress={() => navigateTo(t('babysitting'), COLOR.arrow)}
            />
            <CategoryIcon
              label={t('restaurant')}
              icon={require('../../assets/images/batiment-de-restauration.png')}
              onPress={() => navigateTo(t('restaurant'), COLOR.arrow)}
            />
          </View>
        </View> 

        {/* Catégories populaires */}
        <Text style={styles.sectionTitle}>{t('categories')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <PopularCategory label={t('babysitting')} icon={require('../../assets/images/mere.png')} onPress={() => navigateTo(t('babysitting'), COLOR.arrow)} />
          <PopularCategory label={t('restaurant')} icon={require('../../assets/images/batiment-de-restauration.png')} onPress={() => navigateTo(t('restaurant'), COLOR.arrow)} />
          <PopularCategory label={t('transport')} icon={require('../../assets/images/voiture.png')} onPress={() => navigateTo(t('transport'), COLOR.arrow)} />
        </ScrollView>

        {/* Barre de recherche */}
        <Text style={styles.sectionTitle}>{t('services')}</Text>
        <View style={styles.inputWrapper}>
          <TextInput placeholder={t('search')} ref={searchInputRef} placeholderTextColor="#94a3b8" />
          <Ionicons name="search-outline" size={20} color="#64748b" style={styles.icon} />
        </View>

        {/* Services proposés */}
        <Text style={styles.sectionService}>{t('searchServices')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ServiceCard
            title={t('guideService')}
            price={t('apartir') + ' 100 €'}
            image={require('../../assets/images/medina.png')}
            onImagePress={() => navigateTo(t('guide'), COLOR.arrow)}
          />
          <ServiceCard
            title={t('alula')}
            price="520€"
            image={require('../../assets/images/alul.png')}
            onImagePress={openYouzful}
          />
          <ServiceCard
            title={t('babyService')}
            
            image={require('../../assets/images/baby-siter.webp')}
            onImagePress={() => navigateTo(t('babysitting'), COLOR.arrow)}
          />
          <ServiceCard
            title={t('restoService')}
            
            image={require('../../assets/images/Restaurantt.png')}
            onImagePress={() => navigateTo(t('restaurant'), COLOR.arrow)}
          />
        </ScrollView>

        {/* Avis clients */}
       <Text style={styles.sectionTitle}>{t('reviews')}</Text>

{/* ✅ Loader pendant chargement des avis */}
{loadingReviews ? (
  <View style={styles.reviewLoader}>
    <Ionicons name="refresh-circle" size={48} color="#1e3a8a" />
    <Text style={styles.loaderText}>{t('loading') || "Chargement..."}</Text>
  </View>
) : reviews.length === 0 ? (
  <Text style={styles.noReviewsText}>{t('noReviews') || "Aucun avis disponible"}</Text>
) : (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    {reviews.map((review, index) => (
      <View key={index} style={styles.reviewCard}>
        <View style={styles.userRatingRow}>
          <Text style={styles.reviewUser}>
            {review.firstname} {review.lastname}
          </Text>

          <Text style={styles.reviewRating}>
            {'⭐'.repeat(review.note || 0)}
          </Text>
        </View>

        <Text style={styles.reviewComment}>{review.avis}</Text>
      </View>
    ))}
  </ScrollView>
)}


      </ScrollView>

      {/* Modal image */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Image source={modalImage} style={styles.modalImage} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

// 🔹 Composants enfants modernisés
const CategoryIcon = ({ label, icon, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.categoryCard}>
    <View style={styles.categoryIconWrapper}>
      <Image source={icon} style={styles.categoryIcon} />
    </View>
    <Text style={styles.categoryLabel}>{label}</Text>
  </TouchableOpacity>
);

const PopularCategory = ({ label, icon, onPress }) => (
  <TouchableOpacity style={styles.popularCategoryItem} onPress={onPress}>
    <View style={styles.categoryIconWrapperCateg}>
      <Image source={icon} style={styles.categoryIconPopulaire} />
    </View>
    <Text style={styles.categoryLabelPopulaire}>{label}</Text>
  </TouchableOpacity>
);

const ServiceCard = ({ title, price, image, onImagePress }) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity onPress={() => onImagePress(image)} style={styles.serviceCard}>
      <Image source={image} style={styles.serviceImage} />
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={{ fontWeight: 'bold', color: '#1e293b', fontSize: 15 }}>
         {price} 
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  reviewLoader: {
  alignSelf: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 20,
  width: '100%',
},

loaderText: {
  marginTop: 8,
  fontSize: 14,
  fontWeight: '600',
  color: '#1e3a8a',
},

noReviewsText: {
  fontSize: 14,
  color: '#64748b',
  fontStyle: 'italic',
  textAlign: 'center',
  marginBottom: 10,
},

  container: { flex: 1, backgroundColor: 'transparent', padding: 15 },
  titleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    letterSpacing: 0.5,
    
     marginTop:-10
  },
  underline: {
    height: 3,
    backgroundColor: '#1e40af',
    borderRadius: 2,
    marginTop: 6,
  },
    sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginVertical: 15 },
  sectionService: { fontSize: 20, fontWeight: '700', color: '#000', marginVertical: 10 },

  // Barre de recherche (glass)
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 45,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: { position: 'absolute', right: 15, top: '50%', transform: [{ translateY: -10 }] },

  // Catégories
  categoryContainer: { alignItems: 'center', justifyContent: 'center'},
  row: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingVertical: 5,
    marginHorizontal: 10,
    width: 95,
   
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryIconWrapper: { backgroundColor: '#E0E0E0', borderRadius: 50, padding: 12, marginBottom: 8 },
  categoryIcon: { width: 30, height: 30 },
  categoryLabel: { fontSize: 13, color: '#1e293b', textAlign: 'center', fontWeight: '600' },

  // Catégories populaires
  popularCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderColor: '#e5e7eb',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom:2
  },
  categoryIconWrapperCateg: { backgroundColor: '#E0E0E0', borderRadius: 50, padding: 8, marginRight: 8 },
  categoryIconPopulaire: { width: 30, height: 30 },
  categoryLabelPopulaire: { fontSize: 15, fontWeight: '600', color: '#000' },

  // Services
 serviceCard: {
  width: 160,
  backgroundColor: '#F0F0F0',
  borderRadius: 16,
  padding: 12,
  marginRight: 18,
    shadowOpacity: 0.1,  
    shadowRadius: 3,
    elevation: 3,
    marginBottom:10,
  

  // Optionnel pour un contour plus précis
  borderWidth: 0.5,
  borderColor: '#e2e8f0',
},


  serviceImage: { width: '100%', height: 130, borderRadius: 12 },
  serviceTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginTop: 8 },

  // Avis
  reviewCard: {
    backgroundColor: '#F0F0F0',
    padding: 15, 
    borderRadius: 12,
    marginRight: 12,
    width: 220,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userRatingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewUser: { fontWeight: 'bold', color: '#1e40af' },
  reviewRating: { color: '#fbbf24', fontSize: 16 },
  reviewComment: { color: '#334155', fontSize: 14 },

  // Modal
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '90%', height: '75%', borderRadius: 12 },
});

export default HomeScreen;
