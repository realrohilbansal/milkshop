// components/ThemedRow.jsx
import React from "react";
import { StyleSheet, View } from "react-native";

/**
 * ThemedRow — a neutral layout wrapper for horizontal rows.
 * Keeps API consistent (themed component) while being visually transparent.
 */
export default function ThemedRow({ style, children, ...props }) {
  return (
    <View style={[styles.row, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
