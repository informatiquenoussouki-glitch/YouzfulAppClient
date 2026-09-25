import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StackNav } from "./stack";
import { useSelector, useDispatch } from 'react-redux';
import { ChangeColor } from "../redux/actions/Signin";
import { COLOR } from "../helpers/functions";
import { startAdminMessagesPoller, stopAdminMessagesPoller } from '../helpers/adminMessagesPoller';
import { initNotifications } from '../helpers/notifications';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
    card: 'transparent',
  },
};

const Main: React.FC<{}> = () => {
  const dispatch = useDispatch();
  const userToken = useSelector(
    ({ userReducer }: any) => userReducer.token
  );
  React.useEffect(() => {
    dispatch(ChangeColor(COLOR.primary1));
    if (userToken) {
      startAdminMessagesPoller(userToken);
      const cleanupFcm = initNotifications(userToken, null);
      return () => { stopAdminMessagesPoller(); cleanupFcm(); };
    } else {
      stopAdminMessagesPoller();
    }
    return () => stopAdminMessagesPoller();
  }, [userToken]);
  return (
    <NavigationContainer theme={navigationTheme}>
      <StackNav />
    </NavigationContainer>
  );
}
export default Main;