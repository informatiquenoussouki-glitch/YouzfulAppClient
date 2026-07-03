import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Text, Divider, TextInput } from 'react-native-paper';
import { CreditCardInput, CardView } from 'react-native-credit-card-input-plus';
import DrawerBottom from '../../components/DraweBottom';
import Toast from 'react-native-toast-message';

import MenuDrawer from 'react-native-side-drawer';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import DrawerItem from '../../components/DraweItem';
import { ButtonComponent } from '../../components';
import MainIcon from '../../assets/icons/youzful.svg';
import Menu from '../../assets/icons/menu.svg';
import CloseIcon from '../../assets/icons/closeDrawer.svg';
import { COLOR } from '../../helpers/functions';
import { updateCard, deleteCard } from "../../redux/actions/Signin";

import { useTranslation } from "react-i18next";
import i18n from '../../i18n/i18n';

const PaymentScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
 

  const dispatch = useDispatch();
  const CardDetails = useSelector(({ userReducer }: any) => userReducer.card);
  const user = useSelector(({ userReducer }: any) => userReducer.user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [card, setCard] = React.useState({
    card_number: '',
    cvc: '',
    expiry: '',
  });
  const [placeHolders, setPlaceHolders] = React.useState({ number: '', expiry: '', cvc: '' });
  const [cartError, setcartError] = React.useState({
    cvc: 'incomplete',
    expiry: 'incomplete',
    number: 'incomplete',
  });
  React.useEffect(() => {
    if (CardDetails && CardDetails?.card_number) {
      setPlaceHolders({ number: CardDetails?.card_number, expiry: CardDetails?.expiry, cvc: CardDetails?.cvc })
    }
  }, [CardDetails]);
  function save() {
    if (cartError.cvc === 'incomplete') {
      Toast.show({
        text1: t("errorTitle"),
        text2: t("cvcIncomplete"),
        type: 'error',
        position: 'top',
      });
    } else if (cartError.expiry === 'incomplete') {
      Toast.show({
        text1: t("errorTitle"),
        text2: t("cardExpired"),
        type: 'error',
        position: 'top',
      });
    } else if (cartError.number === 'incomplete') {
      Toast.show({
        text1: t("errorTitle"),
        text2: t("numberIncomplete"),
        type: 'error',
        position: 'top',
      });
    } else {
      dispatch(updateCard(card));
      Toast.show({
    text1: t("saveSuccess"),
        type: 'info',
        position: 'top',
      });
    }

  }
  function deleteC() {
    dispatch(deleteCard());
  }
  function drawerContent() {
    return (
      <View style={styles.animatedBox}>
        <TouchableOpacity
          onPress={() => setDrawerOpen(!drawerOpen)}
          style={styles.closeStyle}>
          <CloseIcon width={30} height={30} fill={'#fff'} />
        </TouchableOpacity>
        <View style={styles.body}>
          <DrawerItem
            selected={false}
           title={t("personalInfo")}
            press={() => navigation.navigate('Profile')}
          />
          <DrawerItem
            selected={true}
            title={t("paymentMethods")}
            press={() => setDrawerOpen(!drawerOpen)}
          />
          <DrawerItem
            selected={false}
            title={t("help")}
            press={() => navigation.navigate('Intro')}
          />
          <DrawerItem
            selected={false}
            title={t("legalNotice")}
            press={() => navigation.navigate('LegalScreen')}
          />
          <Divider style={styles.divider} />
          <DrawerItem
            selected={false}
            title={t("changePassword")}
            press={() => setDrawerOpen(false)}
          />
          <DrawerItem
            selected={false}
            title={t("logout")}
            press={() => navigation.navigate('DisconnectScreen')}
          />

          <DrawerItem
            selected={false}
            title={t("deleteAccount")}
            press={() => navigation.navigate('DeleteAccount')}
          />
        </View>
        <DrawerBottom />
      </View>
    );
  }
  function _onChange(form: any) {
    let ex = {
      card_number: form.values.number,
      cvc: form.values.cvc,
      expiry: form.values.expiry
    };
    setCard(ex);
    setcartError(form.status);
  }
  return (
    <SafeAreaView style={{ backgroundColor: 'transparent', flex: 1 }}>
      <MenuDrawer
        open={drawerOpen}
          position={ "right"}   // 🔄 inversion position menu
          drawerContent={drawerContent()}
          drawerPercentage={75}
          animationTime={250}
          overlay={false}
          opacity={0.4}>
        <View style={[styles.headerStyle, { flexDirection:  "row" }]}>
              {/* Logo + titre */}
              <View style={{ flexDirection: "row", alignItems: 'center', marginTop: 25 }}>
                <Image source={require('../../assets/logoY.png')} style={{ width: 40, height: 40, marginHorizontal: 8 }} />
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#000' }}>YouzFul</Text>
              </View>

              {/* Bouton menu */}
              <TouchableOpacity onPress={() => setDrawerOpen(true)} style={{ marginTop: 15 }}>
                <Menu width={35} height={35} fill={COLOR.primary1} />
              </TouchableOpacity>
          </View>


        <Text style={styles.Title}>{t("paymentTitle")}</Text>
        {CardDetails && CardDetails?.card_number ?
          <View style={{ marginTop: 20, marginLeft: 30, flex: 2 }}>
            <CardView
              number={CardDetails?.card_number}
              cvc={CardDetails?.cvc}
              expiry={CardDetails?.expiry}
              brand="visa"
              display={true}
              name={user.fname + user.lname}
            /></View>
          :
          <View style={{ marginTop: 40, flex: 2 }}>
            <CreditCardInput
              onChange={_onChange} />
          </View>

        }
        <TouchableOpacity style={{ flex: 1 }} onPress={() => deleteC()}>
          <Text style={styles.LabelError}>{t("deletePayment")}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, paddingBottom: -5 }}>
          <ButtonComponent
            title={t("savePayment")}
            press={() => save()}
            isLoading={false}
            buttonStyle={{marginTop: -170}} 
          />
        </View>
      </MenuDrawer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Title: {
    fontSize: 22,
    fontWeight: '700',
    paddingBottom: 40,
    paddingHorizontal: 15,
    textAlign: 'center',
    color: '#000000',
    marginTop:20
  },
  Container: {
    backgroundColor: Colors.white,
    justifyContent: 'center',
    paddingTop: 20,
  },
  ContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },

  headerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '92%',
  },
  animatedBox: {
    flex: 1,
    backgroundColor: COLOR.primary1,
    paddingTop: 40,
    paddingHorizontal: 20,
    width: '100%',
  },
  body: {
    flex: 1,
    alignItems: 'flex-start',
    //  justifyContent: 'center',
    paddingTop: 30,
    paddingHorizontal: 10,
    width: '100%',
  },
  divider: {
    backgroundColor: '#fff',
    marginVertical: 15,
    paddingVertical: 1,
    width: '100%',
    opacity: 0.7,
  },
  closeStyle: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  LabelError: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 12,
    textAlign: 'center',
    color: 'red',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: '10%',
  },
  forgetContainer: {
    width: '100%',
    alignItems: 'center',
    //paddingLeft: '10%',
    paddingTop: 10,
    paddingBottom: '30%',
  },
  Label: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 20,
    textAlign: 'left',
    color: COLOR.primary1,
  },
});

export default PaymentScreen;
