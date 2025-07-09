
import React, { createContext, useContext, ReactNode } from 'react';
import { useLanguage } from './LanguageContext';

interface SEOContextType {
  generatePageTitle: (toolName: string) => string;
  generatePageDescription: (toolName: string) => string;
  generateCanonicalUrl: (path: string) => string;
  generateHrefLang: (path: string) => Array<{ lang: string; url: string }>;
}

const SEOContext = createContext<SEOContextType | undefined>(undefined);

export const SEOProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { language, t } = useLanguage();

  const generatePageTitle = (toolName: string): string => {
    const title = t(`seo.${toolName}.title`);
    const siteName = t('seo.site_name');
    return `${title} - ${siteName}`;
  };

  const generatePageDescription = (toolName: string): string => {
    return t(`seo.${toolName}.description`);
  };

  const generateCanonicalUrl = (path: string): string => {
    const baseUrl = 'https://ipdftools.lovable.app';
    return `${baseUrl}${path}`;
  };

  const generateHrefLang = (path: string): Array<{ lang: string; url: string }> => {
    const baseUrl = 'https://ipdftools.lovable.app';
    const originalPath = path.replace(/^\/(combinar|fusionner|dividir|diviser|comprimir|compresser|rotar|rotation|pdf-a-word|pdf-vers-word|pdf-a-jpg|pdf-vers-jpg|pdf-a-texto|pdf-vers-texte|word-a-pdf|word-vers-pdf|jpg-a-pdf|jpg-vers-pdf)/, (match) => {
      // Map localized paths back to original English paths
      const pathMap: { [key: string]: string } = {
        'combinar': '/merge',
        'fusionner': '/merge',
        'dividir': '/split',
        'diviser': '/split',
        'comprimir': '/compress',
        'compresser': '/compress',
        'rotar': '/rotate',
        'rotation': '/rotate',
        'pdf-a-word': '/pdf-to-word',
        'pdf-vers-word': '/pdf-to-word',
        'pdf-a-jpg': '/pdf-to-jpg',
        'pdf-vers-jpg': '/pdf-to-jpg',
        'pdf-a-texto': '/pdf-to-text',
        'pdf-vers-texte': '/pdf-to-text',
        'word-a-pdf': '/word-to-pdf',
        'word-vers-pdf': '/word-to-pdf',
        'jpg-a-pdf': '/jpg-to-pdf',
        'jpg-vers-pdf': '/jpg-to-pdf',
      };
      return pathMap[match.substring(1)] || match;
    });

    const langPaths = {
      'en': originalPath,
      'es': originalPath.replace('/merge', '/combinar')
        .replace('/split', '/dividir')
        .replace('/compress', '/comprimir')
        .replace('/rotate', '/rotar')
        .replace('/pdf-to-word', '/pdf-a-word')
        .replace('/pdf-to-jpg', '/pdf-a-jpg')
        .replace('/pdf-to-text', '/pdf-a-texto')
        .replace('/word-to-pdf', '/word-a-pdf')
        .replace('/jpg-to-pdf', '/jpg-a-pdf'),
      'fr': originalPath.replace('/merge', '/fusionner')
        .replace('/split', '/diviser')
        .replace('/compress', '/compresser')
        .replace('/rotate', '/rotation')
        .replace('/pdf-to-word', '/pdf-vers-word')
        .replace('/pdf-to-jpg', '/pdf-vers-jpg')
        .replace('/pdf-to-text', '/pdf-vers-texte')
        .replace('/word-to-pdf', '/word-vers-pdf')
        .replace('/jpg-to-pdf', '/jpg-vers-pdf'),
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
