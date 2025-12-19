import React from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "../constants/theme";

export default function ThemedTileFill({ children, style }) {
  return (
    <View style={[styles.fill, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: "100%",
    padding: Colors.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
});
