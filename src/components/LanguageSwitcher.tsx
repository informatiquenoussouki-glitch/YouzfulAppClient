
/*
import React, { useState } from 'react';
import { Modal, View, Pressable, Text, I18nManager } from 'react-native';
import i18n from '../i18n/i18n';
import RNRestart from 'react-native-restart'; // ⚠️ installer avec: npm install react-native-restart

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);

  const setLang = (lng: string) => {
    i18n.changeLanguage(lng);

    if (lng === 'ar') {
      if (!I18nManager.isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
        //RNRestart.Restart(); // redémarre l’app pour appliquer RTL
      }
    } else {
      if (I18nManager.isRTL) {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
        //RNRestart.Restart(); // redémarre pour revenir en LTR
      }
    }

    setOpen(false);
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={{ paddingHorizontal: 12 }}>
        <Text style={{ fontSize: 18 }}>🌐</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setOpen(false)}>
          <View
            style={{
              position: 'absolute',
              top: 54,
              right: 16,
              backgroundColor: '#fff',
              borderRadius: 12,
              paddingVertical: 6,
              minWidth: 180,
            }}
          >
            <Pressable onPress={() => setLang('fr')} style={{ padding: 12 }}>
              <Text>🇫🇷 Français</Text>
            </Pressable>

            <Pressable onPress={() => setLang('en')} style={{ padding: 12 }}>
              <Text>🇬🇧 English</Text>
            </Pressable>

            <Pressable onPress={() => setLang('ar')} style={{ padding: 12 }}>
              <Text>🇸🇦 عربي</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}


  */
import React, { useState } from "react";
import {
  Modal,
  View,
  Pressable,
  Text,
  I18nManager,
  ActivityIndicator,
} from "react-native";
import i18n from "../i18n/i18n";
import RNRestart from "react-native-restart";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ état pour afficher écran "reload"
/* 
  const setLang = async (lng: string) => {
    setLoading(true); // affiche l’écran de loading

    await AsyncStorage.setItem("appLanguage", lng);
    await i18n.changeLanguage(lng);

    if (lng === "ar") {
      I18nManager.forceRTL(true);
    } else {
      I18nManager.forceRTL(false);
    }

    setOpen(false);

    // petite pause pour que le loader s’affiche avant restart
    setTimeout(() => {
      RNRestart.Restart();
    }, 800);
  };
*/
  const setLang = (lng : string) => {
    i18n.changeLanguage(lng); // Persisté via languageDetector.cacheUserLanguage
    setOpen(false);
  };

  return (
    <>
      {/* Bouton principal 🌐 */}
      <Pressable onPress={() => setOpen(true)} style={{ paddingHorizontal: 12 }}>
        <Text style={{ fontSize: 22 }}>🌐</Text>
      </Pressable>

      {/* Menu langues */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
          onPress={() => setOpen(false)}
        >
          <View
            style={{
              position: "absolute",
              top: 54,
              right: 16,
              backgroundColor: "#fff",
              borderRadius: 12,
              paddingVertical: 6,
              minWidth: 180,
            }}
          >
            <Pressable onPress={() => setLang("fr")} style={{ padding: 12 }}>
              <Text style={{ color: "#000", fontSize: 16 }}>🇫🇷  Français</Text>
            </Pressable>

            <Pressable onPress={() => setLang("en")} style={{ padding: 12 }}>
              <Text style={{ color: "#000", fontSize: 16 }}>🇬🇧  English</Text>
            </Pressable>

          </View>
        </Pressable>
      </Modal>

      {/* Loader affiché avant redémarrage */}
      <Modal visible={loading} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 12, fontSize: 16, color: "#333" }}>
            Redémarrage...
          </Text>
        </View>
      </Modal>
    </>
  );
}
