import React, { createContext, useContext, useState } from 'react';
import { translations } from './translations';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  hasChosen: boolean;
  setHasChosen: (chosen: boolean) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  hasChosen: false,
  setHasChosen: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('dtached-lang');
    return (saved as Language) || 'fr';
  });
  const [hasChosen, setHasChosenState] = useState(() => {
    return localStorage.getItem('dtached-lang-chosen') === 'true';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dtached-lang', lang);
  };

  const setHasChosen = (chosen: boolean) => {
    setHasChosenState(chosen);
    localStorage.setItem('dtached-lang-chosen', String(chosen));
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, hasChosen, setHasChosen, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
