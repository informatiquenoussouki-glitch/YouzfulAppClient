import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import MainIcon from '../../assets/icons/youzful.svg';
import Bloc1 from '../../assets/icons/bloc1.svg';
import Bloc2 from '../../assets/icons/bloc2.svg';
import Bloc3 from '../../assets/icons/bloc3.svg';
import { COLOR } from '../../helpers/functions';
import { useTranslation } from "react-i18next";


const PageTowScreen = () => {
    const { t } = useTranslation();

    const backgroundStyle = {
        backgroundColor: Colors.white,
    };

    return (
        <SafeAreaView style={backgroundStyle}>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={backgroundStyle}>
                <View
                    style={{
                        backgroundColor: Colors.white,
                        alignItems: 'center',
                    }}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', marginTop:25 , marginLeft:-250}}>
                                                            <Image
                                                              source={require('../../assets/logoY.png')}
                                                              style={{
                                                                width: 30,
                                                                height: 30,
                                                                marginRight: 8,
                                                              }}
                                                            />
                                                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#000000' }}>
                                                              YouzFul
                                                            </Text>
                                                          </View>
                    <Text style={styles.Title}>{t("title1")}</Text>
                    <View style={styles.ContentContainer}>
                        <Text adjustsFontSizeToFit={true} style={styles.ContentStyle}>
                            {t("line11")}                        </Text>
                    </View>
                    <View style={{ paddingTop: 25 }}>
                        <Bloc1 width={300} height={100} />
                        <Bloc2 width={300} height={100} />
                        <Bloc3 width={300} height={100} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    Title: {
        fontSize: 26,
        fontWeight: '700',
        paddingVertical: 15,
        paddingHorizontal: 15,
        color: '#000000',
    },
    ContentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        //   height: 300,
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

export default PageTowScreen;
