import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StackNav } from "./stack";
import { useSelector, useDispatch } from 'react-redux';
import { ChangeColor } from "../redux/actions/Signin";
import { COLOR } from "../helpers/functions";

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
  }, [userToken]);
  return (
    <NavigationContainer theme={navigationTheme}>
      <StackNav />
    </NavigationContainer>
  );
}
export default Main;