import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ButtonComponent } from '../../components';
import MainIcon from '../../assets/icons/validate.svg';
import { COLOR } from '../../helpers/functions';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useTranslation } from 'react-i18next';


const InscriptionScreenStep3: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.backgroundStyle}>
        <View style={styles.ContentContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={styles.Title}>{t("congratulation")}</Text>
            <Ionicons name="checkmark-outline" size={50} color="#000"  />
          </View>
          <Text style={styles.ContentStyle}>{t("registrationSuccess")}</Text>
          <Text style={styles.ContentStyle}>
            {t("enjoyExperience")}
          </Text>
        </View>
      </ScrollView>
      <ButtonComponent
        title={t("makeFirstRequest")}
        press={() => navigation.navigate("HistoryStack")}
        isLoading={false}

      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    icon: {
    marginRight: 10,
    fontWeight: '1000',
  
  },
  backgroundStyle: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '80%',
  },
  Title: {
    fontSize: 26,
    fontWeight: '700', 
    color: COLOR.gris,
    textAlign: 'center',
    marginLeft:50

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
  LabelCheckBox: {
    fontSize: 14,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 16,
    textAlign: 'left',
    color: '#132661',
  },
  ContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 400,
    paddingVertical: 20,
    //   height: 300,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: '10%',
  },
 ContentStyle: {
  paddingHorizontal: 20,
  fontSize: 18, 
  fontWeight: '600', 
  lineHeight: 28,
  paddingVertical: 15, 
  textAlign: 'center',
  fontFamily: 'Lato-Bold', 
  color: '#2c3e50', 
  letterSpacing: 0.5, 
},
});

export default InscriptionScreenStep3;
