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
    'nav.menu': 'Menu',
    'tool_search.placeholder': 'Search tools…',
    'tool_search.search_tools': 'Search tools',
    'tool_search.no_results': 'No tools match your search.',
    'nav.image_resize': 'Bulk image resizer',
    'nav.image_compress': 'Bulk image compressor',
    'nav.image_webp': 'Bulk WebP converter',
    'nav.image_jpg': 'Bulk JPG converter',
    'nav.image_gif': 'Images to GIF',
    'nav.image_crop': 'Image crop',
    'nav.image_watermark': 'Image watermark',
    
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
    'landing.image_jpg_desc': 'Bulk-convert PNG, WebP, GIF, and more to widely compatible JPEG files.',
    'landing.image_gif_desc':
      'Build an animated GIF from multiple photos. Set seconds per frame and loop in the sidebar.',
    'landing.image_crop_desc': 'Crop images with a draggable frame or exact pixel values. Same relative area for multiple files.',
    'landing.image_watermark_desc':
      'Add text or a logo watermark. Drag to position, resize, set opacity — download PNG in your browser.',
    
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
    'image_jpg.title': 'Bulk JPG converter',
    'image_jpg.description':
      'Convert images to JPEG at high quality (quality 92). Ideal for sharing and compatibility.',
    'image_jpg.process': 'Convert',
    'image_jpg.drop_title': 'Drop images here or click to browse',
    'image_jpg.drop_desc': 'Most raster formats • Multiple files',
    'image_gif.title': 'Images to GIF',
    'image_gif.description':
      'Order follows upload order. Frames are centered on a shared canvas (max 1280px). One GIF download.',
    'image_gif.process': 'Create GIF',
    'image_gif.drop_title': 'Drop images here or click to browse',
    'image_gif.drop_desc': 'PNG, JPEG, WebP, and more • At least one image',
    'image_gif.seconds_label': 'Seconds per image',
    'image_gif.seconds_hint': 'How long each image is shown before the next (0.05–30).',
    'image_gif.loop_label': 'Loop forever',
    'image_crop.title': 'Image crop',
    'image_crop.description':
      'Click and drag on the image to draw a crop (inside the bright area or on the dark edge). Drag corners and edges to resize; hold Alt and drag inside the box to move. Fine-tune with the numbers below. One image.',
    'image_crop.options_heading': 'Crop options',
    'image_crop.width': 'Width (px)',
    'image_crop.height': 'Height (px)',
    'image_crop.x': 'X position (px)',
    'image_crop.y': 'Y position (px)',
    'image_crop.process': 'Crop',
    'image_crop.drop_title': 'Drop an image here or click to browse',
    'image_crop.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • One image',
    'image_crop.batch_hint':
      'The same crop area (relative to each image) is applied to every file.',
    'image_watermark.title': 'Image watermark',
    'image_watermark.description':
      'Upload a photo and stack multiple text and image watermarks. Drag a layer on the preview to move it; use the corner handle on images to resize. List order: top = in front.',
    'image_watermark.canvas_hint':
      'Click a layer on the preview or in the list to edit it. Drag to move; image layers have a corner handle to resize.',
    'image_watermark.layers_heading': 'Watermark layers',
    'image_watermark.layers_order_hint':
      'First in the list is drawn behind; last is on top. Use arrows to change stacking.',
    'image_watermark.add_text': 'Add text',
    'image_watermark.add_image': 'Add image',
    'image_watermark.edit_text_layer': 'Selected: text',
    'image_watermark.edit_image_layer': 'Selected: image',
    'image_watermark.bring_forward': 'Move up (in front)',
    'image_watermark.send_backward': 'Move down (behind)',
    'image_watermark.remove_layer': 'Remove layer',
    'image_watermark.mode_text': 'Text',
    'image_watermark.mode_image': 'Image',
    'image_watermark.text_label': 'Watermark text',
    'image_watermark.color_label': 'Text color',
    'image_watermark.font_size_label': 'Text size',
    'image_watermark.font_size_value': 'Relative scale {n} (approx. % of image height)',
    'image_watermark.wm_image_label': 'Watermark image',
    'image_watermark.wm_image_pick': 'Choose image…',
    'image_watermark.wm_image_replace': 'Replace image…',
    'image_watermark.image_size_label': 'Watermark width',
    'image_watermark.image_size_value': '{n}% of main image width',
    'image_watermark.opacity_label': 'Opacity',
    'image_watermark.opacity_value': '{n}%',
    'image_watermark.process': 'Apply watermark',
    'image_watermark.download_png': 'Download PNG',
    'image_watermark.error_no_text': 'Please enter watermark text.',
    'image_watermark.error_no_wm_image': 'Please choose a watermark image.',
    'image_watermark.error_no_layers':
      'Add at least one text (non-empty) or image watermark.',
    'image_watermark.error_decode':
      'Could not read that image file. Try PNG or JPEG, or another browser.',
    'image_watermark.drop_title': 'Drop an image here or click to browse',
    'image_watermark.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • One image',
    'image_tools.result_ready': 'Ready — download as images or ZIP.',
    'image_tools.download_images': 'Download images',
    'image_tools.download_gif': 'Download GIF',
    'image_tools.download_zip': 'Download ZIP',
    'image_tools.files_added': 'Images selected',
    'image_tools.sidebar_heading': 'Files & options',
    'image_tools.open_options': 'Open options',
    'image_tools.clear': 'Clear',
    'image_tools.add_more': 'Add more images',
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
    'nav.menu': 'Menú',
    'tool_search.placeholder': 'Buscar herramientas…',
    'tool_search.search_tools': 'Buscar herramientas',
    'tool_search.no_results': 'Ninguna herramienta coincide.',
    'nav.image_resize': 'Redimensionador masivo',
    'nav.image_compress': 'Compresor masivo',
    'nav.image_webp': 'Conversor WebP masivo',
    'nav.image_jpg': 'Conversor JPG masivo',
    'nav.image_gif': 'Imágenes a GIF',
    'nav.image_crop': 'Recorte de imágenes',
    'nav.image_watermark': 'Marca de agua',
    
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
    'landing.image_jpg_desc':
      'Convierte PNG, WebP, GIF y más a JPEG compatible con todo.',
    'landing.image_gif_desc':
      'Crea un GIF animado desde varias fotos. Segundos por imagen y bucle en el panel.',
    'landing.image_crop_desc': 'Recorta con el marco o valores en píxeles. Misma zona relativa en cada archivo.',
    'landing.image_watermark_desc':
      'Texto o logo como marca de agua. Arrastra, cambia tamaño y opacidad — descarga PNG en el navegador.',
    
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
    'image_jpg.title': 'Conversor masivo a JPG',
    'image_jpg.description':
      'Convierte a JPEG en alta calidad (92). Ideal para compartir y compatibilidad.',
    'image_jpg.process': 'Convertir',
    'image_jpg.drop_title': 'Suelta imágenes aquí o haz clic',
    'image_jpg.drop_desc': 'La mayoría de formatos • Varios archivos',
    'image_gif.title': 'Imágenes a GIF',
    'image_gif.description':
      'El orden es el de subida. Fotos centradas en un lienzo común (máx. 1280px). Un GIF para descargar.',
    'image_gif.process': 'Crear GIF',
    'image_gif.drop_title': 'Suelta imágenes aquí o haz clic',
    'image_gif.drop_desc': 'PNG, JPEG, WebP y más • Al menos una imagen',
    'image_gif.seconds_label': 'Segundos por imagen',
    'image_gif.seconds_hint': 'Tiempo que se muestra cada imagen (0,05–30).',
    'image_gif.loop_label': 'Repetir en bucle',
    'image_crop.title': 'Recorte de imágenes',
    'image_crop.description':
      'Arrastra sobre la imagen para dibujar el recorte (zona clara u oscura). Esquinas y bordes para redimensionar; mantén Alt y arrastra dentro para mover. Números abajo. Una imagen.',
    'image_crop.options_heading': 'Opciones de recorte',
    'image_crop.width': 'Ancho (px)',
    'image_crop.height': 'Alto (px)',
    'image_crop.x': 'Posición X (px)',
    'image_crop.y': 'Posición Y (px)',
    'image_crop.process': 'Recortar',
    'image_crop.drop_title': 'Suelta una imagen aquí o haz clic',
    'image_crop.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Una imagen',
    'image_crop.batch_hint':
      'Se aplica la misma zona de recorte (relativa a cada imagen) a todos los archivos.',
    'image_watermark.title': 'Marca de agua en imagen',
    'image_watermark.description':
      'Sube una foto y apila varias marcas de texto e imagen. Arrastra para mover; en imágenes usa la esquina para redimensionar. En la lista, arriba = delante.',
    'image_watermark.canvas_hint':
      'Elige una capa en la vista previa o en la lista. Arrastra para mover; las imágenes tienen un control en la esquina.',
    'image_watermark.layers_heading': 'Capas de marca de agua',
    'image_watermark.layers_order_hint':
      'La primera de la lista se dibuja detrás; la última, delante. Flechas para el orden.',
    'image_watermark.add_text': 'Añadir texto',
    'image_watermark.add_image': 'Añadir imagen',
    'image_watermark.edit_text_layer': 'Seleccionado: texto',
    'image_watermark.edit_image_layer': 'Seleccionado: imagen',
    'image_watermark.bring_forward': 'Subir (delante)',
    'image_watermark.send_backward': 'Bajar (detrás)',
    'image_watermark.remove_layer': 'Quitar capa',
    'image_watermark.mode_text': 'Texto',
    'image_watermark.mode_image': 'Imagen',
    'image_watermark.text_label': 'Texto',
    'image_watermark.color_label': 'Color del texto',
    'image_watermark.font_size_label': 'Tamaño del texto',
    'image_watermark.font_size_value': 'Escala relativa {n} (aprox. % de la altura)',
    'image_watermark.wm_image_label': 'Imagen de marca de agua',
    'image_watermark.wm_image_pick': 'Elegir imagen…',
    'image_watermark.wm_image_replace': 'Cambiar imagen…',
    'image_watermark.image_size_label': 'Ancho de la marca',
    'image_watermark.image_size_value': '{n}% del ancho de la imagen principal',
    'image_watermark.opacity_label': 'Opacidad',
    'image_watermark.opacity_value': '{n}%',
    'image_watermark.process': 'Aplicar marca de agua',
    'image_watermark.download_png': 'Descargar PNG',
    'image_watermark.error_no_text': 'Escribe el texto de la marca de agua.',
    'image_watermark.error_no_wm_image': 'Elige una imagen para la marca de agua.',
    'image_watermark.error_no_layers':
      'Añade al menos un texto (no vacío) o una imagen de marca de agua.',
    'image_watermark.error_decode':
      'No se pudo leer esa imagen. Prueba PNG o JPEG u otro navegador.',
    'image_watermark.drop_title': 'Suelta una imagen aquí o haz clic',
    'image_watermark.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Una imagen',
    'image_tools.result_ready': 'Listo — descarga como imágenes o ZIP.',
    'image_tools.download_images': 'Descargar imágenes',
    'image_tools.download_gif': 'Descargar GIF',
    'image_tools.download_zip': 'Descargar ZIP',
    'image_tools.files_added': 'Imágenes seleccionadas',
    'image_tools.sidebar_heading': 'Archivos y opciones',
    'image_tools.open_options': 'Abrir opciones',
    'image_tools.clear': 'Vaciar',
    'image_tools.add_more': 'Añadir más imágenes',
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
    'nav.menu': 'Menu',
    'tool_search.placeholder': 'Rechercher un outil…',
    'tool_search.search_tools': 'Rechercher des outils',
    'tool_search.no_results': 'Aucun outil ne correspond.',
    'nav.image_resize': 'Redimensionnement masse',
    'nav.image_compress': 'Compression masse',
    'nav.image_webp': 'Conversion WebP masse',
    'nav.image_jpg': 'Conversion JPG masse',
    'nav.image_gif': 'Images vers GIF',
    'nav.image_crop': 'Recadrage d\'images',
    'nav.image_watermark': 'Filigrane image',
    
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
    'landing.image_jpg_desc':
      'PNG, WebP, GIF et plus en JPEG universellement compatible.',
    'landing.image_gif_desc':
      'Créez un GIF animé à partir de photos. Délai par image et boucle dans le panneau.',
    'landing.image_crop_desc': 'Recadrez avec le cadre ou la saisie en pixels. Même zone relative pour chaque fichier.',
    'landing.image_watermark_desc':
      'Texte ou logo en filigrane. Déplacez, redimensionnez, réglage de l\'opacité — téléchargement PNG dans le navigateur.',
    
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
    'image_jpg.title': 'Conversion JPG en masse',
    'image_jpg.description':
      'Conversion en JPEG haute qualité (92). Idéal pour le partage et la compatibilité.',
    'image_jpg.process': 'Convertir',
    'image_jpg.drop_title': 'Déposez des images ici ou cliquez',
    'image_jpg.drop_desc': 'La plupart des formats • Fichiers multiples',
    'image_gif.title': 'Images vers GIF',
    'image_gif.description':
      'L\'ordre suit l\'import. Images centrées sur un canevas commun (max 1280px). Un fichier GIF.',
    'image_gif.process': 'Créer le GIF',
    'image_gif.drop_title': 'Déposez des images ici ou cliquez',
    'image_gif.drop_desc': 'PNG, JPEG, WebP et plus • Au moins une image',
    'image_gif.seconds_label': 'Secondes par image',
    'image_gif.seconds_hint': 'Durée d\'affichage de chaque image (0,05–30).',
    'image_gif.loop_label': 'Boucle infinie',
    'image_crop.title': 'Recadrage d\'images',
    'image_crop.description':
      'Glissez sur l\'image pour tracer la zone (clair ou assombri). Coins et bords pour redimensionner ; Alt + glisser à l\'intérieur pour déplacer. Valeurs ci-dessous. Une image.',
    'image_crop.options_heading': 'Options de recadrage',
    'image_crop.width': 'Largeur (px)',
    'image_crop.height': 'Hauteur (px)',
    'image_crop.x': 'Position X (px)',
    'image_crop.y': 'Position Y (px)',
    'image_crop.process': 'Recadrer',
    'image_crop.drop_title': 'Déposez une image ici ou cliquez',
    'image_crop.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Une image',
    'image_crop.batch_hint':
      'La même zone de recadrage (relative à chaque image) est appliquée à chaque fichier.',
    'image_watermark.title': 'Filigrane sur image',
    'image_watermark.description':
      'Importez une photo et superposez plusieurs textes et images. Glissez pour déplacer ; pour les images, utilisez le coin pour redimensionner. Dans la liste, le bas = devant.',
    'image_watermark.canvas_hint':
      'Cliquez une couche sur l\'aperçu ou dans la liste. Glissez pour déplacer ; les images ont une poignée au coin.',
    'image_watermark.layers_heading': 'Couches de filigrane',
    'image_watermark.layers_order_hint':
      'La première ligne est en arrière-plan ; la dernière au premier plan. Flèches pour l\'ordre.',
    'image_watermark.add_text': 'Ajouter du texte',
    'image_watermark.add_image': 'Ajouter une image',
    'image_watermark.edit_text_layer': 'Sélection : texte',
    'image_watermark.edit_image_layer': 'Sélection : image',
    'image_watermark.bring_forward': 'Monter (devant)',
    'image_watermark.send_backward': 'Descendre (derrière)',
    'image_watermark.remove_layer': 'Supprimer la couche',
    'image_watermark.mode_text': 'Texte',
    'image_watermark.mode_image': 'Image',
    'image_watermark.text_label': 'Texte du filigrane',
    'image_watermark.color_label': 'Couleur du texte',
    'image_watermark.font_size_label': 'Taille du texte',
    'image_watermark.font_size_value': 'Échelle relative {n} (env. % de la hauteur)',
    'image_watermark.wm_image_label': 'Image du filigrane',
    'image_watermark.wm_image_pick': 'Choisir une image…',
    'image_watermark.wm_image_replace': 'Remplacer l\'image…',
    'image_watermark.image_size_label': 'Largeur du filigrane',
    'image_watermark.image_size_value': '{n}% de la largeur de l\'image principale',
    'image_watermark.opacity_label': 'Opacité',
    'image_watermark.opacity_value': '{n}%',
    'image_watermark.process': 'Appliquer le filigrane',
    'image_watermark.download_png': 'Télécharger PNG',
    'image_watermark.error_no_text': 'Saisissez le texte du filigrane.',
    'image_watermark.error_no_wm_image': 'Choisissez une image de filigrane.',
    'image_watermark.error_no_layers':
      'Ajoutez au moins un texte (non vide) ou une image de filigrane.',
    'image_watermark.error_decode':
      'Impossible de lire cette image. Essayez PNG ou JPEG, ou un autre navigateur.',
    'image_watermark.drop_title': 'Déposez une image ici ou cliquez',
    'image_watermark.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Une image',
    'image_tools.result_ready': 'Prêt — téléchargez en images ou en ZIP.',
    'image_tools.download_images': 'Télécharger les images',
    'image_tools.download_gif': 'Télécharger le GIF',
    'image_tools.download_zip': 'Télécharger ZIP',
    'image_tools.files_added': 'Images sélectionnées',
    'image_tools.sidebar_heading': 'Fichiers et options',
    'image_tools.open_options': 'Ouvrir les options',
    'image_tools.clear': 'Effacer',
    'image_tools.add_more': 'Ajouter des images',
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
