import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Text, Divider } from 'react-native-paper';
import MenuDrawer from 'react-native-side-drawer';
import DrawerBottom from "../../components/DraweBottom";
import { Colors } from 'react-native/Libraries/NewAppScreen';
import DrawerItem from "../../components/DraweItem";
import { ButtonComponent } from '../../components';
import MainIcon from '../../assets/icons/youzful.svg';
import Menu from '../../assets/icons/menu.svg';
import CloseIcon from '../../assets/icons/closeDrawer.svg';
import { COLOR } from '../../helpers/functions';
import { Disconnect } from "../../redux/actions/Signin";
import { useTranslation } from "react-i18next";
import i18n from '../../i18n/i18n';

const DisconnectScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
     


  const dispatch = useDispatch();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  function Logout() {
    dispatch(Disconnect());
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
          <DrawerItem selected={false} title={t("personalInfo")} press={() => navigation.navigate('Profile')} />
          <DrawerItem selected={false} title={t("paymentMethods")} press={() => navigation.navigate('PaymentScreen')} />
          <DrawerItem selected={false} title={t("help")} press={() => navigation.navigate('Intro')} />
          <DrawerItem selected={false} title={t("legalNotice")} press={() => navigation.navigate('LegalScreen')} />
          <Divider style={styles.divider} />
          <DrawerItem selected={false} title={t("changePassword")} press={() => navigation.navigate('PasswordScreen')} />
          <DrawerItem
            title={t("logout")}
            selected={true}
            press={() => setDrawerOpen(false)}
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
  return (
    <SafeAreaView style={{ backgroundColor: 'transparent' }}>
     <MenuDrawer
             open={drawerOpen}
               position={ "right"}   // 🔄 inversion position menu
               drawerContent={drawerContent()}
               drawerPercentage={75}
               animationTime={250}
               overlay={false}
               opacity={0.4}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{ backgroundColor: '#FFF', height: '100%' }}>
          <View style={[styles.headerStyle, { flexDirection:  "row" }]}>
              {/* Logo + titre */}
              <View style={{ flexDirection:  "row", alignItems: 'center', marginTop: 25 }}>
                <Image source={require('../../assets/logoY.png')} style={{ width: 30, height: 30, marginHorizontal: 8 }} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>YouzFul</Text>
              </View>

              {/* Bouton menu */}
              <TouchableOpacity onPress={() => setDrawerOpen(true)} style={{ marginTop: 15 }}>
                <Menu width={35} height={35} fill={COLOR.primary1} />
              </TouchableOpacity>
          </View>
          
          <View style={styles.Container}>
            <Text style={styles.Title}>{t("titre")}</Text>
            <View style={styles.ContentContainer}>
              <Text adjustsFontSizeToFit={true} style={styles.ContentStyle}>
                    {t("description")}                
              </Text>
              <ButtonComponent
                title={t("button")}
                press={() => Logout()}
                isLoading={false}
              />
            </View>
          </View>
        </ScrollView>
      </MenuDrawer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Title: {
    fontSize: 26,
    fontWeight: '700',
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: '#000000',
  },
  Container: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  ContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //   height: 300,
  },
  ContentStyle: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    paddingVertical: 20,
    paddingBottom: 30,
    textAlign: 'left',
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
  drawText1: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 10,
    lineHeight: 20,
    textAlign: 'left',
    color: '#FFF',
  },
  drawText2: {
    fontSize: 18,
    fontWeight: '400',
    paddingVertical: 10,
    lineHeight: 22,
    textAlign: 'left',
    color: '#FFF',
  },
  divider: {
    backgroundColor: '#fff',
    marginVertical: 15,
    paddingVertical: 1,
    width: '100%',
    opacity: 0.7,
  },
  closeStyle: {
    justifyContent: "center",
    alignItems: "flex-end"
  },
});

export default DisconnectScreen;
