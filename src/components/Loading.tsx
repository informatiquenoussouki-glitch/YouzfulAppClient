import React from 'react';
import { View } from "react-native"
import { Button, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Loading: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [firstTime, setFirstTime] = React.useState(false)
    React.useEffect(() => {
        async function getVal() {
            try {
                const value = await AsyncStorage.getItem('@firstTime')
                if (value !== null) {
                    setFirstTime(true);
                    navigation.replace("BottomTabs");
                } else navigation.replace("Intro");

            } catch (e) {
                navigation.replace("Intro");
                setFirstTime(false);
                // error reading value
            }
        }

        getVal()
    }, [])
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Button icon="" mode="text" loading={true}>
                Loading...
                <ActivityIndicator animating={true} color={"#000"} />
            </Button>
        </View>
    );
}
export default Loading;