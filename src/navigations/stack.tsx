import React from 'react';
import { 
    View, 
    Alert, 
    BackHandler, 
    TouchableOpacity, 
    Text, 
    Image, 
    Platform, 
    LogBox 
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";
import Icon from 'react-native-vector-icons/FontAwesome'; 

// --- IMPORTATIONS DES COMPOSANTS ET HELPERS ---
import Headerd from './headerd';
import Loading from '../components/Loading';
import BottomTabs from './BottomTab';
import { COLOR } from '../helpers/functions';
import ArrowBack from '../assets/icons/ArrowBack.svg';
import LanguageSwitcher from '../components/LanguageSwitcher';

// --- IMPORTATIONS DES PAGES ---
// Authentification et Profil
import LoginScreen from '../pages/Login';
import ForgetPasswordScreen from '../pages/ForgetPassword';
import InscriptionScreen from '../pages/Inscription';
import InscriptionScreenStep2 from '../pages/Inscription/Step2';
import InscriptionScreenStep3 from '../pages/Inscription/Step3';
import ProfileScreen from '../pages/Profile';
import ContactAdminScreen from '../pages/ContactAdmin';
import PasswordScreen from '../pages/password';
import DeleteAccount from '../pages/DeleteAccout';
import Disconnect from '../pages/Disconnect';
import PaymentScreen from '../pages/Payment';
import LegalScreen from '../pages/Legal';

// Accueil et Historique
import Intro from '../pages/Intro';
import HomeScreen from '../pages/Home';
import HistoryScreen from '../pages/History';
import HistoryScreenDetails from '../pages/History/Details';

// Services (BabySitter, Guide, Resto, Activités, Transfert)
import BabySitterScreen from '../pages/BabySitter';
import BabySitterScreenStep2 from '../pages/BabySitter/Step2';
import BabySitterScreenStep3 from '../pages/BabySitter/Step3';
import BabySitterScreenRecap from '../pages/BabySitter/recap';
import BabySitterFinalStep from '../pages/BabySitter/finalStep';

import GuideScreen from '../pages/Guide';
import GuideStep2 from '../pages/Guide/Step2';
import GuideRecap from '../pages/Guide/recap';
import GuideFinalStep from '../pages/Guide/finalStep';

import RestoScreen from '../pages/Restaurant';
import RestoStep2 from '../pages/Restaurant/Step2';
import RestoStep3 from '../pages/Restaurant/step3';
import Panier from '../pages/Restaurant/Panier';
import RestoFinalStep from '../pages/Restaurant/finalStep';

import ActiviteScreen from "../pages/Activite";
import ActivityListScreen from '../pages/Activite/ActivityList';
import ActivityDetailScreen from '../pages/Activite/ActivityDetail';
import CalendarScreen from '../pages/Activite/CalendarScreen';
import CheckoutScreen from '../pages/Activite/CheckoutScreen';
import MapScreen from '../pages/Activite/MapScreen';

import TransfertScreen from '../pages/Transfet';
import TransfertRecap from '../pages/Transfet/recap';

// --- CONFIGURATION INITIALE ---
LogBox.ignoreLogs(['ViewPropTypes will be removed', "right operand of 'in' is not an object"]);
const Stack = createNativeStackNavigator();
const transparentScreen = { contentStyle: { backgroundColor: 'transparent' } };

// --- FONCTIONS UTILITAIRES ---
function handleBackButton() {
    Alert.alert("Quitter l'application", '', [
        {
            text: 'Annuler',
            onPress: () => null,
            style: 'cancel',
        },
        { text: 'quitter', onPress: () => BackHandler.exitApp() },
    ]);
    return true;
}

// --- COMPOSANT HEADER PERSONNALISÉ ---
const Header = (props: any) => {
    return (
        <View
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
                height: 55,
                paddingHorizontal: 15,
                marginTop: Platform.OS === 'ios' ? 40 : 1,
            }}>
            {props.back ? (
                <TouchableOpacity onPress={() => props.navigation.goBack()}>
                    <ArrowBack
                        height={15}
                        fill={props?.options?.headerTintColor}
                        style={{ marginLeft: -9 }}
                    />
                </TouchableOpacity>
            ) : (
                <View style={{ paddingLeft: 15 }} />
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -230 }}>
                <Image
                    source={require('../assets/logoY.png')}
                    style={{
                        width: 40,
                        height: 40,
                        marginRight: 8,
                    }}
                />
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#000000' }}>
                    YouzFul
                </Text>
            </View>
            <View style={{ width: 30 }} />
        </View>
    );
};

