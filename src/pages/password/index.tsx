import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { Text, Divider, TextInput } from 'react-native-paper';
import DrawerBottom from '../../components/DraweBottom';
import MenuDrawer from 'react-native-side-drawer';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import DrawerItem from '../../components/DraweItem';
import { settings } from '../../api';
import { ButtonComponent } from '../../components';
import MainIcon from '../../assets/icons/youzful.svg';
import Menu from '../../assets/icons/menu.svg';
import CloseIcon from '../../assets/icons/closeDrawer.svg';
import { COLOR } from '../../helpers/functions';
import { Disconnect } from "../../redux/actions/Signin";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UpdatePassword } from '../../api/settings';
import { useTranslation } from "react-i18next";
import i18n from '../../i18n/i18n';

const PasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { t } = useTranslation();
   

  const dispatch = useDispatch();
  const token = useSelector(({ userReducer }: any) => userReducer.token);
  const id = useSelector(({ userReducer }: any) => userReducer.user.id);
  const [isLoading, setisLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [passwordSecure, setPasswordSecure] = useState(true);
  const [newPasswordSecure, setNewPasswordSecure] = useState(true);
  const [cpasswordSecure, setCasswordSecure] = useState(true);
  const [Epassword, setEpassword] = useState(false);
  const [ENewpassword, setEnewPassword] = useState(false);
  const [Epassword2, setEpassword2] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  async function forgetPass() {
    if (password.length < 3) {
      setEpassword(true);
    } else {
      setEpassword(false);
    }
    if (newPassword !== cpassword) {
      setEpassword2(true);
      setEnewPassword(true)
    } else {
      setEpassword2(false);
      setEnewPassword(false)
    }
    if (
      (newPassword.length > 5 && newPassword === cpassword)
    ) {
      setisLoading(true)
      let result = await settings.UpdatePassword(
        {
          newPassword: newPassword,
          id: id,
          oldPassword: password,
        },
        token,
      );
      if (result === true) {
        Toast.show({
          text1: 'success',
          text2: 'modifaction avec succès',
          type: 'success',
          position: 'top',
        });
        dispatch(Disconnect());
        setPassword('');
        setNewPassword('');
        setCpassword('');
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
    //dispatch(Disconnect());
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
            selected={false}
            title={t("paymentMethods")}
            press={() => navigation.navigate('PaymentScreen')}
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
            selected={true}
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
  return (
    <SafeAreaView style={{ backgroundColor: 'transparent', flex: 1, marginBottom: -75 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: '#FFF', flex: 1 }}>
        <MenuDrawer
        open={drawerOpen}
          position={ "right"}   // 🔄 inversion position menu
          drawerContent={drawerContent()}
          drawerPercentage={75}
          animationTime={250}
          overlay={false}
          opacity={0.4}>
        <View style={[styles.headerStyle, { flexDirection:"row" }]}>
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
          
           <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
    <Text style={styles.Title}>{t("changePassword")}</Text>

    {/* --- Champ Ancien mot de passe --- */}
<View style={styles.fieldContainer}>
  <Text style={[styles.label]}>
    {t("oldPassword")}
  </Text>
  <View style={[
    styles.inputWrapper,
    Epassword && styles.inputWrapperError,
    { flexDirection:  "row" }
  ]}>
    
    {/* Icône clé */}
    <Ionicons
      name="key-outline"
      size={20}
      color="#6c757d"
      style={[
        styles.icon,
       
      ]}
    />

    {/* Input */}
    <TextInput
      style={[styles.textInput]}
      placeholder={t("oldPasswordPlaceholder")}
      value={password}
      onChangeText={setPassword}
      underlineColorAndroid="transparent"
      secureTextEntry={passwordSecure}
      error={Epassword}
    />

    {/* Icône œil */}
    <TouchableOpacity onPress={() => setPasswordSecure(!passwordSecure)}>
      <Ionicons
        name={passwordSecure ? "eye-off-outline" : "eye-outline"}
        size={22}
        color="#6c757d"
      />
    </TouchableOpacity>
  </View>
  {Epassword && <Text style={styles.labelError}>{t("oldPasswordRequired")}</Text>}
</View>

{/* --- Champ Nouveau mot de passe --- */}
<View style={styles.fieldContainer}>
  <Text style={[styles.label]}>
    {t("newPassword")}
  </Text>
  <View style={[
    styles.inputWrapper,
    ENewpassword && styles.inputWrapperError,
    { flexDirection:  "row" }
  ]}>
    <Ionicons
      name="lock-closed-outline"
      size={20}
      color="#6c757d"
      style={[
        styles.icon,
      
      ]}
    />
    <TextInput
      style={[styles.textInput]}
      placeholder={t("newPasswordPlaceholder")}
      value={newPassword}
      onChangeText={setNewPassword}
      underlineColorAndroid="transparent"
      secureTextEntry={newPasswordSecure}
      error={ENewpassword}
    />
    <TouchableOpacity onPress={() => setNewPasswordSecure(!newPasswordSecure)}>
      <Ionicons
        name={newPasswordSecure ? "eye-off-outline" : "eye-outline"}
        size={22}
        color="#6c757d"
      />
    </TouchableOpacity>
  </View>
  {ENewpassword && <Text style={styles.labelError}>{t("newPasswordRequired")}</Text>}
</View>

{/* --- Champ Confirmation mot de passe --- */}
<View style={styles.fieldContainer}>
  <Text style={[styles.label]}>
    {t("confirmPassword")}
  </Text>
  <View style={[
    styles.inputWrapper,
    Epassword2 && styles.inputWrapperError,
    { flexDirection: "row" }
  ]}>
    <Ionicons
      name="lock-closed-outline"
      size={20}
      color="#6c757d"
      style={[
        styles.icon,
       
      ]}
    />
    <TextInput
      style={[styles.textInput]}
      placeholder={t("confirmPasswordPlaceholder")}
      value={cpassword}
      onChangeText={setCpassword}
      underlineColorAndroid="transparent"
      secureTextEntry={cpasswordSecure}
      error={Epassword2}
    />
    <TouchableOpacity onPress={() => setCasswordSecure(!cpasswordSecure)}>
      <Ionicons
        name={cpasswordSecure ? "eye-off-outline" : "eye-outline"}
        size={22}
        color="#6c757d"
      />
    </TouchableOpacity>
  </View>
  {Epassword2 && <Text style={styles.labelError}>{t("confirmPasswordRequired")}</Text>}
</View>

    <TouchableOpacity
        style={styles.button}
        onPress={UpdatePassword}
        disabled={isLoading}
    >
        <Text style={styles.buttonText}>{isLoading ? t("loading") : t("confirmButton")}</Text>
    </TouchableOpacity>
</ScrollView>
           
            
            
        </MenuDrawer>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    width: '95%',
    marginBottom: 20,

  },
  Title: {
    fontSize: 26,
    fontWeight: '700',
    paddingVertical: 15,
    paddingHorizontal: 15,
    textAlign: 'center',
    color: '#000000',
  },
  ContentContainer: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  container: {
    flex: 1,
    
    padding: 20,
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
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 12,
    textAlign: 'left',
    color: 'red',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: '10%',
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
    fontSize: 13,
    backgroundColor: '#ffffff',
    width:230,
    height:46.5,
    marginTop:5
  

  },
  inputWrapperError: {
    borderColor: '#dc3545',
  },
  icon: {
    marginRight: 10,
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
});

export default PasswordScreen;
