import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ButtonComponent } from "../../components"
import { COLOR } from '../../helpers/functions';
import { settings } from '../../api';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';


const ForgetPasswordScreen = () => {
    const { t } = useTranslation();
      


  const [mail, setMail] = React.useState('');
  const [tel, setTel] = React.useState('');
  const [email, setEmail] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [eTel, setETel] = React.useState(false);
  async function Send() {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (!mail || reg.test(mail) === false) {
      setEmail(true);
    } else {
      setEmail(false);
    }
    if (tel.length < 8) {
      setETel(true);
    } else {
      setETel(false);
    }
    if (tel.length > 7 && reg.test(mail) === true) {
      setIsLoading(true)
      return settings
        .LostPass({ mail, tel })
        .then(async response => {
          if (response) {
            setIsLoading(false)
            setMail("");
            setTel("");
            Toast.show({
              text1:  t("mailSent"),
              type: 'info',
              position: 'top',
            });
          } else {
            setIsLoading(false)
            Toast.show({
              text1: 'Erreur ',
              text2: response.error || response.message,
              type: 'error',
              position: 'top',
            });
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
        });
    }
  }
  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.backgroundStyle}>
          <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center' }}>
                                      <Text style={styles.Title}>{t("forgotPassword")}</Text>
                      
                            {/* --- Champ Adresse email --- */}
                            <View style={styles.fieldContainer}>
                              <Text style={[styles.label]}>{t("emailAddress")}</Text>
                              <View style={[styles.inputWrapper, email && styles.inputWrapperError , { flexDirection:  "row" }]}>
                                <Ionicons name="mail-outline" size={20} color="#6c757d" style={styles.icon} />
                                <TextInput       style={[styles.textInput]}

                                  placeholder={t("enterEmail")}
                                  value={mail}
                                  onChangeText={text => setMail(text)}
                                  underlineColorAndroid="transparent"
                                />
                              </View>
                              {email && <Text style={styles.labelError}>{t("emailRequired")}</Text>}
                            </View>
                      
                            
                      
                            {/* --- Champ Téléphone --- */}
                            <View style={styles.fieldContainer}>
                              <Text style={[styles.label]}>{t("phone")}</Text>
                              <View style={[styles.inputWrapper, eTel && styles.inputWrapperError , { flexDirection:  "row" }]}>
                                <Ionicons name="call-outline" size={20}  style={styles.icon} />
                                <TextInput       style={[styles.textInput]}

                                  placeholder={t("enterPhone")}
                                  value={tel}
                                  onChangeText={text => setTel(text)}
                                  
                                  autoCapitalize="none"
                                  
                                />
                              </View>
                              {eTel && <Text style={styles.labelError}>{t("phoneRequired")}</Text>}
                            </View>
                      
                            <ButtonComponent isLoading={isLoading} title={t("recoverPassword")} press={() => Send()} />  
                          </ScrollView>
       
           
           
        

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  LabelError: {
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 12,
    textAlign: 'left',
    color: 'red',
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
  ContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: '10%',
  }
});

export default ForgetPasswordScreen;
