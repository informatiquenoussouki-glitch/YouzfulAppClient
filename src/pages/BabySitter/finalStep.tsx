import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { ButtonComponent } from '../../components';
import MainIcon from '../../assets/icons/checkC2.svg';
import { COLOR } from '../../helpers/functions';
import { useTranslation } from 'react-i18next';

const BabySitterFinalStep: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <View style={styles.ContentContainer}>
        {/* --- Icône et Titre de succès --- */}
        <View style={styles.successHeader}>
          <Text style={styles.Title}>{t("paymentSuccess")}</Text>
          <MainIcon width={35} height={35} fill={COLOR.arrow} style={styles.icon} />
        </View>

        {/* --- Messages de confirmation --- */}
        <Text style={styles.Label}>{t("congratulations")} </Text>
        <Text style={[styles.Label, { marginTop: -15 }]}>
          {t("babysitterContact")}
        </Text>

        {/* --- Lien vers l'historique --- */}
        <TouchableOpacity 
          onPress={() => navigation.navigate("HistoryStack")} 
          style={styles.linkContainer}
        >
          <Text style={styles.linkLabel}>{t("seeMyRequests")}</Text>
        </TouchableOpacity>
      </View>

      {/* --- Bouton d'action principal --- */}
      <View style={styles.footer}>
        <ButtonComponent
          title={t("makeAnotherRequest")}
          press={() => navigation.navigate("YouzFul")}
          isLoading={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  ContentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
    width: '100%',
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  Title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  icon: {
    marginLeft: 10,
  },
  Label: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 15,
    lineHeight: 22,
    textAlign: 'center',
    width: '85%',
    color: '#475569', // Couleur plus douce pour le message
  },
  linkContainer: {
    marginTop: 30,
    paddingVertical: 15,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  linkLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  // Gardés pour compatibilité si nécessaire ailleurs
  buttonStyle: {
    height: 50,
    width: 250,
    backgroundColor: '#000000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BabySitterFinalStep;