// components/LargeGlassButton.jsx
import { BlurView } from "expo-blur";
import { Link } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { Colors } from "../constants/theme";
import ThemedText from "./ThemedText";

/**
 * LargeGlassButton
 * Props:
 * - title (string) - main centered text inside the button
 * - subtitle (string, optional) - small text under title (optional)
 * - href (string) OR onPress (fn)
 * - style (object) - extra style for container
 * - accessibilityLabel (string)
 */
export default function LargeGlassButton({ title, subtitle, href, onPress, style, accessibilityLabel }) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const base = theme.card ?? theme.uiBackground ?? "#ffffff";
  const bgAlpha = colorScheme === "dark" ? 0.12 : 0.44;
  const bg = hexToRgba(base, bgAlpha);
  const border = hexToRgba(theme.border ?? "#e5e5e5", colorScheme === "dark" ? 0.18 : 0.45);
  const titleColor = colorScheme === "dark" ? "#fff" : "#111827";
  const subtitleColor = colorScheme === "dark" ? "rgba(255,255,255,0.78)" : "#6b7280";

  const Content = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: Platform.OS === "android" ? bg : undefined, borderColor: border },
        pressed && styles.pressed,
        style,
      ]}
    >
      {Platform.OS !== "android" ? <BlurView intensity={80} tint={colorScheme === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFill} /> : null}

      <View style={styles.center}>
        <ThemedText title={true} style={[styles.title, { color: titleColor }]}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText style={[styles.subtitle, { color: subtitleColor }]}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        {Content}
      </Link>
    );
  }
  return Content;
}

function hexToRgba(hex, alpha = 1) {
  let c = (hex || "#fff").replace("#", "");
  if (c.length === 3) c = c.split("").map((s) => s + s).join("");
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  tile: {
    minHeight: 160,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    // shadow
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  pressed: {
    transform: [{ scale: 0.993 }],
    opacity: 0.95,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 22,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
  },
});
