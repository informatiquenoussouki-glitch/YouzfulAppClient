import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

const ButtonComponent: React.FC<{
  title: string;
  press: Function;
  isLoading: boolean;
  buttonStyle?: object;
}> = ({ title, press, isLoading, buttonStyle }) => {
  return (
    <View style={styles.buttonContainer}>
      <Button
        mode="contained"
        color="#000000"
        loading={isLoading}
        style={[styles.buttonStyle, buttonStyle]} 
        onPress={() => press()}>
        {title}
      </Button>
    </View>  
  );
};

 
const styles = StyleSheet.create({
    buttonContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingBottom: 20,
    },
    buttonStyle: {
        height: 50,
        minWidth: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop:20,
        backgroundColor: '#000000',
    },
});
export default ButtonComponent;
