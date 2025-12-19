import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { getLocale, setLocale } from "../i18n";

const LANGUAGE_KEY = "user_language";

export function useLocale() {
  const [locale, setLocaleState] = useState(getLocale());

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (stored) {
        setLocale(stored);
        setLocaleState(stored);
      }
    })();
  }, []);

  const changeLanguage = async (lang) => {
    setLocale(lang);
    setLocaleState(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  };

  return {
    locale,
    changeLanguage,
  };
}
