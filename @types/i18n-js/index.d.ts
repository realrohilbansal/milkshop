declare module "i18n-js" {
  export interface TranslateOptions {
    [key: string]: any;
  }

  export default class I18n {
    // ───────────────────────────────────────────
    // Runtime locale handling (not present in old typings)
    // ───────────────────────────────────────────
    static locale: string;
    static defaultLocale: string;
    static fallbacks: boolean;

    // ───────────────────────────────────────────
    // The actual translations object
    // ───────────────────────────────────────────
    static translations: Record<string, any>;

    // ───────────────────────────────────────────
    // Translate function
    // ───────────────────────────────────────────
    static t(key: string, options?: TranslateOptions): string;

    // ───────────────────────────────────────────
    // Allow calling as instance if needed
    // ───────────────────────────────────────────
    t(key: string, options?: TranslateOptions): string;
  }
}
