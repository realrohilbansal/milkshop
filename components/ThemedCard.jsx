// components/ThemedCard.jsx
import React from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { Colors } from "../constants/theme";

/**
 * Props:
 *  - pressable: boolean (if true, card becomes clickable)
 *  - onPress: function
 *  - style: custom styles
 *  - children
 */
export default function ThemedCard({ pressable = false, onPress, style, children, ...props }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const CardContainer = pressable ? Pressable : View;  // <-- IMPORTANT

  return (
    <CardContainer
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        style,
      ]}
      onPress={pressable ? onPress : undefined}
      {...props}
    >
      {children}
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
});
