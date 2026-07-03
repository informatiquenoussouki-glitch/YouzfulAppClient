import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  Dimensions,
  Image
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Modal, Button, Text, Divider, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { settings } from '../../api';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import MenuDrawer from 'react-native-side-drawer';
import MainIcon from '../../assets/icons/youzful.svg';
import Menu from '../../assets/icons/menu.svg';
import DrawerItem from "../../components/DraweItem";
import DrawerBottom from "../../components/DraweBottom";
import { COLOR } from '../../helpers/functions';
import CloseIcon from '../../assets/icons/closeDrawer.svg';
import Close from "../../assets/icons/close.svg"
import { ButtonComponent } from '../../components';
import { Disconnect } from "../../redux/actions/Signin";
import { useTranslation } from "react-i18next";
import Ionicons from 'react-native-vector-icons/Ionicons';
import i18n from '../../i18n/i18n';




const windowWidth = Dimensions.get('window').width;

const DeleteAccount: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();
     


  const dispatch = useDispatch();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const token = useSelector(({ userReducer }: any) => userReducer.token);
  const [visible, setVisible] = React.useState(false);
  const hideModal = () => setVisible(false);
  const [isLoading, setIsLoading] = React.useState(false);

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
          <DrawerItem selected={false} title={t("paymentMethods")}press={() => navigation.navigate('PaymentScreen')} />
          <DrawerItem selected={false} title={t("help")}press={() => navigation.navigate('Intro')} />
          <DrawerItem selected={false} title={t("legalNotice")} press={() => navigation.navigate('LegalScreen')} />
          <Divider style={styles.divider} />
          <DrawerItem selected={false} title={t("changePassword")} press={() => navigation.navigate('PasswordScreen')} />
          <DrawerItem
            selected={false}
            title={t("logout")}
            press={() => navigation.navigate('DisconnectScreen')}
          />
          <DrawerItem
            selected={true}
            title={t("deleteAccount")}
            press={() => setDrawerOpen(false)}
          />
        </View>
        <DrawerBottom />
      </View>
    );
  }
  function Delete() {
    settings
      .DeleteAccount(token)
      .then(async response => {
        setIsLoading(false)
        // navigation.navigate("HomeStack");
        dispatch(Disconnect());
      })
      .catch(err => {
        setIsLoading(false)
        Toast.show({
          text1: 'error',
          text2: err.toString(),
          type: 'error',
          position: 'top',
        });
        return null;
      });
  }
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
        <ActivityIndicator animating={true} color={'#1034A6'} />
        <Text>
          {t("load")}
        </Text>
      </View>
    )
  }
  return (
   <MenuDrawer
                open={drawerOpen}
                  position={ "right" }   // 🔄 inversion position menu
                  drawerContent={drawerContent()}
                  drawerPercentage={75}
                  animationTime={250}
                  overlay={false}
                  opacity={0.4}>
      <SafeAreaView style={{ backgroundColor: 'transparent', flex: 1 }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{ backgroundColor: '#FFF', flex: 1 }}>
          <View
            style={{
              backgroundColor: Colors.white,
              alignItems: 'center',
              paddingBottom: 150
            }}>
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

            <Text style={styles.Title}>{t("titre1")}</Text>
            <View style={styles.ContentContainer}>
              <Text adjustsFontSizeToFit={true} style={styles.ContentStyle}>
                {t("description1")}
              </Text>
              <TouchableOpacity onPress={() => setVisible(true)}>
                <Text style={styles.delete}>
                  {t("deleteButton")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <ButtonComponent
            title={t("keepButton")}
            press={() => navigation.navigate('Profile')}
            isLoading={false}
          />

        </ScrollView>

        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.containerStyle}>
          {isLoading ?
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
              <ActivityIndicator animating={true} color={'#000'} />
              <Text>
                {t("load")}
              </Text>
            </View>
            : <React.Fragment>
              <TouchableOpacity onPress={hideModal} style={{ alignItems: "flex-end", justifyContent: "flex-start", paddingTop: 20 }}>
                <Ionicons name="close" size={25} color="#000" />

              </TouchableOpacity>
                <Text style={styles.ModalText}>{t("warning")}</Text>
                <Text style={styles.ModalText}>{t("irreversible")}</Text>
                <Text style={styles.ModalText}>{t("confirm")}</Text>
              <ButtonComponent
                title={t("yess")}
                press={() => Delete()}
                isLoading={false}
              />
              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  style={styles.buttonStyle}
                  color={COLOR.gris}
                  onPress={() => hideModal()}>
                  {t("cancel")}
                </Button>
              </View>
            </React.Fragment>
          }
        </Modal>

      </SafeAreaView>
    </MenuDrawer>
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
  ModalText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    zIndex: 9999,
    textAlign: "center",
    paddingBottom: 20,
    paddingTop: 10,
    color: "#132661",
  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  ContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //   height: 300,
  },
  delete: {
    color: '#EC1C24',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    paddingVertical: 10,
    textAlign: 'center',
  },
  containerStyle: {
    backgroundColor: 'white',
    width: windowWidth - windowWidth / 4,
    alignSelf: "center",
    paddingHorizontal: 15,
    //paddingVertical: 10,
    minHeight: 200,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLOR.gris
  },
  buttonStyle: {
    height: 50,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ContentStyle: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    paddingVertical: 10,
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
    width: "100%",
  },
  body: {
    flex: 1,
    alignItems: 'flex-start',
    //  justifyContent: 'center',
    paddingTop: 30,
    paddingHorizontal: 10,
    width: "100%",
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
    fontWeight: '700',
    paddingVertical: 10,
    lineHeight: 22,
    textAlign: 'left',
    color: '#FFF',
  },
  divider: {
    backgroundColor: '#fff',
    marginVertical: 15,
    paddingVertical: 1,
    width: "100%",
    opacity: 0.7
  },
  closeStyle: {
    justifyContent: "center",
    alignItems: "flex-end"
  },
});

export default DeleteAccount;
