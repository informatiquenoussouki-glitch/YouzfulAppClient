import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { settings } from '../../api';
import { ButtonComponent } from "../../components";
import { request, success, failure } from '../../redux/actions/Signin';
import { COLOR } from '../../helpers/functions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';


const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { t } = useTranslation(); // 🔹 Traduction activée
 

  const Islodding = useSelector(
    ({ userReducer }: any) => userReducer.isLoading
  );
  const [mail, setMail] = React.useState('');
  const [email, setEmail] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [epassword, setEpassword] = React.useState(false);
  const [passwordSecure, setPasswordSecure] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useDispatch();
  async function login() {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (!mail || reg.test(mail) === false) {
      setEmail(true);
    } else {
      setEmail(false);
    }
    if (password.length < 4) {
      setEpassword(true);
    } else {
      setEpassword(false);
    }
    if (password.length > 3 && reg.test(mail) === true) {
      setIsLoading(true)
      dispatch(request({ mail }));
      return settings
        .Login({ mail, password })
        .then(async response => {
          if (response.user) {
            setTimeout(() => {
              setIsLoading(false)
              dispatch(success(response.user, response.token));
              navigation.navigate("HistoryStack");
            }, 10000);
          } else {
            dispatch(failure(response.error || response.message));
            setIsLoading(false)
            Toast.show({
              text1: t("error"),
              text2: response.error || response.message,
              type: 'error',
              position: 'top',
            });
            //return response;
          }
        })
        .catch(err => {
          setIsLoading(false)
          Toast.show({
            text1: t("error"),
            text2: err.toString(),
            type: 'error',
            position: 'top',
          });
          dispatch(failure(err.toString()));
          return null;
        });
    }
  }
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
        <ActivityIndicator animating={true} color={'#000'} />
        <Text>
         {t("loadingAccount")}
        </Text>
      </View>
    )
  }
  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.backgroundStyle}>
        <View
          style={{
            backgroundColor: Colors.white,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 30,
          }}>
            <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
                            <Text style={styles.Title}>{t("connexion")}</Text>
            
                  {/* --- Champ Identifiant --- */}
<View style={styles.fieldContainer}>
  <Text style={[styles.label]}>
    {t("connexion")}
  </Text>
  <View style={[
    styles.inputWrapper,
    email && styles.inputWrapperError,
    { flexDirection:"row" } // 🔄 inversion
  ]}>
    <Ionicons
      name="mail-outline"
      size={20}
      color="#6c757d"
      style={[
        styles.icon,
        
      ]}
    />
    <TextInput
      style={[styles.textInput]}
      placeholder={t("enterEmail")}
      value={mail}
      onChangeText={text => setMail(text)}
      underlineColorAndroid="transparent"
    />
  </View>
  {email && <Text style={styles.labelError}>{t("invalidIdentifier")}</Text>}
</View>

{/* --- Champ Mot de passe --- */}
<View style={styles.fieldContainer}>
  <Text style={styles.label}>
    {t("password")}
  </Text>

  <View
    style={[
      styles.inputWrapper,
      epassword && styles.inputWrapperError,
      { flexDirection: "row", alignItems: "center" },
    ]}
  >
    {/* Icône clé */}
    <Ionicons
      name="key-outline"
      size={20}
      color="#6c757d"
      style={styles.icon}
    />

    {/* Champ texte mot de passe */}
    <TextInput
      style={[styles.textInput, { flex: 1 }]}
      placeholder={t("enterPassword")}
      value={password}
      onChangeText={text => setPassword(text)}
      autoCapitalize="none"
      secureTextEntry={passwordSecure} // 👁 toggle
    />

    {/* Icône œil pour afficher/masquer */}
    <TouchableOpacity onPress={() => setPasswordSecure(!passwordSecure)}>
      <Ionicons
        name={passwordSecure ? "eye-off-outline" : "eye-outline"}
        size={22}
        color="#6c757d"
        style={{ marginRight: 10 }}
      />
    </TouchableOpacity>
  </View>  

  {epassword && (
    <Text style={styles.labelError}>{t("invalidPassword")}</Text>
  )}
</View>


            
                  {/* --- Bouton Valider --- */}
                  <ButtonComponent isLoading={Islodding} title={t("connexion")} press={() => login()} />

                    
              
                  <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => navigation.navigate("InscriptionScreen")}
                  >
                    <Text style={styles.registerText}>{t("register")}</Text>
                  </TouchableOpacity>

            <TouchableOpacity style={styles.forgetContainer} onPress={() => navigation.navigate("ForgetPasswordScreen")}>
              <Text style={styles.Label}>{t("forgotPassword")}</Text>
            </TouchableOpacity>
                </ScrollView>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  registerButton: {
    backgroundColor: "#007BFF", // 🔵 Bleu moderne
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
   width: '60%',
    elevation: 4, // effet d'ombre Android
    shadowColor: "#000", // effet d'ombre iOS
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  registerText: {
    color: "#fff", // 🤍 texte blanc
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
   labelError: {
    fontSize: 14,
    color: '#dc3545',
    marginTop: 5,
    paddingLeft: 5,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  fieldContainer: {
    width: '100%',
    marginBottom: 20,
  },
   container: {
    flex: 1,
    
    padding: 20,
  },
  backgroundStyle: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  Title: {
    fontSize: 26,
    fontWeight: '700',
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: COLOR.gris,
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

  Label: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 5,
    lineHeight: 20,
    textAlign: 'left',
    color: COLOR.gris,
  },
  ContentContainer: {
    flex: 1,
    justifyContent: 'center',
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
  forgetContainer: {
    width: '100%',
    alignItems: 'center',
    //paddingLeft: '10%',
    paddingTop: 10,
    paddingBottom: "30%"
  },
  ContentStyle: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    paddingVertical: 10,
    textAlign: 'left',
  },
  LabelError: {
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 12,
    textAlign: 'left',
    color: 'red',
  },
});

export default LoginScreen;
