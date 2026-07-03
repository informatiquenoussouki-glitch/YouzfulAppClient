import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Divider, ActivityIndicator } from 'react-native-paper';
import DrawerBottom from '../../components/DraweBottom';
import { WebView } from 'react-native-webview';
import MenuDrawer from 'react-native-side-drawer';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import DrawerItem from '../../components/DraweItem';
import MainIcon from '../../assets/icons/youzful.svg';
import Menu from '../../assets/icons/menu.svg';
import CloseIcon from '../../assets/icons/closeDrawer.svg';
import { COLOR } from '../../helpers/functions';
import i18n from '../../i18n/i18n';
const LegalScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    

  const [drawerOpen, setDrawerOpen] = useState(false);
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
            title={'Informations personnelles'}
            press={() => navigation.navigate('Profile')}
          />
          <DrawerItem
            selected={false}
            title={'Moyens de paiements'}
            press={() => navigation.navigate('PaymentScreen')}
          />
          <DrawerItem
            selected={false}
            title={'Aide'}
            press={() => navigation.navigate('Intro')}
          />
          <DrawerItem
            selected={true}
            title={'Mentions légales'}
            press={() => setDrawerOpen(!drawerOpen)}
          />
          <Divider style={styles.divider} />
          <DrawerItem
            selected={false}
            title={'Modifier le mot de passe'}
            press={() => navigation.navigate('PasswordScreen')}
          />
          <DrawerItem
            selected={false}
            title={'Déconnexion'}
            press={() => navigation.navigate('DisconnectScreen')}
          />

          <DrawerItem
            selected={false}
            title={'Supprimer mon compte'}
            press={() => navigation.navigate('DeleteAccount')}
          />
        </View>
        <DrawerBottom />
      </View>
    );
  }
  return (
    <SafeAreaView style={{ backgroundColor: 'transparent', flex: 1 }}>
     <MenuDrawer
        open={drawerOpen}
          position={ "right"}   // 🔄 inversion position menu
          drawerContent={drawerContent()}
          drawerPercentage={75}
          animationTime={250}
          overlay={false}
          opacity={0.4}>
        <View style={[styles.headerStyle, { flexDirection: "row" }]}>
              {/* Logo + titre */}
              <View style={{ flexDirection: "row", alignItems: 'center', marginTop: 25 }}>
                
              </View>


              {/* Bouton menu */}
              <TouchableOpacity onPress={() => setDrawerOpen(true)} style={{ marginTop: 15 }}>
                <Menu width={35} height={35} fill={COLOR.primary1} />
              </TouchableOpacity>
          </View>
        <WebView source={{ uri: 'https://youz-ful.com/' }}
          style={{ margin: 20, justifyContent: "center", alignItems: "center" }}
          onLoad={() => <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator animating={true} color={'#1034A6'} />
          </View>}
        />
      </MenuDrawer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Title: {
    fontSize: 26,
    fontWeight: '700',
    paddingBottom: 40,
    paddingHorizontal: 15,
    textAlign: 'center',
    color: COLOR.primary1,
  },
  Container: {
    backgroundColor: Colors.white,
    justifyContent: 'center',
    paddingTop: 20,
  },
  ContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
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
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 12,
    textAlign: 'center',
    color: 'red',
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
  Label: {
    fontSize: 16,
    fontWeight: '400',
    paddingVertical: 5,
    lineHeight: 20,
    textAlign: 'left',
    color: COLOR.primary1,
  },
});

export default LegalScreen;
