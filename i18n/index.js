import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

import en from "./locales/en.json";
import hi from "./locales/hi.json";

// Prepare translation object
const translations = { en, hi };

// Create i18n instance
const i18n = new I18n(translations);

// Apply fallback + locale
i18n.defaultLocale = "en";
i18n.enableFallback = true;

// Set initial locale
i18n.locale = Localization.locale || "en";

// Export translation function
export const t = (key, options) => i18n.t(key, options);

// Export locale helpers
export const getLocale = () => i18n.locale;

export const setLocale = (locale) => {
  i18n.locale = locale;
};

// English helper usage
export const getTranslations = () => translations;

export default i18n;
