import React, { useEffect } from 'react';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  FlatList
} from 'react-native';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import {
  Text,
  ActivityIndicator,
  Divider,
  Button,
  TextInput,
} from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { COLOR } from '../../helpers/functions';
import { setDateInfo, updateQnt } from '../../redux/actions/Restaurant';
import { settings } from '../../api';
import Minus from '../../assets/icons/MinusGreen.svg';
import Plus from '../../assets/icons/PlusGreen.svg';
import Arrow from '../../assets/icons/ArrowGreen.svg';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';



moment.locale('fr');
const RestoStep3: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation(); 

  const { item, id } = route.params;
  const dispatch = useDispatch();
  const data = useSelector(({ RestaurantReducer }: any) => RestaurantReducer);
  const [isLoading, setIsLoading] = React.useState(false);
  const [added, setIsAdded] = React.useState(false);
  const [price, setPrice] = React.useState<any>(item?.price);
  const [qte, updateQte] = React.useState(1);

  
  function navigatee() {
    dispatch(
      setDateInfo(id, {
        id: item?.id,
        name: item?.name,
        qte: qte,
        price: Number(price),
        img: item.urlpic,
      }),
    );
    setIsAdded(true);
  }
 useEffect(() => {
  const checkIfItemAdded = async () => {
    try {
      // 1️⃣ Récupère le cache du panier s’il existe
      const cachedPlats = await AsyncStorage.getItem('cachedPlats');
      let platsData = data?.plats;

      if (cachedPlats) {
        console.log("📦 Plats chargés depuis AsyncStorage");
        platsData = JSON.parse(cachedPlats);
      }

      // 2️⃣ Vérifie si le plat courant est déjà ajouté
      const addedItem = platsData?.find((val: any) => val.id === item.id);
      if (addedItem) {
        updateQte(addedItem.qte);
        setPrice(Number(addedItem.price));
        setIsAdded(true);
        console.log(`✅ ${item.name} déjà présent dans le panier`);
      } else {
        setIsAdded(false);
      }
    } catch (err) {
      console.error("❌ Erreur lors du chargement des plats :", err);
    }
  };

  checkIfItemAdded();
}, []);

  function MinusF() {
    if (qte > 1) {
      let tmp = qte - 1;
      setPrice(Number(item?.price) * tmp);
      if (added) {
        dispatch(updateQnt(tmp, item?.id, Number(item?.price) * tmp));
      }
      updateQte(tmp);
    }
  }
  async function PlusF() {
    let tmp = qte + 1;
    setPrice(Number(item?.price) * tmp);
    if (added) {
      dispatch(updateQnt(tmp, item?.id, Number(item?.price) * tmp));
    }
    updateQte(tmp);
  }
 
  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 40
      }}>
        <ActivityIndicator size="large" color="#444" />
        <Text style={{ marginTop: 8, color: "#444" }}>{t("loading")}</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <ScrollView
        style={{
          backgroundColor: Colors.white,
          flex: 1,
        }}
        contentInsetAdjustmentBehavior="automatic">
        <View
          style={{
            backgroundColor: Colors.white,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
          }}>
          <Text style={styles.Title}>{item?.name}</Text>
          <View style={styles.ContentContainer}>
            {item.urlpic ? (
              <Image
                style={styles.CardImage}
                resizeMode={'cover'}
                source={{
                  uri:
                    item?.urlpic ||
                    'https://i.pinimg.com/originals/a8/d1/9b/a8d19bfb6d5172adc87d65908c69137a.jpg',
                }}
              />
            ) : (
              <Image
                style={styles.CardImage}
                resizeMode={'cover'}
                source={require('../../assets/images/plate.jpeg')}
              />
            )}
            <View style={[styles.inputContainer, { paddingTop: 15 }]}>
              <Text style={styles.Label}>{item?.ingrediants}</Text>
            </View>

            <View style={[styles.inputContainer, { paddingTop: 15 }]}>
              <Text style={styles.LabelText}>{t("desiredQuantity")} : </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '55%',
              }}>
              <TouchableOpacity onPress={() => MinusF()}>
                <Icon name="minus" size={40} color="black" />
              </TouchableOpacity>
              <TextInput
                placeholder=""
                value={qte.toString()}
                onChangeText={text => updateQte(Number(text))}
                keyboardType="numeric"
                disabled
                mode="outlined"
                style={{
                  width: '20%',
                  height: 40,
                  paddingLeft: 5,
                  backgroundColor: Colors.white,
                  color: COLOR.primary3,
                }}
                activeOutlineColor={COLOR.primary3}
              />
              <TouchableOpacity onPress={() => PlusF()}>
                <Icon name="plus" size={40} color="black" />
              </TouchableOpacity>
            </View>
            <Divider style={styles.divider} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '90%',
              }}>
              <Text style={styles.Title2}>{t("price")} : </Text>
              <Text style={styles.Title2}>{price} € / TTC</Text>
            </View>
          </View>
          {added ? (
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                color={COLOR.blanc}
                style={styles.buttonStyle}
                onPress={() => navigation.goBack()}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                {t("consultOthers")}
                </Text>
              </Button>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                style={styles.buttonStyle}
                onPress={() => navigatee()}>
                 {t("addToCart")}
              </Button>
            </View>
          )}
          {data?.plats?.length > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Panier')}
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 15,
              }}>
              <Text style={[styles.Label, { textAlign: 'center' }]}>
                 {t("viewCart")}
              </Text>
              <FontAwesome name="arrow-right" size={20} color="#000" />



            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  CardImage: {
    width: 300,
    height: 160,
    borderRadius: 10,
  },
  divider: {
    backgroundColor: COLOR.arrow,
    marginVertical: 10,
    paddingVertical: 1,
    width: '85%',
    opacity: 1,
  },
  Title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#000',
    textTransform: 'uppercase',
      marginTop:10,
    textAlign: 'center',
  }, 
  Title2: {
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: COLOR.arrow,
    marginTop:-15
  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 20,
    marginTop:-15
  },
 buttonStyle: {
    height: 40,
    width: 240,
    backgroundColor: '#000000',
    borderRadius: 12,  
    justifyContent: 'center',
    alignItems: 'center', color: '#fff'
  },
  Label: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 15,
    textAlign: 'left',
    color: '#2E2E2E',
    paddingRight:10
  },
   LabelText:{
     fontSize: 14,
    fontWeight: '700',
    color: '#2E2E2E',
    marginBottom: 10,
    marginTop:-10
   
  },
  ContentContainer: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
    //   height: 300,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: '10%',
  },
});

export default RestoStep3;
