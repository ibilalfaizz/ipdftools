
import React, { createContext, useContext, ReactNode } from 'react';
import { useLanguage } from './LanguageContext';
import {
  englishPathToLocalized,
  slugToOriginalPath,
  type LocaleCode,
} from '@/lib/urlPaths';
import { getSiteUrl } from '@/lib/site-url';

interface SEOContextType {
  generatePageTitle: (toolName: string) => string;
  generatePageDescription: (toolName: string) => string;
  generateCanonicalUrl: (path: string) => string;
  generateHrefLang: (path: string) => Array<{ lang: string; url: string }>;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

export const SEOProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useLanguage();

  const generatePageTitle = (toolName: string): string => {
    const title = t(`seo.${toolName}.title`);
    const siteName = t('seo.site_name');
    return `${title} - ${siteName}`;
  };

  const generatePageDescription = (toolName: string): string => {
    return t(`seo.${toolName}.description`);
  };

  const generateCanonicalUrl = (path: string): string => {
    const baseUrl = getSiteUrl();
    return `${baseUrl}${path}`;
  };

  const generateHrefLang = (path: string): Array<{ lang: string; url: string }> => {
    const baseUrl = getSiteUrl();
    const trimmed = path.startsWith('/') ? path : `/${path}`;
    const segment = trimmed.replace(/^\//, '').split('/')[0] ?? '';
    const englishPath = slugToOriginalPath(segment) ?? (segment ? `/${segment}` : trimmed);

    const langPaths: Record<LocaleCode, string> = {
      en: englishPathToLocalized(englishPath, 'en'),
      es: englishPathToLocalized(englishPath, 'es'),
      fr: englishPathToLocalized(englishPath, 'fr'),
    };

    return [
      { lang: 'en', url: `${baseUrl}${langPaths.en}` },
      { lang: 'es', url: `${baseUrl}${langPaths.es}` },
      { lang: 'fr', url: `${baseUrl}${langPaths.fr}` },
      { lang: 'x-default', url: `${baseUrl}${langPaths.en}` },
    ];
  };

  return (
    <SEOContext.Provider value={{
      generatePageTitle,
      generatePageDescription,
      generateCanonicalUrl,
      generateHrefLang,
    }}>
      {children}
    </SEOContext.Provider>
  );
};

export const useSEO = () => {
  const context = useContext(SEOContext);
  if (context === undefined) {
    throw new Error('useSEO must be used within a SEOProvider');
  }
  return context;
};
