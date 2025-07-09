
import React from 'react';
import { Route, Navigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface LocalizedRouteProps {
  path: string;
  element: React.ReactElement;
  originalPath: string;
}

const LocalizedRoute: React.FC<LocalizedRouteProps> = ({ path, element, originalPath }) => {
  const { getLocalizedPath, getOriginalPath } = useLanguage();
  const location = useLocation();

  // Check if current path matches any localized version of this route
  const currentOriginalPath = getOriginalPath(location.pathname);
  
  if (currentOriginalPath === originalPath) {
    return element;
  }

  return null;
};

export default LocalizedRoute;
