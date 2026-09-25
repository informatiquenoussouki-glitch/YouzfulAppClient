import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import DatePicker from 'react-native-date-picker';
import { CreditCardInput, CardView } from 'react-native-credit-card-input-plus';
import { useDispatch, useSelector } from 'react-redux';
import {
  Text,
  ActivityIndicator,
  Divider,
  Button,
  Modal,
  TextInput
} from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { COLOR } from '../../helpers/functions';
import { settings } from '../../api';
import Trash from '../../assets/icons/trash.svg';
import { updatePrice, deleteprod, resetPanel } from "../../redux/actions/Restaurant"
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useTranslation } from 'react-i18next';
import { ButtonComponent } from '../../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useUnpaidCheck } from '../../hooks/useUnpaidCheck';
import UnpaidMissionModal from '../../components/UnpaidMissionModal';

import AsyncStorage from '@react-native-async-storage/async-storage';


const windowWidth = Dimensions.get('window').width;
const windowH = Dimensions.get('window').height;

moment.locale('fr');
const Panier: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { t } = useTranslation(); 
   
  const dispatch = useDispatch();
  const token = useSelector(({ userReducer }: any) => userReducer.token); 
  const user = useSelector(({ userReducer }: any) => userReducer.user);
  const data = useSelector(({ RestaurantReducer }: any) => RestaurantReducer);
  const CardDetails = useSelector(({ userReducer }: any) => userReducer.card);
  const { unpaidMission, checkBeforeSubmit, clearUnpaid } = useUnpaidCheck();
  const [isLoading, setIsLoading] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [info, setInfo] = React.useState("");
  const [adress, setAddress] = React.useState("");
  const [card, setCard] = React.useState({
    card_number: '',
    cvc: '',
    exp_month: '',
    exp_year: '',
  });
  const [useOtherCard, UpdateuseOtherCard] = React.useState(false);
  const [loadingValidation, setLoadingValidation] = useState(false);
  const [resDate, setResDate] = useState(new Date());
  const [resTime, setResTime] = useState(new Date());
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);

  const [cartError, setcartError] = useState({
    cvc: 'incomplete',
    expiry: 'incomplete',
    number: 'incomplete',
  });

  function navigatee() {
      setVisible(true);
  }

  // ✅ Correction : On utilise data.plats directement pour recalculer
  function calculateAndDispatchPrice(platsArray: any[]) {
    const sum = platsArray?.reduce((accumulator: number, object: any) => {
      return Number(accumulator) + (Number(object.price) || 0);
    }, 0);
    dispatch(updatePrice(sum));
  }

  // 1️⃣ Effet d'initialisation (au montage du composant)
  useEffect(() => {
    const initializeCartData = async () => {
      try {
        setIsLoading(true);
        const cachedPlats = await AsyncStorage.getItem('cachedPlats');
        
        if (cachedPlats) {
          console.log('📦 Panier chargé depuis AsyncStorage');
          // Note: Si vous avez une action pour restaurer les plats dans le store, appelez-la ici.
        }

        if (CardDetails && CardDetails?.card_number) {
          UpdateuseOtherCard(true);
        }
      } catch (err) {
        console.error('❌ Erreur lors du chargement du panier :', err);
      } finally {
        setIsLoading(false);
      }
    };
    initializeCartData();
  }, []);

  // 2️⃣ ✅ Correction CRUCIALE : Surveiller data.plats pour mettre à jour le prix total
  // Dès qu'un produit est supprimé, Redux met à jour data.plats, cet effet se déclenche et recalcule le prix.
  useEffect(() => {
    if (data?.plats) {
      calculateAndDispatchPrice(data.plats);
    }
  }, [data?.plats]);

  const hideModal = () => setVisible(false);

  function _onChange(form: any) {
    let ex = {
      card_number: form.values.number,
      cvc: form.values.cvc,
      exp_month: form.values.expiry[0] + '' + form.values.expiry[1],
      exp_year: '20' + form.values.expiry[3] + '' + form.values.expiry[4],
    };
    setCard(ex);
    setcartError(form.status);
  }

  async function finishProcess() {
    const canSubmit = await checkBeforeSubmit();
    if (!canSubmit) return;
    if (!adress?.trim()) {
      return Toast.show({ text1: t("deliveryAddressMissing"), type: "error", position: "top" });
    }
    if (!resDate || !resTime) {
      return Toast.show({ text1: t("reservationDateTimeMissing"), type: "error", position: "top" });
    }
    if (data?.storeid === null || data?.storeid === undefined) {
      return Toast.show({ text1: "Restaurant manquant", type: "error", position: "top" });
    }
    if (!Array.isArray(data?.plats) || data.plats.length === 0) {
      return Toast.show({ text1: "Panier vide", type: "error", position: "top" });
    }
    if (!user?.id) {
      return Toast.show({
        text1: "Non connecté",
        text2: "Veuillez vous connecter.",
        type: "error",
        position: "top",
      });
    }

    const payload = {
      userid: user.id,
      adress,
      comment: info || "",
      ville: data?.ville?.trim() || "Non précisée",
      totalprice: Number(data.totalprice || 0),
      date: moment(resDate).format("YYYY-MM-DD"),
      time: moment(resTime).format("HH:mm"),
      plats: data.plats.map((val: any) => ({
        id: val?.id,
        qte: val?.qte,
      })),
      idresto: data.storeid,
    };

    setVisible(true);
    setLoadingValidation(true);
    setTimeout(() => setLoadingValidation(false), 800);
   
    settings.RestaurantRequest(payload, token)
      .then((response) => {
        Toast.show({
          text1: t("successTitle"),
          text2: t("yourRestaurantReservationHasBeenConfirmed"),
          type: "success",
          position: "top",
        });
        dispatch(resetPanel());
        AsyncStorage.removeItem("cachedPlats");
      })
      .catch((err) => {
        setVisible(false);
        Toast.show({
          text1: t("errorTitle"),
          text2: t("errorSubmit"),
          type: "error",
          position: "top",
        });
      });
  }

  const renderItem = ({ item }: any) => (
    <View style={[styles.card]}>
      <Image
        style={styles.CardImage}
        resizeMode={'cover'}
        source={item?.img ? { uri: item?.img } : require('../../assets/images/plate.jpeg')}
      />
      <View style={{ flex: 1, padding: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={[styles.Label]}>{item?.name}</Text>
          <TouchableOpacity onPress={() => { dispatch(deleteprod(item?.id)); }}>
            <FontAwesome name="trash-o" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.Label, { fontSize: 12, paddingVertical: 5 }]}>
          {t("qty")}: {item?.qte}
        </Text>
        <Text style={[styles.Label, { fontWeight: "bold"}]}>{item?.price}€</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 40 }}>
        <ActivityIndicator size="large" color="#444" />
        <Text style={{ marginTop: 8, color: "#444" }}>{t("loading")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.backgroundStyle}>
        <View style={{ backgroundColor: Colors.white, flex: 1, alignItems: 'center', paddingTop: 20 }}>
          <Text style={styles.Title}>{t("cartTitle")}</Text>

          <FlatList
            data={data?.plats}
            renderItem={renderItem}
            keyExtractor={() => Math.random().toString()}
            extraData={data?.plats}
          />

          <View style={styles.inputContainer}>
            <Text style={[styles.Label]}>{t("deliveryAddress")} <Text style={{ color: 'red' }}>*</Text> :</Text>
            <View style={[styles.inputWrapper]}>
              <TextInput
                style={[styles.textInput]}
                placeholder={t("deliveryAddress")}
                value={adress}
                onChangeText={setAddress}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.Label]}>{t("additionalInfo")} :</Text>
          </View>
          <TextInput
            placeholder={t("addInfoPlaceholder")}
            value={info}
            onChangeText={setInfo}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={{ width: '80%'}}
            activeOutlineColor={COLOR.arrow}
          />

          <View style={styles.inputContainer}>
            <Text style={[styles.Label]}>{t("reservationDateTime")} <Text style={{ color: 'red' }}>*</Text> :</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '80%' }}>
            <TouchableOpacity onPress={() => setOpenDate(true)} style={{ width: '48%' }}>
              <TextInput
                value={moment(resDate).format('DD/MM/YYYY')}
                mode="outlined"
                editable={false}
                style={{ backgroundColor: '#ffffff' }}
                pointerEvents="none"
                right={<TextInput.Icon icon="calendar" />}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOpenTime(true)} style={{ width: '48%' }}>
              <TextInput
                value={moment(resTime).format('HH:mm')}
                mode="outlined"
                editable={false}
                style={{ backgroundColor: '#ffffff' }}
                pointerEvents="none"
                right={<TextInput.Icon icon="clock-outline" />}
              />
            </TouchableOpacity>
          </View>

          <Divider style={styles.divider} />

          <View style={{ flexDirection: "row", justifyContent: "space-between", width: '90%' }}>
            <Text style={styles.Title2}>{t("price")} :</Text>
            <Text style={styles.Title2}>{data?.totalprice} € / TTC</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              color={"#69972d"}
              icon={"arrow-right"}
              contentStyle={{ flexDirection: "row-reverse" }}
              style={styles.buttonStyle}
              onPress={finishProcess}
            >
              {t("confirmButton")}
            </Button>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={visible}
        onDismiss={hideModal}
        contentContainerStyle={styles.containerStyle}
      >
        <View style={styles.confirmBox}>
          {loadingValidation ? (
            <>
              <ActivityIndicator size="large" color="#000" />
              <Text style={{ marginTop: 15, fontSize: 16, color: "#555" }}>
                {t("loadingValidation") || "Validation en cours..."}
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={72}
                color="#4CAF50"
                style={{ marginBottom: 15 }}
              />
              <Text style={styles.confirmTitle}>
                {t("reservationConfirmed")}
              </Text>
              <Text style={styles.confirmMessage}>
                {t("yourRestaurantReservationHasBeenConfirmed")}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("HistoryStack")}
                style={{ width: "100%", justifyContent: "center", alignItems: "center", paddingVertical: 10 }}
              >
                <Text style={[styles.Label, { textAlign: 'center', fontWeight: "bold" }]}>
                  {t("seeMyRequests")}
                </Text>
              </TouchableOpacity>
              <ButtonComponent
                title={t("makeAnotherRequest")}
                press={() => navigation.navigate("YouzFul")}
                isLoading={false}
              />
            </>
          )}
        </View>
      </Modal>

      <DatePicker
        modal
        open={openDate}
        date={resDate}
        mode="date"
        minimumDate={new Date()}
        onConfirm={(d) => { setOpenDate(false); setResDate(d); }}
        onCancel={() => setOpenDate(false)}
      />
      <DatePicker
        modal
        open={openTime}
        date={resTime}
        mode="time"
        onConfirm={(t) => { setOpenTime(false); setResTime(t); }}
        onCancel={() => setOpenTime(false)}
      />
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
  confirmBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  confirmMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  confirmButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: '#000000',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    height: 50,
    paddingHorizontal: 15,
  },
  textInput : {
    backgroundColor: '#ffffff',
    width:270,
    height:46.5,
    marginTop:5
  },
  backgroundStyle: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  LabelError: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 12,
    textAlign: 'center',
    color: "#000"
  },
  card: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    margin: 5,
    elevation: 2,
    width: windowWidth - 40,
    paddingBottom: 10
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
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: COLOR.arrow,
  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  buttonStyle: {
    height: 50,
    width: 250,
    backgroundColor: '#000000',
    borderRadius: 12,  
    justifyContent: 'center',
    alignItems: 'center',
  },
  Label: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 15,
    textAlign: 'left',
    color: COLOR.arrow,
    width: "80%"
  },
  searchTitle: {
    width: '80%',
    height: 50,
    backgroundColor: Colors.white,
    borderColor: '#000',
    borderWidth: 0.6,
  },
  CardeTitle: {
    fontSize: 20,
    fontWeight: '700',
    paddingVertical: 5,
    lineHeight: 25,
    textAlign: 'left',
    color: COLOR.arrow,
  },
  ContentContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    marginHorizontal: 20
  },
  inputContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: '10%',
  },
  containerStyle: {
    backgroundColor: 'white',
    width: windowWidth - 50,
    alignSelf: 'center',
    paddingHorizontal: 5,
    marginTop: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLOR.arrow,
    marginBottom: 20,
  },
  CardImage: {
    width: "40%",
    height: "100%",
    borderRadius: 10,
  },
});

export default Panier;
