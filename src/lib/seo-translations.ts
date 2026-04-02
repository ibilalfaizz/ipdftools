import type { LocaleCode } from "@/lib/urlPaths";

/** SEO strings only — merged into `LanguageContext` translations. */
export const seoTranslations: Record<LocaleCode, Record<string, string>> = {
  en: {
    "seo.site_name": "iPDFTOOLS",
    "seo.default.title":
      "iPDFTOOLS — Bulk PDF & Image Tools | Batch 100s of Files in Your Browser",
    "seo.default.description":
      "Free bulk PDF and image tools: merge, split, compress, and batch-convert dozens or hundreds of files in your browser—bulk resize, WebP/JPG, HEIC, OCR, crop, watermark, and more. Private; no uploads to our servers.",
    "seo.merge.title": "Bulk PDF Merger — Combine Many PDFs into One Online Free",
    "seo.merge.description":
      "Merge multiple PDFs into one document—queue dozens of files, reorder pages, and export in your browser. Fast bulk PDF merger; files stay on your device.",
    "seo.split.title": "PDF Splitter — Split Large PDFs & Extract Pages Online Free",
    "seo.split.description":
      "Split PDFs by pages or ranges—break huge PDFs into smaller files. Extract what you need in your browser; private and free.",
    "seo.compress.title": "Bulk PDF Compressor — Shrink Many PDFs Online Free",
    "seo.compress.description":
      "Compress PDFs to cut file size while keeping quality—batch many documents in your browser before email or storage.",
    "seo.rotate.title": "Rotate PDF Pages Online — Batch Fix Orientation Free",
    "seo.rotate.description":
      "Rotate PDF pages 90°, 180°, or 270°—process many files in one go in your browser. Quick, free, and private.",
    "seo.sign_pdf.title":
      "Sign PDF Online Free — Type, Draw, or Image Signature in Your Browser",
    "seo.sign_pdf.description":
      "Add signatures, initials, or stamps to PDFs. Handwriting styles, colors, or upload a scan. Last, first, or all pages—files stay on your device.",
    "seo.pdf_to_word.title": "Bulk PDF to Word — Convert Many PDFs to DOCX Online",
    "seo.pdf_to_word.description":
      "Convert PDFs to editable Word documents—run batch PDF-to-DOCX in your browser. Accurate conversion without server uploads.",
    "seo.pdf_to_jpg.title": "PDF to JPG — Bulk Export Pages as Images Online",
    "seo.pdf_to_jpg.description":
      "Export PDF pages as high-quality JPEGs—batch many pages or whole folders of PDFs in your browser. Fast PDF-to-image conversion.",
    "seo.pdf_to_text.title": "PDF to Text — Extract Text from Many PDFs Online",
    "seo.pdf_to_text.description":
      "Pull text from PDFs for copying or search—batch-friendly extraction in your browser. Free and private.",
    "seo.word_to_pdf.title": "Bulk Word to PDF — Convert Many DOCX Files Online",
    "seo.word_to_pdf.description":
      "Convert Word to PDF in bulk—batch DOC/DOCX to PDF in your browser with layout-friendly output.",
    "seo.jpg_to_pdf.title": "Bulk JPG to PDF — Combine 100s of Images into PDFs Online",
    "seo.jpg_to_pdf.description":
      "Turn JPG, PNG, and more into PDFs—queue many images at once, set page size, and download from your browser.",
    "seo.pdf_workflow.title":
      "PDF Workflow — Bulk Chain Merge, Compress, Split & Rotate in Browser",
    "seo.pdf_workflow.description":
      "Automate PDF work: chain merge, split, compress, and rotate in one workflow. Save presets—ideal when you process dozens or hundreds of files.",
    "seo.image_workflow.title":
      "Image Workflow — Bulk Resize, Compress & Convert in One Pipeline",
    "seo.image_workflow.description":
      "Chain image steps into one flow: batch resize, compress, rotate, and convert formats. Save workflows; process many files locally.",
    "seo.image_resize.title":
      "Bulk Image Resizer — Resize 100s of Photos to the Same Size Online",
    "seo.image_resize.description":
      "Resize many images at once—same width, height, and center crop for hundreds of files. ZIP or individual downloads; runs in your browser.",
    "seo.image_compress.title":
      "Bulk Image Compressor — Shrink 100s of PNG, WebP & JPEGs Losslessly",
    "seo.image_compress.description":
      "Batch lossless compression for smaller PNG, WebP, and JPEG files—queue dozens or hundreds of images and download a ZIP or separate files.",
    "seo.image_webp.title": "Bulk WebP Converter — Turn 100s of Images to WebP Online",
    "seo.image_webp.description":
      "Convert many images to WebP in one batch—smaller files, high quality. ZIP or per-file download; all in your browser.",
    "seo.image_jpg.title":
      "Bulk JPG Converter — PNG, WebP & More to JPEG (100s of Files)",
    "seo.image_jpg.description":
      "Batch-convert many images to widely compatible JPG—drop whole folders, get a ZIP or individual JPEGs. Free in-browser conversion.",
    "seo.image_gif.title": "Bulk Images to GIF — Build Animated GIFs from 100s of Frames",
    "seo.image_gif.description":
      "Combine many photos into animated GIFs—set timing and loop. Great for slideshows and social; processing stays on your device.",
    "seo.image_crop.title": "Bulk Image Crop — Same Crop Across 100s of Photos Online",
    "seo.image_crop.description":
      "Crop many images with one frame or exact pixels—apply the same region to dozens or hundreds of files. ZIP or single downloads.",
    "seo.image_rotate.title":
      "Bulk Image Rotator — Turn 100s of Photos 90°/180°/270° Online",
    "seo.image_rotate.description":
      "Rotate many images in one batch—pick clockwise angle, then download each file or one ZIP. All processing in your browser.",
    "seo.image_blur_face.title":
      "Bulk Blur Faces in Photos — Privacy for 100s of Images Online",
    "seo.image_blur_face.description":
      "Auto-detect and blur faces across many photos—batch privacy for large sets. Adjust regions, then export PNG/WebP/JPEG or a ZIP.",
    "seo.image_watermark.title":
      "Bulk Watermark Images — Text or Logo on 100s of Files Online",
    "seo.image_watermark.description":
      "Add watermarks to many images at once—position, opacity, and size controls. Download PNGs or a ZIP; runs locally.",
    "seo.image_remove_background.title":
      "Bulk Remove Background — Transparent PNGs for 100s of Images Online",
    "seo.image_remove_background.description":
      "Erase backgrounds from many photos in batch—studio or solid backdrops to transparent PNGs. Private browser processing.",
    "seo.image_ocr.title": "Bulk Image to Text (OCR) — Extract Text from 100s of Images",
    "seo.image_ocr.description":
      "OCR many images at once—English, Spanish, or French. Copy text or export .txt or ZIP; no file upload to our servers.",
    "seo.image_heic_to_jpg.title":
      "Bulk HEIC to JPG — Convert 100s of iPhone Photos Online Free",
    "seo.image_heic_to_jpg.description":
      "Batch-convert HEIC/HEIF to JPEG—queue hundreds of iPhone photos and download JPGs or a ZIP in your browser.",
    "seo.image_motion_blur.title":
      "Bulk Motion & Gaussian Blur — Process 100s of Photos in Browser",
    "seo.image_motion_blur.description":
      "Apply motion or Gaussian blur to many images—optional background-only blur. Batch export PNG, WebP, or JPEG or a ZIP.",
  },
  es: {
    "seo.site_name": "iPDFTOOLS",
    "seo.default.title":
      "iPDFTOOLS — Herramientas PDF e imagen masivas | Cientos de archivos en el navegador",
    "seo.default.description":
      "Herramientas PDF e imagen gratuitas y masivas: fusiona, divide, comprime y convierte por lotes decenas o cientos de archivos en tu navegador—redimensionado, WebP/JPG, HEIC, OCR, recorte y más. Privado; sin subidas a nuestros servidores.",
    "seo.merge.title": "Combinar PDF en masa — Unir muchos archivos PDF en uno gratis",
    "seo.merge.description":
      "Fusiona varios PDF en un solo documento—añade decenas de archivos, reordena páginas y exporta en el navegador. Tus archivos no salen del dispositivo.",
    "seo.split.title": "Dividir PDF — Separar PDF grandes y extraer páginas gratis",
    "seo.split.description":
      "Divide PDF por páginas o rangos—parte documentos muy grandes en archivos más pequeños en tu navegador; rápido y privado.",
    "seo.compress.title": "Comprimir PDF en masa — Reducir muchos PDF online gratis",
    "seo.compress.description":
      "Comprime PDF para reducir tamaño manteniendo calidad—procesa muchos documentos por lotes en el navegador antes de enviar o guardar.",
    "seo.rotate.title": "Rotar PDF online — Corregir orientación de muchos archivos",
    "seo.rotate.description":
      "Rota páginas a 90°, 180° o 270°—procesa muchos PDF seguidos en el navegador. Gratis y privado.",
    "seo.sign_pdf.title": "Firmar PDF online gratis — en tu navegador",
    "seo.sign_pdf.description":
      "Añade firma, iniciales o sello. Estilos manuscritos, colores o imagen escaneada. Última, primera o todas las páginas; archivos en tu dispositivo.",
    "seo.pdf_to_word.title": "PDF a Word en masa — Convertir muchos PDF a DOCX online",
    "seo.pdf_to_word.description":
      "Convierte PDF a Word editables—conversiones por lotes en el navegador. PDF a DOC/DOCX preciso sin subir a servidor.",
    "seo.pdf_to_jpg.title": "PDF a JPG en masa — Exportar muchas páginas como imágenes",
    "seo.pdf_to_jpg.description":
      "Exporta páginas PDF a JPEG de alta calidad—procesa muchas páginas o carpetas de PDF en el navegador.",
    "seo.pdf_to_text.title": "PDF a texto — Extraer texto de muchos PDF online",
    "seo.pdf_to_text.description":
      "Extrae texto de PDF para copiar o buscar—ideal para lotes de documentos en el navegador. Rápido y privado.",
    "seo.word_to_pdf.title": "Word a PDF en masa — Convertir muchos DOCX a PDF online",
    "seo.word_to_pdf.description":
      "Convierte Word a PDF por lotes—DOC/DOCX a PDF en el navegador con buen resultado de maquetación.",
    "seo.jpg_to_pdf.title": "JPG a PDF en masa — Cientos de imágenes a PDF online",
    "seo.jpg_to_pdf.description":
      "Convierte JPG, PNG y más a PDF—añade muchas imágenes a la vez, ajusta tamaño de página y descarga en el navegador.",
    "seo.pdf_workflow.title":
      "Flujo PDF — Encadenar fusión, compresión, división y rotación en masa",
    "seo.pdf_workflow.description":
      "Automatiza tareas PDF: encadena herramientas en un flujo. Guarda configuraciones—ideal si procesas decenas o cientos de archivos.",
    "seo.image_workflow.title":
      "Flujo de imágenes — Redimensionar, comprimir y convertir por lotes",
    "seo.image_workflow.description":
      "Encadena pasos en un solo flujo: redimensionado, compresión, rotación y conversión masiva. Guarda flujos; todo en local.",
    "seo.image_resize.title":
      "Redimensionador masivo — Mismo tamaño para cientos de fotos online",
    "seo.image_resize.description":
      "Redimensiona muchas imágenes a la vez—mismo ancho, alto y recorte centrado. Descarga ZIP o archivos sueltos en el navegador.",
    "seo.image_compress.title":
      "Compresión masiva sin pérdida — Cientos de PNG, WebP y JPEG más ligeros",
    "seo.image_compress.description":
      "Comprime por lotes sin pérdida de calidad—cola de decenas o cientos de imágenes; ZIP o descargas individuales.",
    "seo.image_webp.title": "Conversor masivo a WebP — Cientos de imágenes online",
    "seo.image_webp.description":
      "Convierte muchas imágenes a WebP en un solo lote—archivos más pequeños y buena calidad. ZIP o archivo por imagen.",
    "seo.image_jpg.title": "Conversor masivo a JPG — Cientos de archivos a JPEG",
    "seo.image_jpg.description":
      "Convierte por lotes PNG, WebP, GIF y más a JPG compatible—carpetas enteras, ZIP o JPEG sueltos en el navegador.",
    "seo.image_gif.title": "Imágenes a GIF en masa — Animar muchas fotos online",
    "seo.image_gif.description":
      "Combina muchas fotos en GIF animados—ajusta tiempo y bucle. Ideal para presentaciones; todo en tu dispositivo.",
    "seo.image_crop.title": "Recorte masivo — Misma zona en cientos de fotos online",
    "seo.image_crop.description":
      "Recorta muchas imágenes con un marco o píxeles exactos—misma zona en decenas o cientos de archivos. ZIP o sueltos.",
    "seo.image_rotate.title":
      "Rotación masiva — Gira cientos de fotos 90°/180°/270° online",
    "seo.image_rotate.description":
      "Rota muchas imágenes en un solo lote—elige ángulo y descarga cada archivo o un ZIP. Procesamiento en el navegador.",
    "seo.image_blur_face.title":
      "Desenfocar caras en masa — Privacidad para cientos de fotos",
    "seo.image_blur_face.description":
      "Detecta y desenfoca caras en muchas fotos—lotes grandes para privacidad. Ajusta zonas; PNG/WebP/JPEG o ZIP.",
    "seo.image_watermark.title":
      "Marca de agua masiva — Texto o logo en cientos de imágenes",
    "seo.image_watermark.description":
      "Marca muchas imágenes a la vez—posición, opacidad y tamaño. Descarga PNG o ZIP en local.",
    "seo.image_remove_background.title":
      "Quitar fondo en masa — PNG transparentes para cientos de imágenes",
    "seo.image_remove_background.description":
      "Elimina fondos de muchas fotos por lotes—estudio o fondos lisos a PNG transparentes. Privado en el navegador.",
    "seo.image_ocr.title": "OCR masivo — Texto de cientos de imágenes online",
    "seo.image_ocr.description":
      "OCR por lotes en inglés, español o francés—copia texto o exporta .txt o ZIP sin subir archivos a nuestros servidores.",
    "seo.image_heic_to_jpg.title":
      "HEIC a JPG en masa — Cientos de fotos de iPhone a JPEG",
    "seo.image_heic_to_jpg.description":
      "Convierte HEIC/HEIF a JPEG por lotes—cola de cientos de fotos y descarga JPG o ZIP en el navegador.",
    "seo.image_motion_blur.title":
      "Desenfoque masivo — Movimiento y gaussiano para muchas fotos",
    "seo.image_motion_blur.description":
      "Aplica desenfoque a muchas imágenes—opción solo fondo. Exporta por lotes PNG, WebP, JPEG o ZIP.",
  },
  fr: {
    "seo.site_name": "iPDFTOOLS",
    "seo.default.title":
      "iPDFTOOLS — Outils PDF et image en masse | Des centaines de fichiers dans le navigateur",
    "seo.default.description":
      "Outils PDF et image gratuits en masse : fusionnez, divisez, compressez et convertissez par lots des dizaines ou des centaines de fichiers dans votre navigateur — redimensionnement, WebP/JPG, HEIC, OCR, recadrage et plus. Privé ; pas d’envoi vers nos serveurs.",
    "seo.merge.title": "Fusion PDF en masse — Combiner de nombreux PDF en un seul gratuitement",
    "seo.merge.description":
      "Fusionnez plusieurs PDF en un document — ajoutez des dizaines de fichiers, réordonnez les pages et exportez dans le navigateur. Vos fichiers restent sur l’appareil.",
    "seo.split.title": "Diviser PDF — Découper de gros PDF et extraire des pages gratuitement",
    "seo.split.description":
      "Divisez des PDF par pages ou plages — découpez de très gros fichiers en plusieurs parties dans le navigateur ; rapide et privé.",
    "seo.compress.title": "Compression PDF en masse — Réduire de nombreux PDF en ligne",
    "seo.compress.description":
      "Compressez des PDF pour réduire la taille tout en gardant la qualité — traitez beaucoup de documents par lots avant envoi ou stockage.",
    "seo.rotate.title": "Rotation PDF en ligne — Corriger l’orientation de nombreux fichiers",
    "seo.rotate.description":
      "Faites pivoter les pages à 90°, 180° ou 270° — enchaînez plusieurs PDF dans le navigateur. Gratuit et privé.",
    "seo.sign_pdf.title": "Signer un PDF en ligne gratuitement — dans le navigateur",
    "seo.sign_pdf.description":
      "Ajoutez signature, initiales ou tampon. Styles manuscrits, couleurs ou image importée. Dernière, première ou toutes les pages ; fichiers sur votre appareil.",
    "seo.pdf_to_word.title": "PDF vers Word en masse — Convertir de nombreux PDF en DOCX",
    "seo.pdf_to_word.description":
      "Convertissez des PDF en Word modifiables — conversions par lots dans le navigateur. PDF vers DOC/DOCX précis sans envoi serveur.",
    "seo.pdf_to_jpg.title": "PDF vers JPG en masse — Exporter de nombreuses pages en images",
    "seo.pdf_to_jpg.description":
      "Exportez des pages PDF en JPEG haute qualité — traitez de nombreuses pages ou dossiers de PDF dans le navigateur.",
    "seo.pdf_to_text.title": "PDF vers texte — Extraire le texte de nombreux PDF en ligne",
    "seo.pdf_to_text.description":
      "Extrayez le texte des PDF pour copier ou rechercher — adapté aux lots de documents dans le navigateur. Rapide et privé.",
    "seo.word_to_pdf.title": "Word vers PDF en masse — Convertir de nombreux DOCX en PDF",
    "seo.word_to_pdf.description":
      "Convertissez Word en PDF par lots — DOC/DOCX vers PDF dans le navigateur avec une mise en page fidèle.",
    "seo.jpg_to_pdf.title": "JPG vers PDF en masse — Des centaines d’images en PDF en ligne",
    "seo.jpg_to_pdf.description":
      "Transformez JPG, PNG et plus en PDF — ajoutez de nombreuses images à la fois, réglez le format de page et téléchargez dans le navigateur.",
    "seo.pdf_workflow.title":
      "Workflow PDF — Enchaîner fusion, compression, division et rotation en masse",
    "seo.pdf_workflow.description":
      "Automatisez le travail PDF : enchaînez les outils dans un flux. Enregistrez des préréglages — idéal pour des dizaines ou des centaines de fichiers.",
    "seo.image_workflow.title":
      "Workflow image — Redimensionnement, compression et conversion par lots",
    "seo.image_workflow.description":
      "Enchaînez les étapes : redimensionnement, compression, rotation et conversion de formats. Enregistrez des flux ; traitement local.",
    "seo.image_resize.title":
      "Redimensionnement massif — Même taille pour des centaines de photos en ligne",
    "seo.image_resize.description":
      "Redimensionnez de nombreuses images à la fois — même largeur, hauteur et recadrage centré. ZIP ou fichiers séparés dans le navigateur.",
    "seo.image_compress.title":
      "Compression sans perte en masse — Des centaines de PNG, WebP et JPEG allégés",
    "seo.image_compress.description":
      "Compression par lots sans perte — file d’attente de dizaines ou de centaines d’images ; ZIP ou téléchargements séparés.",
    "seo.image_webp.title": "Conversion WebP en masse — Des centaines d’images en ligne",
    "seo.image_webp.description":
      "Convertissez de nombreuses images en WebP en un seul lot — fichiers plus légers, bonne qualité. ZIP ou fichier par image.",
    "seo.image_jpg.title": "Conversion JPG en masse — Des centaines de fichiers en JPEG",
    "seo.image_jpg.description":
      "Conversion par lots PNG, WebP, GIF et plus vers JPEG — dossiers entiers, ZIP ou fichiers séparés dans le navigateur.",
    "seo.image_gif.title": "Images vers GIF en masse — Animer de nombreuses photos en ligne",
    "seo.image_gif.description":
      "Assemblez de nombreuses photos en GIF animés — réglage du délai et de la boucle. Idéal pour diaporamas ; tout sur l’appareil.",
    "seo.image_crop.title": "Recadrage massif — Même zone sur des centaines de photos",
    "seo.image_crop.description":
      "Recadrez de nombreuses images avec un cadre ou des pixels — même zone sur des dizaines ou des centaines de fichiers. ZIP ou séparés.",
    "seo.image_rotate.title":
      "Rotation massive — Pivoter des centaines de photos 90°/180°/270° en ligne",
    "seo.image_rotate.description":
      "Faites pivoter de nombreuses images en un lot — choisissez l’angle, puis téléchargez chaque fichier ou une archive ZIP. Dans le navigateur.",
    "seo.image_blur_face.title":
      "Floutage des visages en masse — Confidentialité pour des centaines d’images",
    "seo.image_blur_face.description":
      "Détection et floutage sur de nombreuses photos — lots importants pour la confidentialité. Ajustez les zones ; images ou ZIP.",
    "seo.image_watermark.title":
      "Filigrane en masse — Texte ou logo sur des centaines d’images",
    "seo.image_watermark.description":
      "Appliquez un filigrane à de nombreuses images — position, opacité et taille. Téléchargez des PNG ou une archive ZIP en local.",
    "seo.image_remove_background.title":
      "Suppression de fond en masse — PNG transparents pour des centaines d’images",
    "seo.image_remove_background.description":
      "Supprimez les arrière-plans de nombreuses photos par lots — studio ou fonds unis vers PNG transparents. Privé dans le navigateur.",
    "seo.image_ocr.title": "OCR en masse — Texte extrait de centaines d’images en ligne",
    "seo.image_ocr.description":
      "OCR par lots en anglais, espagnol ou français — copiez le texte ou exportez .txt ou ZIP sans envoyer vos fichiers sur nos serveurs.",
    "seo.image_heic_to_jpg.title":
      "HEIC vers JPG en masse — Des centaines de photos iPhone en JPEG",
    "seo.image_heic_to_jpg.description":
      "Convertissez HEIC/HEIF en JPEG par lots — file de centaines de photos et téléchargement JPG ou ZIP dans le navigateur.",
    "seo.image_motion_blur.title":
      "Flou en masse — Mouvement et gaussien pour de nombreuses photos",
    "seo.image_motion_blur.description":
      "Appliquez un flou à de nombreuses images — option arrière-plan seul. Export par lots PNG, WebP, JPEG ou ZIP.",
  },
};
