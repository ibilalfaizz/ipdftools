
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSEO } from '../contexts/SEOContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SEOHeadProps {
  toolName?: string;
  title?: string;
  description?: string;
  type?: 'website' | 'article';
  image?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  toolName,
  title,
  description,
  type = 'website',
  image = '/ipdftools.png'
}) => {
  const location = useLocation();
  const { generatePageTitle, generatePageDescription, generateCanonicalUrl, generateHrefLang } = useSEO();
  const { language, t } = useLanguage();

  const pageTitle = title || (toolName ? generatePageTitle(toolName) : t('seo.default.title'));
  const pageDescription = description || (toolName ? generatePageDescription(toolName) : t('seo.default.description'));
  const canonicalUrl = generateCanonicalUrl(location.pathname);
  const hrefLangLinks = generateHrefLang(location.pathname);
  const fullImageUrl = `https://ipdftools.lovable.app${image}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": pageTitle,
    "description": pageDescription,
    "url": canonicalUrl,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "iPDFTOOLS",
      "url": "https://ipdftools.lovable.app"
    }
  };

  return (
    <Helmet>
      <html lang={language} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Hreflang links */}
      {hrefLangLinks.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="iPDFTOOLS" />
      <meta property="og:locale" content={language === 'en' ? 'en_US' : language === 'es' ? 'es_ES' : 'fr_FR'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEOHead;
