import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import MainIcon from '../../assets/icons/checkGreen.svg';
import { COLOR } from '../../helpers/functions';

import { useTranslation } from 'react-i18next';


const RestoFinalStep: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {

    const { t } = useTranslation(); // ✅ hook traduction

  const data = useSelector(({ RestaurantReducer }: any) => RestaurantReducer);
  const { address } = route?.params;

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <View style={styles.ContentContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={styles.Title}>{t("paymentSuccess")} </Text>
          <MainIcon width={30} height={30} fill={COLOR.arrow} />
        </View>
        <Text style={styles.Label}>{t("congrats")} </Text>
        <Text style={styles.Label}>{t("restoPreparing")}</Text>
        <Text style={[styles.Label, { textAlign: 'center' }]}>{address},{data?.ville}</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("HistoryStack")} style={{ width: "100%", justifyContent: "center", alignItems: "center", paddingVertical: 10 }}>
        <Text style={[styles.Label, { textAlign: 'center' }]}>{t("seeRequests")}</Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
         
          style={styles.buttonStyle}
          onPress={() => navigation.navigate("Home")}>
          <Text style={styles.buttonText}>
            {t("makeAnotherRequest")}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: 'transparent',
    flex: 1,
  },

  Title: {
    fontSize: 24,
    fontWeight: 'bold',
    
    color: '#000',
    textTransform: 'uppercase',
      marginTop:10,
    textAlign: 'center',
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
    alignItems: 'center', color: '#fff'
  },
  Label: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 20,
    lineHeight: 20,
    textAlign: 'left',
    width: '80%',
    color: COLOR.arrow,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: "center",
    color: "#fff",
  },
  ContentContainer: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 400,
    paddingVertical: 20,
    //   height: 300,
  }
});

export default RestoFinalStep;
