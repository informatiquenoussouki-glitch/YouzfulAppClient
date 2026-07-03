import React from 'react';
import { ImageBackground, StyleSheet, SafeAreaView, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

const BackgroundLayout: React.FC<Props> = ({ children }) => {
  return (
    <ImageBackground
      source={require('../assets/backgr.png')} // Ton image ici
      style={styles.background}
      resizeMode="cover"
    >
      {/* On peut ajouter un voile transparent pour la lisibilité */}
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {children}
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // voile très léger : l'image est déjà claire/pastel
  },
  container: {
    flex: 1,
  },
});

export default BackgroundLayout;