import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  I18nManager
} from 'react-native';
import { Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { useSelector, useDispatch } from 'react-redux';
import { Text, TextInput, Divider } from 'react-native-paper';
import MenuDrawer from 'react-native-side-drawer';
import { ButtonComponent } from '../../components';
import DrawerItem from '../../components/DraweItem';
import DrawerBottom from '../../components/DraweBottom';
import { ChangeColor } from '../../redux/actions/Signin';
import { COLOR } from '../../helpers/functions';
import CloseIcon from '../../assets/icons/closeDrawer.svg';
import MainIcon from '../../assets/icons/youzful.svg';
import Menu from '../../assets/icons/menu.svg';
import { settings } from '../../api';
import { Disconnect } from "../../redux/actions/Signin";
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTranslation } from "react-i18next";
import i18n from '../../i18n/i18n';
import { useFocusEffect } from '@react-navigation/native';
import { getUnreadMessagesAdminCount } from '../../api/settings';

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();



  const dispatch = useDispatch();
  const userData = useSelector(({ userReducer }: any) => userReducer.user);
  const userToken = useSelector(({ userReducer }: any) => userReducer.token);
  const [isLoading, setisLoading] = useState(false);
  const [fname, setName] = useState(userData?.fname);
  const [lname, setLname] = useState(userData?.lname);
  const [mail, setMail] = useState(userData?.mail);
  const [tel, setTel] = useState(userData?.tel);
  const [Email, setEmail] = useState(false);
  const [Etel, setEtel] = useState(false);
  const [Efname, setEfname] = useState(false);
  const [Elname, setElname] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    dispatch(ChangeColor(COLOR.primary1));
    setDrawerOpen(false);
  }, [userToken, userData]);

  useFocusEffect(
    React.useCallback(() => {
      if (!userToken) return;
      getUnreadMessagesAdminCount(userToken)
        .then((res: any) => { if (res?.code === 200) setUnreadCount(res.count || 0); })
        .catch(() => {});
    }, [userToken])
  );
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
            selected={true}
             title={t("personalInfo")}
            press={() => setDrawerOpen(false)}
          />
          <DrawerItem
            selected={false}
            title={t("paymentMethods")}
            press={() => navigation.navigate('PaymentScreen')}
          />
          <TouchableOpacity
            onPress={() => { setDrawerOpen(false); navigation.navigate('ContactAdminScreen'); }}
            style={styles.contactAdminRow}>
            <Ionicons name="mail-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.contactAdminText}>{t("contactAdmin")}</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
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
            press={() => navigation.navigate('PasswordScreen')}
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
  async function updateProfile() {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (!fname) {
      setEfname(true);
    } else {
      setEfname(false);
    }
    if (!lname) {
      setElname(true);
    } else {
      setElname(false);
    }
    if (!tel) {
      setEtel(true);
    } else {
      setEtel(false);
    }
    if (!mail || reg.test(mail) === false) {
      setEmail(true);
    } else {
      setEmail(false);
    }
    if (
      (tel.length > 8 &&
        mail.length > 8 &&
        fname.length > 4 &&
        lname.length > 4) ||
      reg.test(mail) === true
    ) {
      setisLoading(true);
      let result = await settings.UpdateProfile(
        { fname: fname, lname: lname, tel: tel, mail: mail, id: userData.id },
        userToken,
      );
      if (result === true) {
        Toast.show({
          text1: t("successTitle"),
          text2: t("profileUpdateSuccess"),
          type: 'success',
          position: 'top',
        });
        dispatch(Disconnect());
      } else {
        Toast.show({
          text1: 'erreur',
          text2: result.message,
          type: 'error',
          position: 'top',
        });
      }
      setisLoading(false);
    }
  }
  if (!userToken) {
    return (
      <SafeAreaView style={styles.backgroundStyle}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.backgroundStyle}>
          <View
            style={{
              backgroundColor: 'transparent',
            }}>
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                color="#1034A6"
                style={styles.buttonStyle}
                onPress={() => navigation.navigate('LoginScreen')}>
                Login
              </Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  } else
   return (
    <SafeAreaView style={{ backgroundColor: 'transparent', flex: 1, marginBottom: -75 }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.backgroundStyle}>
        <MenuDrawer
          open={drawerOpen}
          position={ "right"}   
          drawerContent={drawerContent()}
          drawerPercentage={75}
          animationTime={250}
          overlay={false}
          opacity={0.4}>
          
          <View style={{ backgroundColor: 'transparent', flex: 1, alignItems: 'center' }}>
            
            {/* Header */}
            <View style={[styles.headerStyle, { flexDirection:  "row" }]}>
              
              {/* Logo + titre */}
              <View style={{ flexDirection: "row", alignItems: 'center', marginTop: 25 }}>
                <Image source={require('../../assets/logoY.png')} style={{ width: 30, height: 30, marginHorizontal: 8 }} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>YouzFul</Text>
              </View>

            
              {/* Bouton menu */}
              <TouchableOpacity onPress={() => setDrawerOpen(true)} style={{ marginTop: 15 }}>
                <Menu width={35} height={35} fill={COLOR.primary1} />
              </TouchableOpacity>
            </View>

            {/* Formulaire */}
            <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
              <Text style={styles.title}>{t("personalInfo")}</Text>

              {/* Champ Nom */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label]}>{t("firstName")}</Text>
                <View style={[styles.inputWrapper, Efname && styles.inputWrapperError, { flexDirection:  "row" }]}>
                  <Ionicons name="person-outline" size={20} color="#6c757d" style={[styles.icon]} />
                  <TextInput
                    style={[styles.textInput]}
                    placeholder={t("enterFirstName")}
                    value={fname}
                    onChangeText={setName}
                  />
                </View>
                {Efname && <Text style={styles.labelError}>{t("firstName")}</Text>}
              </View>

              {/* Champ Prénom */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label]}>{t("lastName")}</Text>
                <View style={[styles.inputWrapper, Elname && styles.inputWrapperError, { flexDirection:  "row" }]}>
                  <Ionicons name="person-outline" size={20} color="#6c757d" style={[styles.icon]} />
                  <TextInput
                    style={[styles.textInput]}
                    placeholder={t("enterLastName")}
                    value={lname}
                    onChangeText={setLname}
                  />
                </View>
                {Elname && <Text style={styles.labelError}>{t("lastNameRequired")}</Text>}
              </View>

              {/* Champ Téléphone */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label]}>{t("phone")}</Text>
                <View style={[styles.inputWrapper, Etel && styles.inputWrapperError, { flexDirection: "row" }]}>
                  <Ionicons name="call-outline" size={20} color="#6c757d" style={[styles.icon]} />
                  <TextInput
                    style={[styles.textInput]}
                    placeholder={t("enterPhone")}
                    value={tel}
                    onChangeText={setTel}
                    keyboardType="phone-pad"
                  />
                </View>
                {Etel && <Text style={styles.labelError}>{t("phoneRequired")}</Text>}
              </View>

              {/* Champ Email */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.label]}>{t("emailAddress")}</Text>
                <View style={[styles.inputWrapper, Email && styles.inputWrapperError, { flexDirection: "row" }]}>
                  <Ionicons name="mail-outline" size={20} color="#6c757d" style={[styles.icon]} />
                  <TextInput
                    style={[styles.textInput]}
                    placeholder={t("enterEmail")}
                    value={mail}
                    onChangeText={setMail}
                    keyboardType="email-address"
                  />
                </View>
                {Email && <Text style={styles.labelError}>{t("emailRequired")}</Text>}
              </View>

              {/* Bouton Sauvegarder */}
              <TouchableOpacity style={styles.button} onPress={updateProfile} disabled={isLoading}>
                <Text style={styles.buttonText}>{isLoading ? t("loading") : t("save")}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </MenuDrawer>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  backgroundStyle: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerStyle: {
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: 'center',
    width: '92%',
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
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
  },
  closeStyle: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  Title: {
    fontSize: 26,
    fontWeight: '700',
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: '#000000'   ,
  },

  ContentContainer: {
    //  flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
    //   height: 300,
  },
  container: {
    flex: 1,
    
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  fieldContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
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
  inputWrapperError: {
    borderColor: '#dc3545',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
  },
  labelError: {
    fontSize: 14,
    color: '#dc3545',
    marginTop: 5,
    paddingLeft: 5,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width:100
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
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
    width: '100%',
    opacity: 0.7,
  },
  contactAdminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  contactAdminText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 20,
    color: '#FFF',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 6,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default ProfileScreen;
