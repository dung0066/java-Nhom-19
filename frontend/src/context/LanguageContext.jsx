import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Load saved language from localStorage or default to Vietnamese ('vi')
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('ways_language');
      return saved === 'en' ? 'en' : 'vi';
    } catch {
      return 'vi';
    }
  });

  const setLanguage = (newLang) => {
    const validLang = newLang === 'en' ? 'en' : 'vi';
    setLanguageState(validLang);
    try {
      localStorage.setItem('ways_language', validLang);
      document.documentElement.lang = validLang;
    } catch (e) {
      console.warn('Could not persist language preference:', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // ignore
    }
  }, [language]);

  const currentTranslations = translations[language] || translations.vi;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t: currentTranslations,
        isVietnamese: language === 'vi',
        isEnglish: language === 'en'
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
