
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.merge': 'Merge',
    'nav.split': 'Split',
    'nav.compress': 'Compress',
    'nav.rotate': 'Rotate',
    'nav.pdf_to_word': 'PDF to Word',
    'nav.pdf_to_jpg': 'PDF to JPG',
    'nav.pdf_to_text': 'PDF to Text',
    'nav.word_to_pdf': 'Word to PDF',
    'nav.jpg_to_pdf': 'JPG to PDF',
    
    // Common
    'common.select_files': 'Select Files',
    'common.convert': 'Convert',
    'common.download': 'Download',
    'common.download_all': 'Download All',
    'common.remove': 'Remove',
    'common.converting': 'Converting...',
    'common.files_added': 'Files Added',
    'common.conversion_complete': 'Conversion Complete',
    'common.conversion_failed': 'Conversion Failed',
    'common.no_files_selected': 'No Files Selected',
    'common.invalid_files': 'Invalid Files',
    
    // PDF to Word
    'pdf_to_word.title': 'PDF to Word Converter',
    'pdf_to_word.description': 'Convert your PDF documents to editable Word files',
    'pdf_to_word.select_pdf': 'Select PDF Files',
    'pdf_to_word.convert_button': 'Convert to Word',
    'pdf_to_word.pdf_only': 'Please select PDF files only.',
    'pdf_to_word.success': 'PDF file(s) converted to Word successfully.',
    
    // PDF to JPG
    'pdf_to_jpg.title': 'PDF to JPG Converter',
    'pdf_to_jpg.description': 'Convert your PDF documents to high-quality JPG images',
    'pdf_to_jpg.convert_button': 'Convert to JPG',
    'pdf_to_jpg.success': 'PDF file(s) converted to JPG successfully.',
    
    // PDF to Text
    'pdf_to_text.title': 'PDF to Text Converter',
    'pdf_to_text.description': 'Extract text content from your PDF documents',
    'pdf_to_text.convert_button': 'Convert to Text',
    'pdf_to_text.success': 'PDF file(s) converted to text successfully.',
    
    // Word to PDF
    'word_to_pdf.title': 'Word to PDF Converter',
    'word_to_pdf.description': 'Convert your Word documents to PDF format',
    'word_to_pdf.select_word': 'Select Word Files',
    'word_to_pdf.convert_button': 'Convert to PDF',
    'word_to_pdf.word_only': 'Please select Word files only (.doc, .docx).',
    'word_to_pdf.success': 'Word file(s) converted to PDF successfully.',
    
    // JPG to PDF
    'jpg_to_pdf.title': 'JPG to PDF Converter',
    'jpg_to_pdf.description': 'Convert your JPG and PNG images to PDF documents',
    'jpg_to_pdf.select_images': 'Select Image Files',
    'jpg_to_pdf.convert_button': 'Convert to PDF',
    'jpg_to_pdf.images_only': 'Please select JPG or PNG image files only.',
    'jpg_to_pdf.success': 'image file(s) converted to PDF successfully.',
    
    // PDF Rotator
    'rotate.title': 'PDF Rotator',
    'rotate.description': 'Rotate your PDF pages to the correct orientation',
    'rotate.select_angle': 'Select rotation angle *',
    'rotate.angle_placeholder': 'Choose rotation angle',
    'rotate.90_clockwise': '90° Clockwise',
    'rotate.180': '180° (Upside Down)',
    'rotate.270_clockwise': '270° Clockwise (90° Counter-clockwise)',
    'rotate.convert_button': 'Rotate PDFs by {angle}°',
    'rotate.rotating': 'Rotating...',
    'rotate.no_angle': 'Please select a rotation angle.',
    'rotate.success': 'PDF file(s) rotated by {angle}° successfully.',
    'rotate.failed': 'An error occurred during rotation.',
  },
  es: {
    // Navigation
    'nav.merge': 'Combinar',
    'nav.split': 'Dividir',
    'nav.compress': 'Comprimir',
    'nav.rotate': 'Rotar',
    'nav.pdf_to_word': 'PDF a Word',
    'nav.pdf_to_jpg': 'PDF a JPG',
    'nav.pdf_to_text': 'PDF a Texto',
    'nav.word_to_pdf': 'Word a PDF',
    'nav.jpg_to_pdf': 'JPG a PDF',
    
    // Common
    'common.select_files': 'Seleccionar Archivos',
    'common.convert': 'Convertir',
    'common.download': 'Descargar',
    'common.download_all': 'Descargar Todo',
    'common.remove': 'Eliminar',
    'common.converting': 'Convirtiendo...',
    'common.files_added': 'Archivos Añadidos',
    'common.conversion_complete': 'Conversión Completa',
    'common.conversion_failed': 'Conversión Fallida',
    'common.no_files_selected': 'No se Seleccionaron Archivos',
    'common.invalid_files': 'Archivos Inválidos',
    
    // PDF to Word
    'pdf_to_word.title': 'Convertidor PDF a Word',
    'pdf_to_word.description': 'Convierte tus documentos PDF a archivos Word editables',
    'pdf_to_word.select_pdf': 'Seleccionar Archivos PDF',
    'pdf_to_word.convert_button': 'Convertir a Word',
    'pdf_to_word.pdf_only': 'Por favor selecciona solo archivos PDF.',
    'pdf_to_word.success': 'archivo(s) PDF convertido(s) a Word exitosamente.',
    
    // PDF to JPG
    'pdf_to_jpg.title': 'Convertidor PDF a JPG',
    'pdf_to_jpg.description': 'Convierte tus documentos PDF a imágenes JPG de alta calidad',
    'pdf_to_jpg.convert_button': 'Convertir a JPG',
    'pdf_to_jpg.success': 'archivo(s) PDF convertido(s) a JPG exitosamente.',
    
    // PDF to Text
    'pdf_to_text.title': 'Convertidor PDF a Texto',
    'pdf_to_text.description': 'Extrae el contenido de texto de tus documentos PDF',
    'pdf_to_text.convert_button': 'Convertir a Texto',
    'pdf_to_text.success': 'archivo(s) PDF convertido(s) a texto exitosamente.',
    
    // Word to PDF
    'word_to_pdf.title': 'Convertidor Word a PDF',
    'word_to_pdf.description': 'Convierte tus documentos Word a formato PDF',
    'word_to_pdf.select_word': 'Seleccionar Archivos Word',
    'word_to_pdf.convert_button': 'Convertir a PDF',
    'word_to_pdf.word_only': 'Por favor selecciona solo archivos Word (.doc, .docx).',
    'word_to_pdf.success': 'archivo(s) Word convertido(s) a PDF exitosamente.',
    
    // JPG to PDF
    'jpg_to_pdf.title': 'Convertidor JPG a PDF',
    'jpg_to_pdf.description': 'Convierte tus imágenes JPG y PNG a documentos PDF',
    'jpg_to_pdf.select_images': 'Seleccionar Archivos de Imagen',
    'jpg_to_pdf.convert_button': 'Convertir a PDF',
    'jpg_to_pdf.images_only': 'Por favor selecciona solo archivos de imagen JPG o PNG.',
    'jpg_to_pdf.success': 'archivo(s) de imagen convertido(s) a PDF exitosamente.',
    
    // PDF Rotator
    'rotate.title': 'Rotador PDF',
    'rotate.description': 'Rota las páginas de tu PDF a la orientación correcta',
    'rotate.select_angle': 'Seleccionar ángulo de rotación *',
    'rotate.angle_placeholder': 'Elegir ángulo de rotación',
    'rotate.90_clockwise': '90° Horario',
    'rotate.180': '180° (Boca abajo)',
    'rotate.270_clockwise': '270° Horario (90° Antihorario)',
    'rotate.convert_button': 'Rotar PDFs {angle}°',
    'rotate.rotating': 'Rotando...',
    'rotate.no_angle': 'Por favor selecciona un ángulo de rotación.',
    'rotate.success': 'archivo(s) PDF rotado(s) {angle}° exitosamente.',
    'rotate.failed': 'Ocurrió un error durante la rotación.',
  },
  fr: {
    // Navigation
    'nav.merge': 'Fusionner',
    'nav.split': 'Diviser',
    'nav.compress': 'Compresser',
    'nav.rotate': 'Rotation',
    'nav.pdf_to_word': 'PDF vers Word',
    'nav.pdf_to_jpg': 'PDF vers JPG',
    'nav.pdf_to_text': 'PDF vers Texte',
    'nav.word_to_pdf': 'Word vers PDF',
    'nav.jpg_to_pdf': 'JPG vers PDF',
    
    // Common
    'common.select_files': 'Sélectionner des Fichiers',
    'common.convert': 'Convertir',
    'common.download': 'Télécharger',
    'common.download_all': 'Tout Télécharger',
    'common.remove': 'Supprimer',
    'common.converting': 'Conversion...',
    'common.files_added': 'Fichiers Ajoutés',
    'common.conversion_complete': 'Conversion Terminée',
    'common.conversion_failed': 'Conversion Échouée',
    'common.no_files_selected': 'Aucun Fichier Sélectionné',
    'common.invalid_files': 'Fichiers Invalides',
    
    // PDF to Word
    'pdf_to_word.title': 'Convertisseur PDF vers Word',
    'pdf_to_word.description': 'Convertissez vos documents PDF en fichiers Word modifiables',
    'pdf_to_word.select_pdf': 'Sélectionner des Fichiers PDF',
    'pdf_to_word.convert_button': 'Convertir en Word',
    'pdf_to_word.pdf_only': 'Veuillez sélectionner uniquement des fichiers PDF.',
    'pdf_to_word.success': 'fichier(s) PDF converti(s) en Word avec succès.',
    
    // PDF to JPG
    'pdf_to_jpg.title': 'Convertisseur PDF vers JPG',
    'pdf_to_jpg.description': 'Convertissez vos documents PDF en images JPG de haute qualité',
    'pdf_to_jpg.convert_button': 'Convertir en JPG',
    'pdf_to_jpg.success': 'fichier(s) PDF converti(s) en JPG avec succès.',
    
    // PDF to Text
    'pdf_to_text.title': 'Convertisseur PDF vers Texte',
    'pdf_to_text.description': 'Extraire le contenu textuel de vos documents PDF',
    'pdf_to_text.convert_button': 'Convertir en Texte',
    'pdf_to_text.success': 'fichier(s) PDF converti(s) en texte avec succès.',
    
    // Word to PDF
    'word_to_pdf.title': 'Convertisseur Word vers PDF',
    'word_to_pdf.description': 'Convertissez vos documents Word au format PDF',
    'word_to_pdf.select_word': 'Sélectionner des Fichiers Word',
    'word_to_pdf.convert_button': 'Convertir en PDF',
    'word_to_pdf.word_only': 'Veuillez sélectionner uniquement des fichiers Word (.doc, .docx).',
    'word_to_pdf.success': 'fichier(s) Word converti(s) en PDF avec succès.',
    
    // JPG to PDF
    'jpg_to_pdf.title': 'Convertisseur JPG vers PDF',
    'jpg_to_pdf.description': 'Convertissez vos images JPG et PNG en documents PDF',
    'jpg_to_pdf.select_images': 'Sélectionner des Fichiers Image',
    'jpg_to_pdf.convert_button': 'Convertir en PDF',
    'jpg_to_pdf.images_only': 'Veuillez sélectionner uniquement des fichiers image JPG ou PNG.',
    'jpg_to_pdf.success': 'fichier(s) image converti(s) en PDF avec succès.',
    
    // PDF Rotator
    'rotate.title': 'Rotateur PDF',
    'rotate.description': 'Faites pivoter vos pages PDF vers la bonne orientation',
    'rotate.select_angle': 'Sélectionner l\'angle de rotation *',
    'rotate.angle_placeholder': 'Choisir l\'angle de rotation',
    'rotate.90_clockwise': '90° Horaire',
    'rotate.180': '180° (À l\'envers)',
    'rotate.270_clockwise': '270° Horaire (90° Anti-horaire)',
    'rotate.convert_button': 'Faire pivoter les PDF de {angle}°',
    'rotate.rotating': 'Rotation...',
    'rotate.no_angle': 'Veuillez sélectionner un angle de rotation.',
    'rotate.success': 'fichier(s) PDF pivoté(s) de {angle}° avec succès.',
    'rotate.failed': 'Une erreur s\'est produite lors de la rotation.',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
