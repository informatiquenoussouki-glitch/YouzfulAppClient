import React from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    Animated,
    Dimensions,
} from 'react-native';
import { Button } from 'react-native-paper';
import PagerView, {
    PagerViewOnPageScrollEventData,
} from 'react-native-pager-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SlidingDot } from 'react-native-animated-pagination-dots';
import PageOneScreen from './pageOne';
import PageTowScreen from './pageTwo';
import PageThreeScreen from './pageThree';
import PageFourScreen from './pageFour';
import { COLOR } from '../../helpers/functions';
import { useTranslation } from "react-i18next";


const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

const INTRO_DATA = [
    {
        key: '1',
    },
    {
        key: '2',
    },
    {
        key: '3',
    },
    {
        key: '4',
    },
];

const Intro: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { t } = useTranslation();

    const width = Dimensions.get('window').width;
    const [index, selectedIndex] = React.useState(0)
    const ref = React.useRef<PagerView>(null);
    const scrollOffsetAnimatedValue = React.useRef(new Animated.Value(0)).current;
    const positionAnimatedValue = React.useRef(new Animated.Value(0)).current;
    const inputRange = [0, 4];
    const scrollX = Animated.add(
        scrollOffsetAnimatedValue,
        positionAnimatedValue,
    ).interpolate({
        inputRange,
        outputRange: [0, 4 * width],
    });

    const onPageScroll = React.useMemo(
        () =>
            Animated.event<PagerViewOnPageScrollEventData>(
                [
                    {
                        nativeEvent: {
                            offset: scrollOffsetAnimatedValue,
                            position: positionAnimatedValue,
                        },
                    },
                ],
                {
                    useNativeDriver: false,
                },
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );
    async function setVal() {
        try {
            await AsyncStorage.setItem(
                '@firstTime',
                'True'
            ).then(() => {
                navigation.replace("BottomTabs");
            })
        } catch (e) {
            // error reading value
        }
    }

    return (
        <SafeAreaView style={styles.flex}>
            <AnimatedPagerView
                initialPage={0}
                ref={ref}
                style={styles.PagerView}
                onPageSelected={(e) => { selectedIndex(e.nativeEvent.position) }}
                onPageScroll={onPageScroll}>
                <PageOneScreen key={'0'} />
                <PageTowScreen key={'1'} />
                <PageThreeScreen key={'3'} />
                <PageFourScreen key={'4'} />
            </AnimatedPagerView>
            {index < 3 ?
                <View style={styles.dotsContainer}>

                    <SlidingDot
                        marginHorizontal={3}
                        containerStyle={{ marginTop: 10 }}
                        data={INTRO_DATA}
                        //@ts-ignore
                        scrollX={scrollX}
                        dotSize={12}
                    />
                </View> :
                <View style={styles.buttonContainer}>
                    <Button mode="contained" color={COLOR.gris} style={styles.buttonStyle} onPress={() => setVal()}>
                          {t("understood")}

                    </Button>
                </View>
            }
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    PagerView: {
        flex: 1,
    },
    buttonContainer: { width: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#fff", paddingBottom: 20 },
    buttonStyle: { height: 50, width: 200, alignItems: "center", justifyContent: "center" },
    container: {
        flexDirection: 'row',
        backgroundColor: '#63a4ff',
    },
    progressContainer: { flex: 0.1, backgroundColor: '#63a4ff' },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        padding: 20,
    },
    text: {
        fontSize: 30,
    },
    separator: {
        paddingVertical: 16,
        paddingHorizontal: 10,
    },
    touchableTitle: {
        textAlign: 'center',
        color: '#000',
    },
    touchableTitleActive: {
        color: '#fff',
    },
    dotsContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        paddingBottom: 10,
        backgroundColor: '#fff',
    },
    dotContainer: {
        justifyContent: 'center',
        alignSelf: 'center',
    },
    contentSlider: {
        flex: 1,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    dots: {
        flex: 1,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 310,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        margin: 5,
    },
});
export default Intro;