import I18n from "./index";

// Returns English translation regardless of active locale
export const getEnglishLabel = (key) => {
  const translations = I18n.translations;
  if (!translations?.en) return null;

  const parts = key.split(".");
  let value = translations.en;

  for (const p of parts) {
    value = value?.[p];
  }

  return typeof value === "string" ? value : null;
};
