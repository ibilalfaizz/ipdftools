"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  homePath,
  isLocalePrefix,
  slugToOriginalPath,
  toolPath,
} from "@/lib/urlPaths";
import { seoTranslations } from "@/lib/seo-translations";

export type Language = "en" | "es" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getLocalizedPath: (path: string) => string;
  getLocalizedPathForLanguage: (originalPath: string, lang: Language) => string;
  getOriginalPath: (localizedPath: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.pdf_tools': 'PDF tools',
    'nav.merge': 'Merge',
    'nav.split': 'Split',
    'nav.compress': 'Compress',
    'nav.rotate': 'Rotate',
    'nav.pdf_to_word': 'PDF to Word',
    'nav.pdf_to_jpg': 'PDF to JPG',
    'nav.pdf_to_text': 'PDF to Text',
    'nav.word_to_pdf': 'Word to PDF',
    'nav.jpg_to_pdf': 'JPG to PDF',
    'nav.image_tools': 'Image tools',
    'nav.image_resize': 'Bulk image resizer',
    'nav.image_compress': 'Bulk image compressor',
    'nav.image_webp': 'Bulk WebP converter',
    
    // URL paths
    'url.merge': 'merge-pdf',
    'url.split': 'split-pdf',
    'url.compress': 'compress-pdf',
    'url.rotate': 'rotate-pdf',
    'url.pdf_to_word': 'pdf-to-word',
    'url.pdf_to_jpg': 'pdf-to-jpg',
    'url.pdf_to_text': 'pdf-to-text',
    'url.word_to_pdf': 'word-to-pdf',
    'url.jpg_to_pdf': 'jpg-to-pdf',
    
    // Landing page descriptions
    'landing.merge_desc': 'Combine multiple PDF files into a single document with ease.',
    'landing.split_desc': 'Extract pages from your PDF or split into multiple documents.',
    'landing.compress_desc': 'Reduce PDF file size while maintaining quality.',
    'landing.rotate_desc': 'Rotate PDF pages to the correct orientation.',
    'landing.pdf_to_word_desc': 'Convert PDF files to editable Word documents.',
    'landing.pdf_to_jpg_desc': 'Convert PDF pages to high-quality JPG images.',
    'landing.pdf_to_text_desc': 'Extract text content from PDF documents.',
    'landing.word_to_pdf_desc': 'Convert Word documents to PDF format.',
    'landing.jpg_to_pdf_desc': 'Convert JPG and PNG images to PDF documents.',
    'landing.image_resize_desc': 'Bulk-resize photos to the same width and height (center crop).',
    'landing.image_compress_desc': 'Bulk lossless re-compression for smaller PNG, WebP, and JPEG files.',
    'landing.image_webp_desc': 'Bulk-convert images to modern WebP at high quality.',
    
    // Landing page content (hero: eyebrow + headline split for highlighted word)
    'landing.hero_eyebrow': 'PDF & IMAGE TOOLS',
    'landing.hero_headline_before': 'Process documents ',
    'landing.hero_headline_highlight': 'in your browser',
    'landing.hero_headline_after': '—private, fast, and completely free.',
    'landing.hero_subtitle':
      'We merge, split, compress, convert, and optimize PDFs and images on your device. No account required—your files stay on your machine, not our servers.',
    'landing.hero_cta_primary': 'Browse PDF tools',
    'landing.hero_cta_secondary': 'Browse image tools',
    'landing.why_choose_title': 'Why choose us?',
    'landing.secure_title': '100% Secure',
    'landing.secure_desc': 'All processing happens in your browser. Your files never leave your device.',
    'landing.fast_title': 'Fast & Efficient',
    'landing.fast_desc': 'Lightning-fast processing with no file size limits or watermarks.',
    'landing.easy_title': 'Easy to Use',
    'landing.easy_desc': 'Intuitive interface that works on any device. No registration required.',
    
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
    'common.selected_files': 'Selected Files',
    'common.processing': 'Processing...',
    'common.success': 'Success!',
    'common.downloading': 'Downloading...',
    
    // Landing/Merge
    'merge.title': 'PDF Merger',
    'merge.description': 'Combine multiple PDF files into one document',
    'merge.merge_button': 'Merge PDFs',
    
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
    
    ...seoTranslations.en,
    'image_resize.title': 'Bulk image resizer',
    'image_resize.description': 'Set target width and height (pixels). Each image is cropped to cover the box, centered.',
    'image_resize.width': 'Width (px)',
    'image_resize.height': 'Height (px)',
    'image_resize.process': 'Resize',
    'image_resize.drop_title': 'Drop images here or click to browse',
    'image_resize.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Multiple files',
    'image_compress.title': 'Bulk image compressor (lossless)',
    'image_compress.description': 'Re-encodes images losslessly where possible for a smaller file size.',
    'image_compress.process': 'Compress',
    'image_compress.drop_title': 'Drop images here or click to browse',
    'image_compress.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Multiple files',
    'image_webp.title': 'Bulk WebP converter',
    'image_webp.description': 'Convert images to WebP at high quality (quality 90).',
    'image_webp.process': 'Convert',
    'image_webp.drop_title': 'Drop images here or click to browse',
    'image_webp.drop_desc': 'Most raster formats • Multiple files',
    'image_tools.result_ready': 'Ready — download as images or ZIP.',
    'image_tools.download_images': 'Download images',
    'image_tools.download_zip': 'Download ZIP',
    'image_tools.files_added': 'Images selected',
    'image_tools.sidebar_heading': 'Files & options',
    'image_tools.open_options': 'Open options',
    'image_tools.clear': 'Clear',
    'image_tools.processing': 'Processing…',
    'image_tools.success': 'Download started',
    'image_tools.error': 'Something went wrong',
    'image_tools.no_files': 'Please add at least one image.',
    'image_tools.webp_unsupported':
      'This browser cannot encode WebP. Try Chrome, Edge, or Firefox.',
  },
  es: {
    // Navigation
    'nav.pdf_tools': 'Herramientas PDF',
    'nav.merge': 'Combinar',
    'nav.split': 'Dividir',
    'nav.compress': 'Comprimir',
    'nav.rotate': 'Rotar',
    'nav.pdf_to_word': 'PDF a Word',
    'nav.pdf_to_jpg': 'PDF a JPG',
    'nav.pdf_to_text': 'PDF a Texto',
    'nav.word_to_pdf': 'Word a PDF',
    'nav.jpg_to_pdf': 'JPG a PDF',
    'nav.image_tools': 'Herramientas de imagen',
    'nav.image_resize': 'Redimensionador masivo',
    'nav.image_compress': 'Compresor masivo',
    'nav.image_webp': 'Conversor WebP masivo',
    
    // URL paths
    'url.merge': 'combinar-pdf',
    'url.split': 'dividir-pdf',
    'url.compress': 'comprimir-pdf',
    'url.rotate': 'rotar-pdf',
    'url.pdf_to_word': 'pdf-a-word',
    'url.pdf_to_jpg': 'pdf-a-jpg',
    'url.pdf_to_text': 'pdf-a-texto',
    'url.word_to_pdf': 'word-a-pdf',
    'url.jpg_to_pdf': 'jpg-a-pdf',
    
    // Landing page descriptions
    'landing.merge_desc': 'Combina múltiples archivos PDF en un solo documento con facilidad.',
    'landing.split_desc': 'Extrae páginas de tu PDF o divide en múltiples documentos.',
    'landing.compress_desc': 'Reduce el tamaño del archivo PDF manteniendo la calidad.',
    'landing.rotate_desc': 'Rota las páginas PDF a la orientación correcta.',
    'landing.pdf_to_word_desc': 'Convierte archivos PDF a documentos Word editables.',
    'landing.pdf_to_jpg_desc': 'Convierte páginas PDF a imágenes JPG de alta calidad.',
    'landing.pdf_to_text_desc': 'Extrae contenido de texto de documentos PDF.',
    'landing.word_to_pdf_desc': 'Convierte documentos Word a formato PDF.',
    'landing.jpg_to_pdf_desc': 'Convierte imágenes JPG y PNG a documentos PDF.',
    'landing.image_resize_desc': 'Redimensiona muchas fotos al mismo ancho y alto (recorte centrado).',
    'landing.image_compress_desc': 'Recompresión sin pérdida en lote para PNG, WebP y JPEG más ligeros.',
    'landing.image_webp_desc': 'Convierte muchas imágenes a WebP con alta calidad.',
    
    // Landing page content
    'landing.hero_eyebrow': 'HERRAMIENTAS PDF E IMAGEN',
    'landing.hero_headline_before': 'Procesa documentos ',
    'landing.hero_headline_highlight': 'en tu navegador',
    'landing.hero_headline_after': '—privado, rápido y gratis.',
    'landing.hero_subtitle':
      'Combinamos, dividimos, comprimimos y convertimos en tu dispositivo. Sin cuenta—tus archivos se quedan en tu equipo, no en nuestros servidores.',
    'landing.hero_cta_primary': 'Ver herramientas PDF',
    'landing.hero_cta_secondary': 'Ver herramientas de imagen',
    'landing.why_choose_title': '¿Por qué elegirnos?',
    'landing.secure_title': '100% Seguro',
    'landing.secure_desc': 'Todo el procesamiento ocurre en tu navegador. Tus archivos nunca salen de tu dispositivo.',
    'landing.fast_title': 'Rápido y Eficiente',
    'landing.fast_desc': 'Procesamiento ultrarrápido sin límites de tamaño de archivo ni marcas de agua.',
    'landing.easy_title': 'Fácil de Usar',
    'landing.easy_desc': 'Interfaz intuitiva que funciona en cualquier dispositivo. No requiere registro.',
    
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
    
    ...seoTranslations.es,
    'image_resize.title': 'Redimensionador masivo de imágenes',
    'image_resize.description': 'Ancho y alto en píxeles. Cada imagen se recorta al centro (cover).',
    'image_resize.width': 'Ancho (px)',
    'image_resize.height': 'Alto (px)',
    'image_resize.process': 'Redimensionar',
    'image_resize.drop_title': 'Suelta imágenes aquí o haz clic',
    'image_resize.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Varios archivos',
    'image_compress.title': 'Compresor masivo (sin pérdida)',
    'image_compress.description': 'Re-codifica sin pérdida cuando es posible para archivos más pequeños.',
    'image_compress.process': 'Comprimir',
    'image_compress.drop_title': 'Suelta imágenes aquí o haz clic',
    'image_compress.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Varios archivos',
    'image_webp.title': 'Conversor masivo a WebP',
    'image_webp.description': 'Convierte a WebP en alta calidad (90).',
    'image_webp.process': 'Convertir',
    'image_webp.drop_title': 'Suelta imágenes aquí o haz clic',
    'image_webp.drop_desc': 'La mayoría de formatos • Varios archivos',
    'image_tools.result_ready': 'Listo — descarga como imágenes o ZIP.',
    'image_tools.download_images': 'Descargar imágenes',
    'image_tools.download_zip': 'Descargar ZIP',
    'image_tools.files_added': 'Imágenes seleccionadas',
    'image_tools.sidebar_heading': 'Archivos y opciones',
    'image_tools.open_options': 'Abrir opciones',
    'image_tools.clear': 'Vaciar',
    'image_tools.processing': 'Procesando…',
    'image_tools.success': 'Descarga iniciada',
    'image_tools.error': 'Algo salió mal',
    'image_tools.no_files': 'Añade al menos una imagen.',
    'image_tools.webp_unsupported':
      'Este navegador no puede codificar WebP. Prueba Chrome, Edge o Firefox.',
  },
  fr: {
    // Navigation
    'nav.pdf_tools': 'Outils PDF',
    'nav.merge': 'Fusionner',
    'nav.split': 'Diviser',
    'nav.compress': 'Compresser',
    'nav.rotate': 'Rotation',
    'nav.pdf_to_word': 'PDF vers Word',
    'nav.pdf_to_jpg': 'PDF vers JPG',
    'nav.pdf_to_text': 'PDF vers Texte',
    'nav.word_to_pdf': 'Word vers PDF',
    'nav.jpg_to_pdf': 'JPG vers PDF',
    'nav.image_tools': 'Outils image',
    'nav.image_resize': 'Redimensionnement masse',
    'nav.image_compress': 'Compression masse',
    'nav.image_webp': 'Conversion WebP masse',
    
    // URL paths
    'url.merge': 'fusionner-pdf',
    'url.split': 'diviser-pdf',
    'url.compress': 'compresser-pdf',
    'url.rotate': 'rotation-pdf',
    'url.pdf_to_word': 'pdf-vers-word',
    'url.pdf_to_jpg': 'pdf-vers-jpg',
    'url.pdf_to_text': 'pdf-vers-texte',
    'url.word_to_pdf': 'word-vers-pdf',
    'url.jpg_to_pdf': 'jpg-vers-pdf',
    
    // Landing page descriptions
    'landing.merge_desc': 'Combinez plusieurs fichiers PDF en un seul document avec facilité.',
    'landing.split_desc': 'Extrayez des pages de votre PDF ou divisez en plusieurs documents.',
    'landing.compress_desc': 'Réduisez la taille du fichier PDF tout en maintenant la qualité.',
    'landing.rotate_desc': 'Faites pivoter les pages PDF vers la bonne orientation.',
    'landing.pdf_to_word_desc': 'Convertissez les fichiers PDF en documents Word éditables.',
    'landing.pdf_to_jpg_desc': 'Convertissez les pages PDF en images JPG de haute qualité.',
    'landing.pdf_to_text_desc': 'Extrayez le contenu textuel des documents PDF.',
    'landing.word_to_pdf_desc': 'Convertissez les documents Word au format PDF.',
    'landing.jpg_to_pdf_desc': 'Convertissez les images JPG et PNG en documents PDF.',
    'landing.image_resize_desc': 'Redimensionnez en masse au même format (recadrage centré).',
    'landing.image_compress_desc': 'Recompression sans perte par lot pour des PNG, WebP et JPEG plus légers.',
    'landing.image_webp_desc': 'Conversion en masse vers WebP haute qualité.',
    
    // Landing page content
    'landing.hero_eyebrow': 'OUTILS PDF ET IMAGE',
    'landing.hero_headline_before': 'Traitez vos documents ',
    'landing.hero_headline_highlight': 'dans le navigateur',
    'landing.hero_headline_after': '—privé, rapide et gratuit.',
    'landing.hero_subtitle':
      'Fusion, découpage, compression et conversion sur votre appareil. Sans compte—vos fichiers restent sur votre machine, pas sur nos serveurs.',
    'landing.hero_cta_primary': 'Parcourir les outils PDF',
    'landing.hero_cta_secondary': 'Parcourir les outils image',
    'landing.why_choose_title': 'Pourquoi nous choisir ?',
    'landing.secure_title': '100% Sécurisé',
    'landing.secure_desc': 'Tout le traitement se fait dans votre navigateur. Vos fichiers ne quittent jamais votre appareil.',
    'landing.fast_title': 'Rapide et Efficace',
    'landing.fast_desc': 'Traitement ultra-rapide sans limites de taille de fichier ni filigranes.',
    'landing.easy_title': 'Facile à Utiliser',
    'landing.easy_desc': 'Interface intuitive qui fonctionne sur n\'importe quel appareil. Aucune inscription requise.',
    
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
    
    ...seoTranslations.fr,
    'image_resize.title': 'Redimensionnement d\'images en masse',
    'image_resize.description': 'Largeur et hauteur en pixels. Chaque image est recadrée au centre (cover).',
    'image_resize.width': 'Largeur (px)',
    'image_resize.height': 'Hauteur (px)',
    'image_resize.process': 'Redimensionner',
    'image_resize.drop_title': 'Déposez des images ici ou cliquez',
    'image_resize.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Fichiers multiples',
    'image_compress.title': 'Compression d\'images en masse (sans perte)',
    'image_compress.description': 'Ré-encode sans perte lorsque possible pour des fichiers plus petits.',
    'image_compress.process': 'Compresser',
    'image_compress.drop_title': 'Déposez des images ici ou cliquez',
    'image_compress.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Fichiers multiples',
    'image_webp.title': 'Conversion WebP en masse',
    'image_webp.description': 'Conversion en WebP haute qualité (90).',
    'image_webp.process': 'Convertir',
    'image_webp.drop_title': 'Déposez des images ici ou cliquez',
    'image_webp.drop_desc': 'La plupart des formats • Fichiers multiples',
    'image_tools.result_ready': 'Prêt — téléchargez en images ou en ZIP.',
    'image_tools.download_images': 'Télécharger les images',
    'image_tools.download_zip': 'Télécharger ZIP',
    'image_tools.files_added': 'Images sélectionnées',
    'image_tools.sidebar_heading': 'Fichiers et options',
    'image_tools.open_options': 'Ouvrir les options',
    'image_tools.clear': 'Effacer',
    'image_tools.processing': 'Traitement…',
    'image_tools.success': 'Téléchargement démarré',
    'image_tools.error': 'Une erreur s\'est produite',
    'image_tools.no_files': 'Ajoutez au moins une image.',
    'image_tools.webp_unsupported':
      'Ce navigateur ne peut pas encoder WebP. Essayez Chrome, Edge ou Firefox.',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [language, setLanguage] = useState<Language>("en");
  const skipNextPersist = useRef(true);

  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] && isLocalePrefix(parts[0])) {
      setLanguage(parts[0]);
      return;
    }
    try {
      const saved = localStorage.getItem("preferred-language") as Language;
      if (saved && ["en", "es", "fr"].includes(saved)) {
        setLanguage(saved);
      }
    } catch {
      /* private mode / SSR */
    }
  }, [pathname]);

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    try {
      localStorage.setItem("preferred-language", language);
    } catch {
      /* ignore */
    }
  }, [language]);

  const t = (key: string): string => {
    const currentTranslations = translations[language];

    if (currentTranslations && currentTranslations[key]) {
      return currentTranslations[key];
    }

    const keys = key.split(".");
    let value: unknown = currentTranslations;

    for (const k of keys) {
      value = (value as Record<string, unknown> | undefined)?.[k];
    }

    return (typeof value === "string" ? value : key) || key;
  };

  const getLocalizedPath = (originalPath: string): string => {
    if (originalPath === "/" || originalPath === "") {
      return homePath(language);
    }
    const withSlash = originalPath.startsWith("/") ? originalPath : `/${originalPath}`;
    return toolPath(language, withSlash);
  };

  const getLocalizedPathForLanguage = (
    originalPath: string,
    lang: Language
  ): string => {
    if (originalPath === "/" || originalPath === "") {
      return homePath(lang);
    }
    const withSlash = originalPath.startsWith("/") ? originalPath : `/${originalPath}`;
    return toolPath(lang, withSlash);
  };

  const getOriginalPath = (localizedPath: string): string => {
    const parts = localizedPath.split("/").filter(Boolean);
    if (parts.length === 1 && isLocalePrefix(parts[0])) {
      return "/";
    }
    if (parts.length >= 2 && isLocalePrefix(parts[0])) {
      const slug = parts[1];
      const orig = slugToOriginalPath(slug);
      return orig ?? `/${slug}`;
    }
    if (parts.length === 1) {
      const orig = slugToOriginalPath(parts[0]);
      if (orig) return orig;
    }
    return localizedPath;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getLocalizedPath,
        getLocalizedPathForLanguage,
        getOriginalPath,
      }}
    >
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
