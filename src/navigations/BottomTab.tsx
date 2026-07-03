import React from 'react';
import { Image, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';

import { useTranslation } from 'react-i18next';
// Your stack navigators
import { HistoryStack, HomeStack, ProfileStack } from './stack';



const Tab = createBottomTabNavigator();

const BottomTabs: React.FC<{}> = () => {

    const { t } = useTranslation();

  const defaultColor = useSelector(({ userReducer }: any) => userReducer.defaultColor);

  return (
    <Tab.Navigator
      initialRouteName="HomeStack"
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true,
        tabBarStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          height: Platform.OS === 'ios' ? 80 : 60,
          borderTopWidth: 0.5,
          borderTopColor: '#ddd',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: Platform.OS === 'ios' ? 5 : 2,
        },
        tabBarActiveTintColor: '#000', // black for active label
        tabBarInactiveTintColor: '#888', // grey for inactive label
      }}
    >
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          tabBarLabel: t("homeTab"),
          tabBarIcon: ({ focused }) => (
          /*  <Image
              source={HomeImg}
              style={{
                width: 24,
                height: 24,
                marginBottom: 2,
                resizeMode: 'contain',
                tintColor: focused ? undefined : undefined, // keep original colors
              }}
            /> */
            <Icon
              name="home"
              size={24}
              color={focused ? '#000' : '#888'}
              style={{ marginBottom: 2 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="HistoryStack"
        component={HistoryStack}
        options={{
          tabBarLabel: t("historyTab"),
          tabBarIcon: ({ focused }) => (
          /*  <Image
              source={DemandeImg}
              style={{
                width: 24,
                height: 24,
                marginBottom: 2,
                resizeMode: 'contain',
                tintColor: focused ? undefined : undefined, // keep original colors
              }}
            /> */
            <Icon
              name="inbox"
              size={24}
              color={focused ? '#000' : '#888'}
              style={{ marginBottom: 2 }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileStack"
        component={ProfileStack}
        options={{
          tabBarLabel: t("profileTab"),
          tabBarIcon: ({ focused }) => (
          /*  <Image
              source={ParamImg}
              style={{
                width: 24,
                height: 24,
                marginBottom: 2,
                resizeMode: 'contain',
                tintColor: focused ? undefined : undefined, // keep original colors
              }}
            />*/
            <Icon
              name="cog"
              size={24}
              color={focused ? '#000' : '#888'}
              style={{ marginBottom: 2 }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
