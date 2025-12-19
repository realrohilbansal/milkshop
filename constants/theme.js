// constants/theme.js
import { Platform } from "react-native";

/**
 * Central theme used across the app.
 * - Two color palettes: light and dark (used via useColorScheme())
 * - Semantic colors (info, success, warning, disabled)
 * - Utility tokens: spacing, radius, typography
 * - Small extras: placeholder, muted, buttonText, glassAlpha
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#ffffff";

export const Colors = {
  // Palette for dark mode
  dark: {
    text: "#d4d4d4",
    title: "#ffffff",
    tint: tintColorDark,
    background: "#0f0f11",
    navBackground: "#201e2b",
    uiBackground: "#2f2b3d",
    card: "#171719",
    border: "#2c2c31",

    // component helpers (mode-specific)
    buttonText: "#0f0f11",     // default text color when a light button is used on dark
    muted: "#4b5563",          // for disabled / muted elements on dark
    placeholder: "#9ca3af",    // input placeholder on dark
  },

  // Palette for light mode
  light: {
    text: "#374151",           // slightly darker than original for contrast
    title: "#1a1a1a",
    tint: tintColorLight,
    background: "#fafafa",
    navBackground: "#e8e7ef",
    uiBackground: "#f3f4f6",
    card: "#ffffff",
    border: "#e5e5e5",

    // component helpers (mode-specific)
    buttonText: "#ffffff",     // default button text on primary colored button
    muted: "#9ca3af",          // disabled / muted UI
    placeholder: "#9ca3af",
  },

  // Semantic colors (mode-agnostic helpers)
  success: "#16a34a",
  warning: "#f59e0b", // shifted to amber for better contrast
  danger: "#cc475a",
  info: "#0284c7",
  disabled: "#9ca3af",

  // Aliases used by many components
  tint: tintColorLight,     // general app accent (use Colors.light/dark.tint for mode specifics)
  // IMPORTANT: components should read mode-specific values from Colors[scheme].xxx

  // Spacing (tokenized)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  // Radii
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 999,
  },

  // Typography scale
  typography: {
    heading: 28,
    subheading: 20,
    body: 16,
    small: 14,
    tiny: 12,
  },

  // Glass / translucency helpers (use when making glass tiles)
  // glassAlpha is a suggested alpha to apply over palette color to get glass effect.
  // Components should combine this with mode-specific base (e.g. Colors.light.card)
  glassAlpha: {
    light: 0.48,
    dark: 0.14,
  },

  // Small utility helpers for shadows / elevation (used consistently)
  shadow: {
    subtle: {
      // iOS shadow
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      // Android elevation fallback
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export default {
  Colors,
  Fonts,
};
