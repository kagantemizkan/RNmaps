import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';
import trTranslations from './tr.json';

const resources = {
  en: { translation: enTranslations },
  tr: { translation: trTranslations }
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: "en",
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
