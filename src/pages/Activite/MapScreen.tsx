import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function MapScreen({ route }) {
  const { location } = route.params;
  const { latitude, longitude } = location;

  return (
    <WebView
      style={{ flex: 1 }}
      source={{
        uri: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`
      }}
    />
  );
}
