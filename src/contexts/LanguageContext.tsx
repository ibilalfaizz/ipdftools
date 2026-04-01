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
    'nav.image_rotate': 'Rotate images',
    'nav.image_blur_face': 'Blur faces',
    'nav.image_remove_bg': 'Remove background',
    'nav.image_watermark': 'Image watermark',
    'nav.image_ocr': 'Image to text',
    
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
    'landing.image_rotate_desc':
      'Rotate many photos 90°, 180°, or 270° clockwise in your browser. Download separately or as a ZIP.',
    'landing.image_blur_face_desc':
      'Auto-detect faces and blur them for privacy. Runs in your browser; download images or a ZIP.',
    'landing.image_remove_bg_desc':
      'Erase solid or even backgrounds (for example studio white or walls) and download transparent PNGs — all in your browser.',
    'landing.image_watermark_desc':
      'Add text or a logo watermark. Drag to position, resize, set opacity — download PNG in your browser.',
    'landing.image_ocr_desc':
      'Pull text from images in your browser. Choose a language, then copy or save as a file.',
    
    // Landing page content (hero: eyebrow + headline split for highlighted word)
    'landing.hero_eyebrow': 'PDF & IMAGE TOOLS',
    'landing.hero_headline_before': 'Process documents ',
    'landing.hero_headline_highlight': 'in your browser',
    'landing.hero_headline_after': '—private, fast, and completely free.',
    'landing.hero_subtitle':
      'We merge, split, compress, convert, and optimize PDFs and images on your device. No account required—your files stay on your machine, not our servers.',
    'landing.hero_cta_primary': 'Browse PDF tools',
    'landing.hero_cta_secondary': 'Browse image tools',
    'landing.filter_toolbar_aria': 'Filter tools by category',
    'landing.filter_all': 'All',
    'landing.filter_optimize': 'Optimize',
    'landing.filter_create': 'Create',
    'landing.filter_edit': 'Edit',
    'landing.filter_convert': 'Convert',
    'landing.filter_security': 'Security',
    'landing.filter_empty_pdf':
      'No PDF tools in this category — try All or pick another filter.',
    'landing.filter_empty_image':
      'No image tools in this category — try All or pick another filter.',
    'landing.why_choose_title': 'Why choose us?',
    'landing.why_choose_eyebrow': 'FULL TRANSPARENCY',
    'landing.why_choose_headline_regular':
      'We never store your files on our servers. ',
    'landing.why_choose_headline_emphasis': 'Everything runs in your browser.',
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
    'pdf_to_word.format_note':
      'Text is extracted in your browser and saved as a real .docx. Formatting, tables, and images are not preserved.',
    'pdf_to_word.convert_failed': 'Could not convert this PDF to Word.',
    
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
    'word_to_pdf.format_note':
      '.docx is converted in your browser (text layout). Legacy .doc is not supported—save as .docx first.',
    'word_to_pdf.drop_title': 'Drop Word files here or click to browse',
    'word_to_pdf.drop_desc': '.docx recommended • Legacy .doc not supported in-browser',
    'word_to_pdf.doc_legacy_title': 'Legacy .doc not supported',
    'word_to_pdf.doc_legacy_body':
      'Open the file in Word or LibreOffice and save as .docx, then upload again.',
    'word_to_pdf.invalid_file': 'Please use a .docx file.',
    'word_to_pdf.convert_failed': 'Could not convert this file to PDF.',
    
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
    'image_rotate.title': 'Rotate images',
    'image_rotate.description':
      'Use Rotate left / Rotate right in the sidebar (90° per click). Preview updates live; Process applies the total rotation to every image. Output format follows the bulk compressor rules (PNG/WebP/JPEG).',
    'image_rotate.preview_hint':
      'Preview shows the total rotation so far. Use the sidebar buttons — you can tap left or right as many times as you like.',
    'image_rotate.thumbnails_hint': 'Preview another file:',
    'image_rotate.sidebar_rotation_heading': 'Rotate (90° per click)',
    'image_rotate.rotate_left': 'Rotate left',
    'image_rotate.rotate_right': 'Rotate right',
    'image_rotate.net_rotation_label': 'Total rotation (clockwise):',
    'image_rotate.process': 'Rotate',
    'image_rotate.drop_title': 'Drop images here or click to browse',
    'image_rotate.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Multiple files',
    'image_blur_face.title': 'Blur faces in photos',
    'image_blur_face.description':
      'Finds regions to blur on your device. Drag a region to move it, or use the edges and corners to resize. The slider changes blur strength. For files you never open in the preview, regions are chosen automatically when you export.',
    'image_blur_face.blur_strength': 'Blur strength',
    'image_blur_face.blur_hint': 'Higher values hide more detail.',
    'image_blur_face.process': 'Blur faces',
    'image_blur_face.drop_title': 'Drop images here or click to browse',
    'image_blur_face.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Multiple files',
    'image_blur_face.preview_hint':
      'Blurred areas show right on the photo. Drag inside a region to move it, or use the edge and corner handles to resize. The strength slider updates the blur.',
    'image_blur_face.preview_detecting': 'Preparing preview…',
    'image_blur_face.preview_no_faces':
      'Nothing was found automatically — use the region in the center: drag or resize it to cover what you want blurred.',
    'image_blur_face.preview_thumbnails_hint': 'Preview another file:',
    'image_remove_bg.title': 'Remove image background',
    'image_remove_bg.description':
      'Best when the backdrop is fairly uniform and shows along the edges of the photo. You get transparent PNGs; everything runs on your device.',
    'image_remove_bg.process': 'Remove background',
    'image_remove_bg.drop_title': 'Drop images here or click to browse',
    'image_remove_bg.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Multiple files',
    'image_remove_bg.preview_before':
      'Your original photo shows here. Use Remove background in the sidebar — the preview will switch to the transparent cutout.',
    'image_remove_bg.preview_after':
      'Transparent cutout (checkerboard = see-through). Download from the sidebar or run again after changing files.',
    'image_remove_bg.preview_thumbnails_hint': 'Preview another file:',
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
    'image_ocr.title': 'Image to text',
    'image_ocr.description':
      'Turn text in pictures into editable copy you can paste or save. Everything runs in your browser.',
    'image_ocr.drop_title': 'Drop images here or click to browse',
    'image_ocr.drop_desc': 'PNG, JPEG, WebP, GIF • Multiple files',
    'image_ocr.language_label': 'Text language in image',
    'image_ocr.lang_auto': 'Auto (Slower)',
    'image_ocr.lang_eng': 'English',
    'image_ocr.lang_spa': 'Spanish (Español)',
    'image_ocr.lang_fra': 'French (Français)',
    'image_ocr.combobox_placeholder': 'Choose a language…',
    'image_ocr.combobox_search': 'Search languages…',
    'image_ocr.combobox_empty': 'No language matches.',
    'image_ocr.select_language_first':
      'Select a language before extracting text.',
    'image_ocr.extracting_wait': 'Starting…',
    'image_ocr.process': 'Extract text',
    'image_ocr.processing': 'Reading text…',
    'image_ocr.progress_label': 'Working…',
    'image_ocr.result_heading': 'Extracted text',
    'image_ocr.placeholder':
      'Add images, then tap Extract text. Results show here — copy or download as one .txt or a ZIP of files.',
    'image_ocr.empty_result': '(No text detected.)',
    'image_ocr.copy_all': 'Copy all text',
    'image_ocr.download_txt': 'Download one .txt file',
    'image_ocr.download_zip': 'Download .txt files as ZIP',
    'image_ocr.success': 'Text extracted',
    'image_ocr.copied': 'Copied to clipboard',
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
    'image_tools.face_blur_model_failed':
      'Could not load privacy tools in your browser. Check your connection and try again.',
    'image_tools.remove_bg_failed':
      'Could not remove backgrounds. Check your connection, try other images, or try again.',
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
    'nav.image_rotate': 'Rotar imágenes',
    'nav.image_blur_face': 'Desenfocar caras',
    'nav.image_remove_bg': 'Quitar fondo',
    'nav.image_watermark': 'Marca de agua',
    'nav.image_ocr': 'Imagen a texto',
    
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
    'landing.image_rotate_desc':
      'Gira muchas fotos 90°, 180° o 270° en el navegador. Descarga sueltas o en ZIP.',
    'landing.image_blur_face_desc':
      'Detecta caras y las desenfoca para privacidad. En tu navegador; imágenes o ZIP.',
    'landing.image_remove_bg_desc':
      'Elimina fondos lisos o uniformes (estudio, paredes) y descarga PNG transparentes — todo en tu navegador.',
    'landing.image_watermark_desc':
      'Texto o logo como marca de agua. Arrastra, cambia tamaño y opacidad — descarga PNG en el navegador.',
    'landing.image_ocr_desc':
      'Extrae texto de imágenes en el navegador. Elige idioma, luego copia o guarda el archivo.',
    
    // Landing page content
    'landing.hero_eyebrow': 'HERRAMIENTAS PDF E IMAGEN',
    'landing.hero_headline_before': 'Procesa documentos ',
    'landing.hero_headline_highlight': 'en tu navegador',
    'landing.hero_headline_after': '—privado, rápido y gratis.',
    'landing.hero_subtitle':
      'Combinamos, dividimos, comprimimos y convertimos en tu dispositivo. Sin cuenta—tus archivos se quedan en tu equipo, no en nuestros servidores.',
    'landing.hero_cta_primary': 'Ver herramientas PDF',
    'landing.hero_cta_secondary': 'Ver herramientas de imagen',
    'landing.filter_toolbar_aria': 'Filtrar herramientas por categoría',
    'landing.filter_all': 'Todas',
    'landing.filter_optimize': 'Optimizar',
    'landing.filter_create': 'Crear',
    'landing.filter_edit': 'Editar',
    'landing.filter_convert': 'Convertir',
    'landing.filter_security': 'Seguridad',
    'landing.filter_empty_pdf':
      'No hay herramientas PDF en esta categoría — prueba Todas u otro filtro.',
    'landing.filter_empty_image':
      'No hay herramientas de imagen en esta categoría — prueba Todas u otro filtro.',
    'landing.why_choose_title': '¿Por qué elegirnos?',
    'landing.why_choose_eyebrow': 'TRANSPARENCIA TOTAL',
    'landing.why_choose_headline_regular':
      'No guardamos tus archivos en nuestros servidores. ',
    'landing.why_choose_headline_emphasis': 'Todo ocurre en tu navegador.',
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
    'pdf_to_word.format_note':
      'El texto se extrae en tu navegador y se guarda como .docx real. No se conservan formato, tablas ni imágenes.',
    'pdf_to_word.convert_failed': 'No se pudo convertir este PDF a Word.',
    
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
    'word_to_pdf.format_note':
      'El .docx se convierte en tu navegador (texto). El .doc antiguo no está soportado: guarda como .docx antes.',
    'word_to_pdf.drop_title': 'Suelta archivos Word aquí o haz clic',
    'word_to_pdf.drop_desc': 'Se recomienda .docx • .doc antiguo no soportado en el navegador',
    'word_to_pdf.doc_legacy_title': '.doc antiguo no soportado',
    'word_to_pdf.doc_legacy_body':
      'Abre el archivo en Word o LibreOffice, guarda como .docx y vuelve a subirlo.',
    'word_to_pdf.invalid_file': 'Usa un archivo .docx.',
    'word_to_pdf.convert_failed': 'No se pudo convertir este archivo a PDF.',
    
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
    'image_rotate.title': 'Rotar imágenes',
    'image_rotate.description':
      'Usa Girar a la izquierda / derecha en el panel (90° por pulsación). Vista previa en vivo; Procesar aplica la rotación total a todas. Formato como el compresor masivo.',
    'image_rotate.preview_hint':
      'La vista previa muestra la rotación acumulada. Botones en el panel: puedes pulsar izquierda o derecha las veces que quieras.',
    'image_rotate.thumbnails_hint': 'Vista previa de otro archivo:',
    'image_rotate.sidebar_rotation_heading': 'Girar (90° por pulsación)',
    'image_rotate.rotate_left': 'Girar a la izquierda',
    'image_rotate.rotate_right': 'Girar a la derecha',
    'image_rotate.net_rotation_label': 'Rotación total (horario):',
    'image_rotate.process': 'Rotar',
    'image_rotate.drop_title': 'Suelta imágenes aquí o haz clic',
    'image_rotate.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Varios archivos',
    'image_blur_face.title': 'Desenfocar caras en fotos',
    'image_blur_face.description':
      'Detecta zonas para desenfocar en tu dispositivo. Arrastra una zona para moverla o usa bordes y esquinas para redimensionar. El deslizador cambia la intensidad. En archivos que no abras en la vista previa, las zonas se eligen al exportar.',
    'image_blur_face.blur_strength': 'Intensidad del desenfoque',
    'image_blur_face.blur_hint': 'Valores altos ocultan más detalle.',
    'image_blur_face.process': 'Desenfocar caras',
    'image_blur_face.drop_title': 'Suelta imágenes aquí o haz clic',
    'image_blur_face.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Varios archivos',
    'image_blur_face.preview_hint':
      'El desenfoque se ve sobre la propia foto. Arrastra dentro de una zona para moverla o usa los controles en bordes y esquinas para redimensionar. El deslizador cambia la intensidad.',
    'image_blur_face.preview_detecting': 'Preparando vista previa…',
    'image_blur_face.preview_no_faces':
      'No se encontró nada automáticamente — usa la zona central: arrástrala o redimensiónala para cubrir lo que quieras desenfocar.',
    'image_blur_face.preview_thumbnails_hint': 'Vista previa de otro archivo:',
    'image_remove_bg.title': 'Quitar fondo de imagen',
    'image_remove_bg.description':
      'Funciona mejor si el fondo es bastante uniforme y se ve en los bordes de la imagen. PNG transparentes; todo en tu dispositivo.',
    'image_remove_bg.process': 'Quitar fondo',
    'image_remove_bg.drop_title': 'Suelta imágenes aquí o haz clic',
    'image_remove_bg.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Varios archivos',
    'image_remove_bg.preview_before':
      'Aquí ves la foto original. Usa Quitar fondo en el panel — la vista previa pasará al recorte transparente.',
    'image_remove_bg.preview_after':
      'Recorte transparente (el patrón indica transparencia). Descarga desde el panel o vuelve a procesar si cambias archivos.',
    'image_remove_bg.preview_thumbnails_hint': 'Vista previa de otro archivo:',
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
    'image_ocr.title': 'Imagen a texto',
    'image_ocr.description':
      'Convierte el texto de tus imágenes en texto que puedes copiar o guardar. Todo ocurre en tu navegador.',
    'image_ocr.drop_title': 'Suelta imágenes aquí o haz clic',
    'image_ocr.drop_desc': 'PNG, JPEG, WebP, GIF • Varios archivos',
    'image_ocr.language_label': 'Idioma del texto en la imagen',
    'image_ocr.lang_auto': 'Auto (más lento)',
    'image_ocr.lang_eng': 'Inglés (English)',
    'image_ocr.lang_spa': 'Español',
    'image_ocr.lang_fra': 'Francés (Français)',
    'image_ocr.combobox_placeholder': 'Elige un idioma…',
    'image_ocr.combobox_search': 'Buscar idiomas…',
    'image_ocr.combobox_empty': 'Ningún idioma coincide.',
    'image_ocr.select_language_first':
      'Selecciona un idioma antes de extraer el texto.',
    'image_ocr.extracting_wait': 'Iniciando…',
    'image_ocr.process': 'Extraer texto',
    'image_ocr.processing': 'Leyendo texto…',
    'image_ocr.progress_label': 'Procesando…',
    'image_ocr.result_heading': 'Texto extraído',
    'image_ocr.placeholder':
      'Añade imágenes y pulsa Extraer texto. El resultado aparece aquí — copia o descarga un .txt o ZIP.',
    'image_ocr.empty_result': '(No se detectó texto.)',
    'image_ocr.copy_all': 'Copiar todo el texto',
    'image_ocr.download_txt': 'Descargar un .txt',
    'image_ocr.download_zip': 'Descargar .txt en ZIP',
    'image_ocr.success': 'Texto extraído',
    'image_ocr.copied': 'Copiado al portapapeles',
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
    'image_tools.face_blur_model_failed':
      'No se pudieron cargar las herramientas de privacidad en el navegador. Revisa la conexión e inténtalo de nuevo.',
    'image_tools.remove_bg_failed':
      'No se pudo quitar el fondo. Revisa la conexión, prueba otras imágenes o inténtalo de nuevo.',
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
    'nav.image_rotate': 'Rotation d\'images',
    'nav.image_blur_face': 'Flouter les visages',
    'nav.image_remove_bg': 'Supprimer le fond',
    'nav.image_watermark': 'Filigrane image',
    'nav.image_ocr': 'Image vers texte',
    
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
    'landing.image_rotate_desc':
      'Faites pivoter plusieurs photos à 90°, 180° ou 270° dans le navigateur. Fichiers séparés ou ZIP.',
    'landing.image_blur_face_desc':
      'Détecte les visages et les floute pour la confidentialité. Dans le navigateur ; images ou ZIP.',
    'landing.image_remove_bg_desc':
      'Effacez les fonds unis ou réguliers (studio, murs) et téléchargez des PNG transparents — tout dans le navigateur.',
    'landing.image_watermark_desc':
      'Texte ou logo en filigrane. Déplacez, redimensionnez, réglage de l\'opacité — téléchargement PNG dans le navigateur.',
    'landing.image_ocr_desc':
      'Extrayez le texte des images dans le navigateur. Choisissez la langue, puis copiez ou enregistrez.',
    
    // Landing page content
    'landing.hero_eyebrow': 'OUTILS PDF ET IMAGE',
    'landing.hero_headline_before': 'Traitez vos documents ',
    'landing.hero_headline_highlight': 'dans le navigateur',
    'landing.hero_headline_after': '—privé, rapide et gratuit.',
    'landing.hero_subtitle':
      'Fusion, découpage, compression et conversion sur votre appareil. Sans compte—vos fichiers restent sur votre machine, pas sur nos serveurs.',
    'landing.hero_cta_primary': 'Parcourir les outils PDF',
    'landing.hero_cta_secondary': 'Parcourir les outils image',
    'landing.filter_toolbar_aria': 'Filtrer les outils par catégorie',
    'landing.filter_all': 'Tout',
    'landing.filter_optimize': 'Optimiser',
    'landing.filter_create': 'Créer',
    'landing.filter_edit': 'Modifier',
    'landing.filter_convert': 'Convertir',
    'landing.filter_security': 'Sécurité',
    'landing.filter_empty_pdf':
      'Aucun outil PDF dans cette catégorie — essayez Tout ou un autre filtre.',
    'landing.filter_empty_image':
      'Aucun outil image dans cette catégorie — essayez Tout ou un autre filtre.',
    'landing.why_choose_title': 'Pourquoi nous choisir ?',
    'landing.why_choose_eyebrow': 'TRANSPARENCE TOTALE',
    'landing.why_choose_headline_regular':
      'Nous ne stockons pas vos fichiers sur nos serveurs. ',
    'landing.why_choose_headline_emphasis':
      'Tout s\'exécute dans votre navigateur.',
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
    'pdf_to_word.format_note':
      'Le texte est extrait dans le navigateur et enregistré en .docx valide. Mise en forme, tableaux et images ne sont pas conservés.',
    'pdf_to_word.convert_failed': 'Impossible de convertir ce PDF en Word.',
    
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
    'word_to_pdf.format_note':
      'Le .docx est converti dans le navigateur (texte). L’ancien .doc n’est pas pris en charge : enregistrez en .docx d’abord.',
    'word_to_pdf.drop_title': 'Déposez des fichiers Word ici ou cliquez',
    'word_to_pdf.drop_desc': '.docx recommandé • ancien .doc non pris en charge dans le navigateur',
    'word_to_pdf.doc_legacy_title': 'Ancien .doc non pris en charge',
    'word_to_pdf.doc_legacy_body':
      'Ouvrez le fichier dans Word ou LibreOffice, enregistrez au format .docx, puis importez-le à nouveau.',
    'word_to_pdf.invalid_file': 'Veuillez utiliser un fichier .docx.',
    'word_to_pdf.convert_failed': 'Impossible de convertir ce fichier en PDF.',
    
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
    'image_rotate.title': 'Rotation d\'images',
    'image_rotate.description':
      'Utilisez Pivoter à gauche / à droite dans le panneau (90° par clic). Aperçu en direct ; Traiter applique la rotation totale à toutes. Format comme le compresseur en masse.',
    'image_rotate.preview_hint':
      'L’aperçu reflète la rotation cumulée. Boutons dans le panneau : vous pouvez cliquer autant de fois que nécessaire.',
    'image_rotate.thumbnails_hint': 'Aperçu d’un autre fichier :',
    'image_rotate.sidebar_rotation_heading': 'Pivoter (90° par clic)',
    'image_rotate.rotate_left': 'Pivoter à gauche',
    'image_rotate.rotate_right': 'Pivoter à droite',
    'image_rotate.net_rotation_label': 'Rotation totale (horaire) :',
    'image_rotate.process': 'Pivoter',
    'image_rotate.drop_title': 'Déposez des images ici ou cliquez',
    'image_rotate.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Fichiers multiples',
    'image_blur_face.title': 'Flouter les visages sur les photos',
    'image_blur_face.description':
      'Repère des zones à flouter sur votre appareil. Glissez une zone pour la déplacer, ou utilisez les bords et les coins pour la redimensionner. Le curseur règle l’intensité. Pour les fichiers non ouverts dans l’aperçu, les zones sont choisies à l’export.',
    'image_blur_face.blur_strength': 'Intensité du flou',
    'image_blur_face.blur_hint': 'Des valeurs plus élevées masquent davantage de détails.',
    'image_blur_face.process': 'Flouter les visages',
    'image_blur_face.drop_title': 'Déposez des images ici ou cliquez',
    'image_blur_face.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Fichiers multiples',
    'image_blur_face.preview_hint':
      'Le flou apparaît directement sur la photo. Glissez à l’intérieur d’une zone pour la déplacer, ou utilisez les poignées sur les bords et les coins. Le curseur règle l’intensité.',
    'image_blur_face.preview_detecting': 'Préparation de l’aperçu…',
    'image_blur_face.preview_no_faces':
      'Rien n’a été détecté automatiquement — utilisez la zone au centre : déplacez-la ou redimensionnez-la pour couvrir ce que vous voulez flouter.',
    'image_blur_face.preview_thumbnails_hint': 'Aperçu d’un autre fichier :',
    'image_remove_bg.title': 'Supprimer le fond d’image',
    'image_remove_bg.description':
      'Idéal si l’arrière-plan est assez uniforme et visible sur les bords. PNG transparents ; tout est traité sur votre appareil.',
    'image_remove_bg.process': 'Supprimer le fond',
    'image_remove_bg.drop_title': 'Déposez des images ici ou cliquez',
    'image_remove_bg.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Fichiers multiples',
    'image_remove_bg.preview_before':
      'Vous voyez ici la photo d’origine. Utilisez Supprimer le fond dans le panneau — l’aperçu passera au détourage transparent.',
    'image_remove_bg.preview_after':
      'Détourage transparent (le motif indique la transparence). Téléchargez depuis le panneau ou relancez après avoir changé de fichiers.',
    'image_remove_bg.preview_thumbnails_hint': 'Aperçu d’un autre fichier :',
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
    'image_ocr.title': 'Image vers texte',
    'image_ocr.description':
      'Transformez le texte visible sur vos images en texte à copier ou enregistrer. Tout se passe dans le navigateur.',
    'image_ocr.drop_title': 'Déposez des images ici ou cliquez',
    'image_ocr.drop_desc': 'PNG, JPEG, WebP, GIF • Plusieurs fichiers',
    'image_ocr.language_label': 'Langue du texte sur l’image',
    'image_ocr.lang_auto': 'Auto (plus lent)',
    'image_ocr.lang_eng': 'Anglais (English)',
    'image_ocr.lang_spa': 'Espagnol (Español)',
    'image_ocr.lang_fra': 'Français',
    'image_ocr.combobox_placeholder': 'Choisir une langue…',
    'image_ocr.combobox_search': 'Rechercher une langue…',
    'image_ocr.combobox_empty': 'Aucune langue ne correspond.',
    'image_ocr.select_language_first':
      'Choisissez une langue avant d’extraire le texte.',
    'image_ocr.extracting_wait': 'Démarrage…',
    'image_ocr.process': 'Extraire le texte',
    'image_ocr.processing': 'Lecture du texte…',
    'image_ocr.progress_label': 'Traitement…',
    'image_ocr.result_heading': 'Texte extrait',
    'image_ocr.placeholder':
      'Ajoutez des images, puis lancez Extraire le texte. Le résultat apparaît ici — copiez ou téléchargez un .txt ou un ZIP.',
    'image_ocr.empty_result': '(Aucun texte détecté.)',
    'image_ocr.copy_all': 'Copier tout le texte',
    'image_ocr.download_txt': 'Télécharger un fichier .txt',
    'image_ocr.download_zip': 'Télécharger les .txt en ZIP',
    'image_ocr.success': 'Texte extrait',
    'image_ocr.copied': 'Copié dans le presse-papiers',
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
    'image_tools.face_blur_model_failed':
      'Impossible de charger les outils de confidentialité dans le navigateur. Vérifiez la connexion et réessayez.',
    'image_tools.remove_bg_failed':
      'Impossible de supprimer les arrière-plans. Vérifiez la connexion, essayez d’autres images ou réessayez.',
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