// --- STACK ACTIVITE ---
const ActiviteStack: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Stack.Navigator screenOptions={transparentScreen}>
            <Stack.Screen name="Activite" component={ActiviteScreen} options={{ title: t("activité"), headerShown: true }} />
            <Stack.Screen name="ActivityList" component={ActivityListScreen} options={{ title: t("actJeddah"), headerShown: true }} />
            <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} options={{ title: t("actDetail"), headerShown: true }} />
            <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{ title: t("selectdate"), headerShown: true }} />
            <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} options={{ title: t("Checkout"), headerShown: true }} />
            <Stack.Screen name="MapScreen" component={MapScreen} options={{ title: t("MapScreen"), headerShown: true }} />
        </Stack.Navigator>
    );
};

// --- STACK TRANSFERT ---
const TransfertStack: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Stack.Navigator screenOptions={transparentScreen}>
            <Stack.Screen name="Transferts" component={TransfertScreen} options={{ title: t("transport"), headerShown: true }} />
            <Stack.Screen name="TransfertRecap" component={TransfertRecap} options={{ title: t("recapTitle") || "Récapitulatif" }} />
        </Stack.Navigator>
    );
};

// --- STACK BABYSITTER ---
const BabySitterStack: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Stack.Navigator initialRouteName="BabySitterScreen" screenOptions={{ ...transparentScreen, headerShown: true }}>
            <Stack.Screen name="BabySitterScreen" component={BabySitterScreen} options={{ title: t("Babysitter") }} />
            <Stack.Screen name="BabySitterScreenStep2" component={BabySitterScreenStep2} options={{ title: t("Babysitter2") }} />
            <Stack.Screen name="BabySitterScreenStep3" component={BabySitterScreenStep3} options={{ title: t("Babysitter3") }} />
            <Stack.Screen name="BabySitterScreenRecap" component={BabySitterScreenRecap} options={{ title: t("recapTitle") }} />
            <Stack.Screen name="BabySitterFinalStep" component={BabySitterFinalStep} options={{ title: t("confirmationTitle") }} />
        </Stack.Navigator>
    );
};

// --- STACK GUIDE ---
const GuideStack: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Stack.Navigator initialRouteName="GuideScreen" screenOptions={{ ...transparentScreen, headerShown: true }}>
            <Stack.Screen name="GuideScreen" component={GuideScreen} options={{ title: t("guideTitle") }} />
            <Stack.Screen name="GuideStep2" component={GuideStep2} options={{ title: t("guidestep2") }} />
            <Stack.Screen name="GuideRecap" component={GuideRecap} options={{ title: t("recapTitle") }} />
            <Stack.Screen name="GuideFinalStep" component={GuideFinalStep} options={{ title: t("confirmationTitle") }} />
        </Stack.Navigator>
    );
};

// --- STACK RESTAURANT ---
const RestorantStack: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Stack.Navigator initialRouteName="RestoScreen" screenOptions={{ ...transparentScreen, headerShown: true }}>
            <Stack.Screen name="RestoScreen" component={RestoScreen} options={{ title: t("restaurant") }} />
            <Stack.Screen name="RestoStep2" component={RestoStep2} options={{ title: t("chooseDish") }} />
            <Stack.Screen name="RestoStep3" component={RestoStep3} options={{ title: t("dishDetails") }} />
            <Stack.Screen name="Panier" component={Panier} options={{ title: t("cartTitle") }} />
            <Stack.Screen name="RestoFinalStep" component={RestoFinalStep} options={{ title: t("confirmationTitle") }} />
        </Stack.Navigator>
    );
};

// --- STACK PRINCIPAL (NAVIGATEUR RACINE) ---
const StackNav: React.FC<{}> = () => {
    return (
        <Stack.Navigator
            initialRouteName="Loading"
            screenOptions={{
                headerShown: false,
                headerTintColor: 'white',
            }}>
<Stack.Screen
    name="Loading"
    component={Loading}
    options={{ presentation: 'transparentModal' }}
/>

<Stack.Screen
    name="Intro"
    component={Intro}
    options={{ presentation: 'transparentModal' }}
/>

<Stack.Screen
    name="LoginScreen"
    component={LoginScreen}
    options={{ header: props => <Header {...props} /> }}
/>

<Stack.Screen
    name="InscriptionScreen"
    component={InscriptionScreen}
    options={{ header: props => <Header {...props} /> }}
/>

<Stack.Screen
    name="InscriptionScreenStep2"
    component={InscriptionScreenStep2}
    options={{ header: props => <Header {...props} /> }}
/>

<Stack.Screen
    name="InscriptionScreenStep3"
    component={InscriptionScreenStep3}
    options={{ header: props => <Header {...props} /> }}
/>

<Stack.Screen
    name="BottomTabs"
    component={BottomTabs}
    options={{ presentation: 'transparentModal' }}
/>
        </Stack.Navigator>
    );
};

