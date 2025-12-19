import React from "react";
import { Dimensions, Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { Colors } from "../constants/theme";
import ThemedText from "./ThemedText";

function ThemedButton({
  style,
  children,
  disabled = false,
  onPress,
  variant = "primary",
  size = "full",
  ...props
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const semantic = {
    primary: theme.tint ?? Colors.info,
    secondary: theme.uiBackground ?? "#f3f4f6",
    danger: Colors.danger ?? Colors.warning,
  }[variant];

  const background = disabled ? Colors.disabled : semantic;
  const textColor =
    variant === "secondary" ? theme.text : theme.buttonText ?? "#ffffff";

  const sizeStyle =
    size === "icon"
      ? styles.icon
      : size === "sm"
      ? styles.small
      : size === "tile"
      ? styles.tile
      : styles.full;

  const isElement = React.isValidElement(children);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        sizeStyle,
        {
          backgroundColor: background,
          opacity: pressed ? 0.92 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      {...props}
    >
      {isElement ? (
        children
      ) : (
        <View style={styles.textWrapper}>
          {Array.isArray(children) ? (
            children
          ) : (
            <ThemedText style={[styles.label, { color: textColor }]}>
              {children}
            </ThemedText>
          )}
        </View>
      )}
    </Pressable>
  );
}

const screenWidth = Dimensions.get("window").width;
const tileSize = screenWidth * 0.40;

const styles = StyleSheet.create({
  full: {
    width: "100%",
    paddingVertical: Colors.spacing.xl,
    borderRadius: Colors.radius.lg,
    marginVertical: Colors.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    ...Colors.shadow.medium,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Colors.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 0,
    ...Colors.shadow.subtle,
  },
  tile: {
    width: tileSize,
    height: tileSize,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    marginVertical: 10,
    ...Colors.shadow.medium,

  },
  label: {
    fontWeight: "600",
    fontSize: Colors.typography.subheading,
  },
});

export default ThemedButton;
