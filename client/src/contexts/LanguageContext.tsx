import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types';

interface LanguageContextType {
  currentLanguage: Language;
  languages: Language[];
  changeLanguage: (languageCode: 'en' | 'es') => void;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('language') as 'en' | 'es';
    if (savedLanguage) {
      const language = languages.find(lang => lang.code === savedLanguage);
      if (language) {
        setCurrentLanguage(language);
      }
    }
  }, []);

  const changeLanguage = (languageCode: 'en' | 'es') => {
    const language = languages.find(lang => lang.code === languageCode);
    if (language) {
      setCurrentLanguage(language);
      localStorage.setItem('language', languageCode);
      // Update document language
      document.documentElement.lang = languageCode;
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    languages,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 