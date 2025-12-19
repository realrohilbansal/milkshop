import React from "react";
import { TextInput, useColorScheme } from "react-native";
import { Colors } from "../constants/theme";

export default function ThemedTextInput({ style, ...props }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  return (
    <TextInput
      placeholderTextColor={theme.placeholder ?? "#999"}
      style={[
        {
          backgroundColor: theme.uiBackground ?? "#fff",
          color: theme.text ?? "#000",
          padding: 12,
          borderRadius: 6,
        },
        style,
      ]}
      {...props}
    />
  );
}
