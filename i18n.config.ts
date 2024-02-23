import en from "~/locales/en.json";
import dk from "~/locales/dk.json";
import cn from "~/locales/cn.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: import.meta.env.VITE_LANG || 'en',
  fallbackLocale: "en",
  messages: {
    en,
    dk,
    cn,
  }
}))