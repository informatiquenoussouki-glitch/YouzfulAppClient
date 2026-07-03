import React from 'react';
import moment from 'moment';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput, ActivityIndicator } from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { ButtonComponent } from '../../components';
import { request, success, failure } from '../../redux/actions/Signin';
import { settings } from '../../api';
import { COLOR } from '../../helpers/functions';
import Ionicons from 'react-native-vector-icons/Ionicons';
  import { useTranslation } from "react-i18next";
import i18n from '../../i18n/i18n';

moment.locale('fr');
const InscriptionScreenStep2: React.FC<{ navigation: any, route: any }> = ({
  
  route,
  navigation,
}) => {
  const { t } = useTranslation();
        

  const [mail, setMail] = React.useState('');
  const [tel, setTel] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [cpassword, setCpassword] = React.useState('');
  const [passwordSecure, setPasswordSecure] = React.useState(true);
  const [cpasswordSecure, setCasswordSecure] = React.useState(true);
  const [Email, setEmail] = React.useState(false);
  const [Etel, setEtel] = React.useState(false);
  const [Epassword, setEpassword] = React.useState(false);
  const [Epassword2, setEpassword2] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useDispatch();

  const { fname, lname, birthday, sex } = route.params;

function submmit() {
  // --- 1. Initialisation ---
  let isValid = true; // On commence par supposer que le formulaire est valide
  const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

  // --- 2. Validation de chaque champ ---

  // Validation de l'email
  if (!mail || reg.test(mail) === false) {
    setEmail(true);
    isValid = false; // Le formulaire n'est pas valide
  } else {
    setEmail(false);
  }

  // Validation du téléphone
  if (!tel) { // Vous pouvez ajouter une vérification de longueur si nécessaire, ex: || tel.length < 8
    setEtel(true);
    isValid = false; // Le formulaire n'est pas valide
  } else {
    setEtel(false);
  }

  // Validation du mot de passe
  if (password.length < 6) {
    setEpassword(true);
    isValid = false; // Le formulaire n'est pas valide
  } else {
    setEpassword(false);
  }

  // Validation de la confirmation du mot de passe (LA VÉRIFICATION CLÉ)
  if (cpassword === '' || password !== cpassword) {
    // Échoue si le champ est vide OU si les mots de passe sont différents
    setEpassword2(true);
    isValid = false; // Le formulaire n'est pas valide
  } else {
    setEpassword2(false);
  }

  // --- 3. Soumission conditionnelle ---
  // On ne continue que si la variable `isValid` est toujours `true`
  if (isValid) {
    setIsLoading(true);
    dispatch(request({ mail }));

    // Le reste de votre code de soumission est correct et ne change pas
    return settings
      .SignUp({
        fname,
        lname,
        birthday,
        sex,
        tel,
        mail,
        password,
      })
      .then(async response => {
        if (response.error) {
          setIsLoading(false);
          dispatch(failure(response.error));
          Toast.show({
            text1: t("error"),
            text2: response.error,
            type: 'error',
            position: 'top',
          });
        } else {
          // Utiliser setTimeout pour la navigation n'est pas toujours recommandé,
          // mais si c'est voulu, gardez-le.
          setTimeout(() => {
            dispatch(success(response.user, response.token));
            setIsLoading(false);
            navigation.navigate("InscriptionScreenStep3");
          }, 1000); // 10 secondes semblait long, j'ai mis 1 seconde. Ajustez si besoin.
        }
      })
      .catch(err => {
        setIsLoading(false);
        Toast.show({
          text1: t("error"),
          text2: err.toString(),
          type: 'error',
          position: 'top',
        });
        dispatch(failure(err.toString()));
        return null;
      });
  } else {
    // Optionnel : pour le débogage, vous pouvez ajouter un message
   console.log(t("formValidationFailed"));

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
                  <Text style={[styles.Title]}>
                    {t("registerStep2")}
                  </Text>

                {/* --- Champ Email --- */}
<View style={styles.fieldContainer}>
  <Text style={[styles.label]}>
    {t("emailAddress")}
  </Text>
  <View style={[
    styles.inputWrapper,
    Email && styles.inputWrapperError,
    { flexDirection:  "row" } // ✅ inverse l'ordre
  ]}>
    <Ionicons 
      name="mail-outline" 
      size={22} 
      color="#6c757d" 
      style={{ marginHorizontal: 8 }} 
    />
    <TextInput
      style={[
        styles.textInput,
       
      ]}
      placeholder={t("enterEmail")}
      value={mail}
      onChangeText={text => setMail(text)}
      keyboardType="email-address"
      autoCapitalize="none"
      underlineColorAndroid="transparent"
    />
  </View>
  {Email && <Text style={styles.labelError}>{t("emailRequired")}</Text>}
</View>

{/* --- Champ Téléphone --- */}
<View style={styles.fieldContainer}>
  <Text style={[styles.label]}>
    {t("phone")}
  </Text>
  <View style={[
    styles.inputWrapper,
    Etel && styles.inputWrapperError,
    { flexDirection:  "row" } // ✅ inverse en RTL
  ]}>
    <Ionicons 
      name="call-outline" 
      size={22} 
      color="#6c757d" 
      style={{ marginHorizontal: 8 }} 
    />
    <TextInput
      style={[
        styles.textInput,
      
      ]}
      placeholder={t("enterPhone")}
      value={tel}
      onChangeText={text => setTel(text)}
      keyboardType="phone-pad"
      underlineColorAndroid="transparent"
    />
  </View>
  {Etel && <Text style={styles.labelError}>{t("phoneRequired")}</Text>}
</View>

{/* --- Champ Mot de passe --- */}
<View style={styles.fieldContainer}>
  <Text style={[styles.label]}>
    {t("password")}
  </Text>
  <View style={[
    styles.inputWrapper,
    Epassword && styles.inputWrapperError,
    { flexDirection:  "row" } // ✅ inverse
  ]}>
    <Ionicons 
      name="key-outline" 
      size={22} 
      color="#6c757d" 
      style={{ marginHorizontal: 8 }} 
    />
    <TextInput
      style={[
        styles.textInput,
    
      ]}
      placeholder={t("enterPassword")}
      value={password}
      onChangeText={text => setPassword(text)}
      secureTextEntry={passwordSecure}
      underlineColorAndroid="transparent"
    />
    <TouchableOpacity onPress={() => setPasswordSecure(!passwordSecure)}>
      <Ionicons
        name={passwordSecure ? "eye-off-outline" : "eye-outline"}
        size={22}
        style={{ marginRight: -2  , marginLeft:-5 }}
        color="#6c757d"
      />
    </TouchableOpacity>
  </View>
  {Epassword && <Text style={styles.labelError}>{t("passwordRequired")}</Text>}
</View>

{/* --- Champ Confirmer mot de passe --- */}
<View style={styles.fieldContainer}>
  <Text style={[styles.label]}>
    {t("confirmPassword")}
  </Text>
  <View style={[
    styles.inputWrapper,
    Epassword2 && styles.inputWrapperError,
    { flexDirection:"row" }
  ]}>
    <Ionicons 
      name="key-outline" 
      size={22} 
      color="#6c757d" 
      style={{ marginHorizontal: 8 }} 
    />
    <TextInput
      style={[
        styles.textInput,
       
      ]}
      placeholder={t("confirmPasswordPlaceholder")}
      value={cpassword}
      onChangeText={text => setCpassword(text)}
      secureTextEntry={cpasswordSecure}
      underlineColorAndroid="transparent"
    />
    <TouchableOpacity onPress={() => setCasswordSecure(!cpasswordSecure)}>
      <Ionicons
        name={cpasswordSecure ? "eye-off-outline" : "eye-outline"}
        size={22}
        color="#6c757d"
        style={{ marginLeft: -2 }}
      />
    </TouchableOpacity>
  </View>
  {Epassword2 && <Text style={styles.labelError}>{t("confirmPasswordError")}</Text>}
</View>

                  
            
                 
            
                          <ButtonComponent
                    title={t("validateRegister")}
                    press={() => submmit()}
                    isLoading={false}
                  />
                 
            </ScrollView>
          
            
            
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
   dateText: {
    flex: 1,
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 12,
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
    width:220,
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
    width: '95%',
    marginBottom: 20,
    marginLeft:8
  },
   container: {
    flex: 1,
    width:350,
    padding: 20,
  },
  backgroundStyle: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '78%',
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
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 20,
    textAlign: 'left',
    color: COLOR.primary1,
  },
  LabelError: {
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 12,
    textAlign: 'left',
    color: 'red',
  },
  LabelCheckBox: {
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 16,
    textAlign: 'left',
    color: '#000',
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
    paddingBottom: '30%',
  },
  ContentStyle: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    paddingVertical: 10,
    textAlign: 'left',
  },
});

export default InscriptionScreenStep2;