// --- STACK ACCUEIL (HOME) ---
const HomeStack: React.FC<{}> = () => {
    const { t } = useTranslation();
    return (
        <Stack.Navigator initialRouteName="YouzFul" screenOptions={transparentScreen}>
            <Stack.Screen
                name="YouzFul"
                component={HomeScreen}
                listeners={{
                    focus: () => BackHandler.addEventListener('hardwareBackPress', handleBackButton),
                    blur: () => BackHandler.removeEventListener('hardwareBackPress', handleBackButton),
                }}
                options={{
                    headerTitle: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image source={require('../assets/logoY.png')} style={{ width: 40, height: 40, marginRight: 8 }} />
                            <Text style={{ fontSize: 22, fontWeight: 'bold', color: "#000000" }}>YouzFul</Text>
                        </View>
                    ),
                    headerShadowVisible: false,
                    headerRight: () => <LanguageSwitcher />
                }}
            />
            <Stack.Screen name={t("activité")} component={ActiviteStack} options={{ headerShown: false }} />
            <Stack.Screen name={t("transport")} component={TransfertStack} options={{ headerShown: false }} />
            <Stack.Screen name={t("babysitting")} component={BabySitterStack} options={{ headerShown: false }} />
            <Stack.Screen name={t("guide")} component={GuideStack} options={{ headerShown: false }} />
            <Stack.Screen name={t("restaurant")} component={RestorantStack} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

// --- STACK PROFIL ---
const ProfileStack: React.FC<{}> = () => {
    const userData = useSelector((state: any) => state.userReducer);
    const hasToken = userData && typeof userData === 'object' && userData.token;

    return (
        <Stack.Navigator initialRouteName="Profile" screenOptions={transparentScreen}>
            {hasToken ? (
                <>
                    <Stack.Screen 
                        name="Profile" 
                        component={ProfileScreen} 
                        options={{ headerShown: false }} 
                        listeners={{
                            focus: () => BackHandler.addEventListener('hardwareBackPress', handleBackButton),
                            blur: () => BackHandler.removeEventListener('hardwareBackPress', handleBackButton),
                        }}
                    />
                    <Stack.Screen name="InscriptionScreenStep3" component={InscriptionScreenStep3} />
                    <Stack.Screen name="DisconnectScreen" component={Disconnect} options={{ headerShown: false }} />
                    <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="LegalScreen" component={LegalScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="PasswordScreen" component={PasswordScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="DeleteAccount" component={DeleteAccount} options={{ headerShown: false }} />
                    <Stack.Screen name="ContactAdminScreen" component={ContactAdminScreen} options={{ title: '' }} />
                </>
            ) : (
                <>
                    <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ header: props => <Header {...props} /> }} />
                    <Stack.Screen name="ForgetPasswordScreen" component={ForgetPasswordScreen} options={{ header: props => <Header {...props} /> }} />
                    <Stack.Screen name="InscriptionScreen" component={InscriptionScreen} options={{ header: props => <Header {...props} /> }} />
                    <Stack.Screen name="InscriptionScreenStep2" component={InscriptionScreenStep2} options={{ header: props => <Header {...props} /> }} />
                    <Stack.Screen name="InscriptionScreenStep3" component={InscriptionScreenStep3} options={{ header: props => <Header {...props} /> }} />
                </>
            )}
        </Stack.Navigator>
    );
};

// --- STACK HISTORIQUE ---
const HistoryStack: React.FC<{}> = () => {
    const { t } = useTranslation();
    return (
        <Stack.Navigator initialRouteName="History" screenOptions={transparentScreen}>
            <Stack.Screen
                name={t("historyTab")}
                component={HistoryScreen}
                options={{
                    header: () => <Headerd title="Mes demandes" />,
                }}
                listeners={{
                    focus: () => BackHandler.addEventListener('hardwareBackPress', handleBackButton),
                    blur: () => BackHandler.removeEventListener('hardwareBackPress', handleBackButton),
                }}
            />
            <Stack.Screen name={t("details")} component={HistoryScreenDetails} options={{ title: t("details"), headerShown: true }} />
        </Stack.Navigator>
    );
};

export { StackNav, HomeStack, ProfileStack, HistoryStack };