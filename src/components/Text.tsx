/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

 import React from 'react';
 import {
   StyleSheet,
   Text,
 } from 'react-native'; 
 const StyledText: React.FC<{
   title: string;
   Style:Object
 }> = ({Style, title}) => {
   return (
    <Text
    style={[
      styles.Text,
      Style
    ]}>
    {title}
  </Text>
   );
 };

 const styles = StyleSheet.create({
    Text: {
     fontFamily: "Mulish-Regular",
   },
 });
 
 export default StyledText;
 