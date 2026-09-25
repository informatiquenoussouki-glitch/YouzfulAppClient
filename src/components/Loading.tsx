import React from 'react';

import { View } from "react-native";

import { Button, ActivityIndicator } from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSelector } from 'react-redux';

const Loading: React.FC<{ navigation: any }> = ({ navigation }) => {

    const [firstTime, setFirstTime] = React.useState(false);

    // Récupération du token utilisateur depuis Redux
    const userToken = useSelector(
        (state: any) => state.userReducer?.token
    );

    React.useEffect(() => {

        async function getVal() {

            try {

                const value = await AsyncStorage.getItem('@firstTime');

                // L'utilisateur est connecté
                if (userToken) {

                    setFirstTime(true);

                    navigation.replace("BottomTabs");

                    return;
                }

                // L'utilisateur n'est PAS connecté
                if (value !== null) {

                    setFirstTime(true);

                    // Il a déjà vu l'introduction,
                    // mais il n'est pas connecté.
                    navigation.replace("LoginScreen");

                    return;
                }

                // Première ouverture de l'application
                navigation.replace("Intro");

            } catch (e) {

                // En cas d'erreur, on ne donne surtout pas accès
                // à l'accueil sans connexion.
                navigation.replace("Intro");

                setFirstTime(false);

                console.log(
                    "Erreur lors de la vérification de l'utilisateur :",
                    e
                );
            }
        }

        getVal();

    }, [userToken]);

    return (

        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}
        >

            <Button
                icon=""
                mode="text"
                loading={true}
            >
                Loading...

                <ActivityIndicator
                    animating={true}
                    color={"#000"}
                />

            </Button>

        </View>
    );
}

export default Loading;