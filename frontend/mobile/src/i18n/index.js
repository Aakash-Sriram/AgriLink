/**
 * Internationalization Configuration
 * 
 * This file sets up multilingual support for the application using i18next.
 * It supports English (en), Hindi (hi), and Tamil (ta) languages to make
 * the app accessible to farmers in different regions.
 * 
 * Key features:
 * - Multiple language support
 * - Fallback to English if translation is missing
 * - Non-escaping interpolation for dynamic content
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language files for different regions
import en from './locales/en.json';  // English translations
import hi from './locales/hi.json';  // Hindi translations
import ta from './locales/ta.json';  // Tamil translations

i18n.use(initReactI18next).init({
  // Configure available languages and their translation files
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ta: { translation: ta }
  },
  lng: 'en',  // Default language
  fallbackLng: 'en',  // Fallback if translation is missing
  interpolation: {
    escapeValue: false  // Allow HTML in translations
  }
});

export default i18n; 