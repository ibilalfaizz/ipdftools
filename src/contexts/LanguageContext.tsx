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
    'nav.sign_pdf': 'Sign PDF',
    'nav.pdf_to_word': 'PDF to Word',
    'nav.pdf_to_jpg': 'PDF to JPG',
    'nav.pdf_to_text': 'PDF to Text',
    'nav.word_to_pdf': 'Word to PDF',
    'nav.jpg_to_pdf': 'JPG to PDF',
    'nav.pdf_workflow': 'PDF workflow',
    'nav.image_workflow': 'Image workflow',
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
    'nav.image_motion_blur': 'Motion blur',
    'nav.image_remove_bg': 'Remove background',
    'nav.image_watermark': 'Image watermark',
    'nav.image_ocr': 'Image to text',
    'nav.image_heic_jpg': 'HEIC to JPG',
    'nav.login': 'Log in',
    'nav.account': 'Account',
    'auth.sign_in_google': 'Sign in with Google',
    'auth.sign_out': 'Sign out',
    'login.title': 'Log in or sign up',
    'login.subtitle': 'Use your email or Google to access your account.',
    'login.tab_sign_in': 'Log in',
    'login.tab_sign_up': 'Sign up',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.password_hint': 'At least 6 characters.',
    'login.submit_sign_in': 'Log in',
    'login.submit_sign_up': 'Create account',
    'login.or': 'or',
    'login.continue_google': 'Continue with Google',
    'login.check_email': 'Check your inbox to confirm your email, then sign in.',
    'login.back_home': 'Back to home',

    'account.title': 'Account',
    'account.subtitle': 'Profile and saved workflows.',
    'account.tab_profile': 'Profile',
    'account.tab_workflows': 'Workflows',
    'account.profile_title': 'Your profile',
    'account.profile_desc': 'Email and session.',
    'account.pdf_workflows': 'PDF workflows',
    'account.image_workflows': 'Image workflows',
    'account.no_workflows_pdf':
      'Create a new workflow — you don’t have any PDF workflows saved yet.',
    'account.no_workflows_image':
      'Create a new workflow — you don’t have any image workflows saved yet.',
    'account.create_new_workflow': 'Create new workflow',
    'account.open_workflow': 'Open',
    'account.steps': 'Steps',
    'account.updated': 'Updated',
    'account.delete_workflow': 'Delete workflow',
    'account.delete_failed': 'Could not delete the workflow. Try again.',
    'account.menu_title': 'Dashboard',
    'account.nav_aria': 'Account sections',
    
    // URL paths
    'url.merge': 'merge-pdf',
    'url.split': 'split-pdf',
    'url.compress': 'compress-pdf',
    'url.rotate': 'rotate-pdf',
    'url.sign_pdf': 'sign-pdf',
    'url.pdf_to_word': 'pdf-to-word',
    'url.pdf_to_jpg': 'pdf-to-jpg',
    'url.pdf_to_text': 'pdf-to-text',
    'url.word_to_pdf': 'word-to-pdf',
    'url.jpg_to_pdf': 'jpg-to-pdf',
    'url.pdf_workflow': 'pdf-workflow',
    'url.image_workflow': 'image-workflow',
    
    // Landing page descriptions (SEO: primary intent keywords + “online / browser / free” where natural)
    'landing.merge_desc':
      'Merge PDF files online for free—combine multiple PDFs into one document in your browser. Private and fast.',
    'landing.split_desc':
      'Split PDF online: extract pages or divide one PDF into multiple files. Runs locally in your browser—no uploads to our servers.',
    'landing.compress_desc':
      'Compress PDF online to shrink file size while keeping quality. Reduce PDFs in your browser before sharing or storing.',
    'landing.rotate_desc':
      'Rotate PDF pages online—90°, 180°, or 270°. Free PDF rotator in your browser; fix orientation instantly.',
    'landing.sign_pdf_desc':
      'Sign PDF online: add typed, drawn, or image signatures, initials, and stamps. E-sign PDFs in your browser; files stay on your device.',
    'landing.pdf_to_word_desc':
      'PDF to Word converter online: turn PDFs into editable DOCX files in your browser. Free PDF to Word—no software install.',
    'landing.pdf_to_jpg_desc':
      'PDF to JPG online: export PDF pages as high-quality JPEG images. Free PDF to image converter in your browser.',
    'landing.pdf_to_text_desc':
      'PDF to text online: extract and copy text from PDFs for free in your browser. Fast PDF text extractor.',
    'landing.word_to_pdf_desc':
      'Word to PDF online: convert DOCX to PDF in your browser. Secure, free Word to PDF converter with layout preserved.',
    'landing.jpg_to_pdf_desc':
      'JPG to PDF online: combine images into one PDF or set page size. Free image-to-PDF converter in your browser.',
    'landing.pdf_workflow_desc':
      'PDF workflow builder: chain merge, split, compress, and rotate in one flow. Save setups when signed in; all processing runs in your browser.',
    'landing.image_workflow_desc':
      'Image workflow: connect resize, compress, rotate, and format conversion in one pipeline. Save locally or to your account; runs in your browser.',
    'landing.image_resize_desc':
      'Bulk image resizer online: set width and height with center crop for many photos at once. Free in your browser.',
    'landing.image_compress_desc':
      'Compress images online in bulk: lossless re-compression for smaller PNG, WebP, and JPEG files. Private and fast.',
    'landing.image_webp_desc':
      'Convert images to WebP online in bulk—modern format, high quality, smaller files. Free WebP converter in your browser.',
    'landing.image_jpg_desc':
      'Bulk JPG converter online: turn PNG, WebP, GIF, and more into widely compatible JPEG files in your browser.',
    'landing.image_gif_desc':
      'GIF maker online: build animated GIFs from multiple photos. Set frame timing and loop in the sidebar—runs in your browser.',
    'landing.image_crop_desc':
      'Crop images online: draggable frame or exact pixels, same relative area across multiple files. Free batch crop in your browser.',
    'landing.image_rotate_desc':
      'Rotate images online in bulk—90°, 180°, or 270° clockwise. Download separately or as a ZIP; all in your browser.',
    'landing.image_blur_face_desc':
      'Blur faces in photos online: auto-detect faces for privacy. Process in your browser; download images or a ZIP.',
    'landing.image_motion_blur_desc':
      'Motion blur and Gaussian blur online: angle, distance, and quality. Optionally blur only the background; runs in your browser.',
    'landing.image_remove_bg_desc':
      'Remove background from images online: erase solid or even studio backgrounds, download transparent PNGs in your browser.',
    'landing.image_watermark_desc':
      'Watermark images online: add text or logo, drag to position, set opacity—download PNG in your browser.',
    'landing.image_ocr_desc':
      'Image to text (OCR) online: extract text from pictures in your browser. Choose language; copy or save results.',
    'landing.image_heic_jpg_desc':
      'HEIC to JPG converter online: turn iPhone HEIC/HEIF photos into standard JPEG files. Batch convert in your browser.',
    
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

    'workflow.title': 'PDF workflow',
    'workflow.description':
      'Simplify tasks by connecting tools into one automated workflow. Create custom workflows, fine-tune each step, and save your setup for easy access—no account.',
    'workflow.name_label': 'Workflow name',
    'workflow.name_hint':
      'Optional label so you can recognize this setup. Stored only in this browser tab (session).',
    'workflow.name_placeholder': 'e.g. Invoice pack',
    'workflow.select_tool': 'Select a tool',
    'workflow.select_placeholder': 'Available tools…',
    'workflow.add_step': 'Add step →',
    'workflow.preview_heading': 'Workflow preview',
    'workflow.preview_empty': 'Add at least one step to build your workflow.',
    'workflow.no_more_after_split':
      'No more steps can be added after split (output is multiple files).',
    'workflow.tool_merge': 'Merge PDFs',
    'workflow.tool_compress': 'Compress PDF',
    'workflow.tool_rotate': 'Rotate pages',
    'workflow.tool_split_each': 'Split — one file per page',
    'workflow.tool_split_range': 'Split — custom page ranges',
    'workflow.rotate_angle': 'Rotation',
    'workflow.ranges_label': 'Page ranges',
    'workflow.step_merge': 'Merge PDFs',
    'workflow.step_compress': 'Compress',
    'workflow.step_rotate_90': 'Rotate 90° clockwise',
    'workflow.step_rotate_180': 'Rotate 180°',
    'workflow.step_rotate_270': 'Rotate 270° clockwise (90° counter-clockwise)',
    'workflow.step_split_each': 'Split — each page',
    'workflow.step_split_ranges': 'Split — ranges',
    'workflow.files_heading': 'Files',
    'workflow.files_hint_merge': 'Add two or more PDFs (merge runs first).',
    'workflow.files_hint_single': 'Add one PDF.',
    'workflow.drop_title': 'Drop PDF(s) here or click to browse',
    'workflow.drop_desc': 'PDF only • Runs on your device',
    'workflow.clear_files': 'Clear files',
    'workflow.run': 'Run workflow',
    'workflow.running': 'Running…',
    'workflow.success': 'Download started.',
    'workflow.privacy':
      'No account. Your PDFs are not uploaded to our servers; processing uses your browser only.',
    'workflow.error_no_steps': 'Add at least one workflow step.',
    'workflow.error_merge_files': 'Merge requires at least two PDF files.',
    'workflow.error_need_pdf': 'Add a PDF file.',
    'workflow.error_ranges_required': 'Enter page ranges (e.g. 1-3, 5).',
    'workflow.error_invalid_ranges': 'Could not parse ranges. Check page numbers.',
    'workflow.error_run': 'Workflow failed. Try another PDF or fewer steps.',
    'workflow.load_remote_failed':
      'Could not load this workflow. Sign in or check the link.',
    'workflow.save': 'Save',
    'workflow.saving': 'Saving…',
    'workflow.saved_toast': 'Saved.',
    'workflow.save_error': 'Could not save workflow.',
    'workflow.saved_after_signin': 'Your workflow was saved to your account.',
    'workflow.save_failed_after_signin':
      'Could not save your workflow after sign-in. Try Save again.',

    'image_workflow.title': 'Image workflow',
    'image_workflow.description':
      'Simplify tasks by connecting tools into one automated workflow. Create custom image workflows, fine-tune each step, and save your setup for easy access—no account.',
    'image_workflow.name_label': 'Workflow name',
    'image_workflow.name_hint':
      'Optional label so you can recognize this setup. Stored only in this browser tab (session).',
    'image_workflow.name_placeholder': 'e.g. Product photos',
    'image_workflow.select_tool': 'Select a tool',
    'image_workflow.select_placeholder': 'Available tools…',
    'image_workflow.add_step': 'Add step →',
    'image_workflow.preview_heading': 'Workflow preview',
    'image_workflow.preview_empty': 'Add at least one step to build your workflow.',
    'image_workflow.tool_resize': 'Resize (cover crop)',
    'image_workflow.tool_compress': 'Lossless recompress',
    'image_workflow.tool_rotate': 'Rotate 90° steps',
    'image_workflow.tool_to_webp': 'Convert to WebP',
    'image_workflow.tool_to_jpg': 'Convert to JPG',
    'image_workflow.rotate_angle': 'Rotation',
    'image_workflow.resize_width': 'Width (px)',
    'image_workflow.resize_height': 'Height (px)',
    'image_workflow.step_resize': 'Resize to',
    'image_workflow.step_compress': 'Lossless recompress',
    'image_workflow.step_rotate_0': 'Rotate 0° (re-encode)',
    'image_workflow.step_rotate_90': 'Rotate 90° clockwise',
    'image_workflow.step_rotate_180': 'Rotate 180°',
    'image_workflow.step_rotate_270': 'Rotate 270° clockwise (90° counter-clockwise)',
    'image_workflow.step_to_webp': 'Convert to WebP',
    'image_workflow.step_to_jpg': 'Convert to JPG',
    'image_workflow.files_heading': 'Images',
    'image_workflow.files_hint': 'Add one or more image files.',
    'image_workflow.drop_title': 'Drop images here or click to browse',
    'image_workflow.drop_desc': 'Images only • Runs on your device',
    'image_workflow.clear_files': 'Clear files',
    'image_workflow.run': 'Run workflow',
    'image_workflow.running': 'Running…',
    'image_workflow.success': 'Download started.',
    'image_workflow.privacy':
      'No account. Your images are not uploaded to our servers; processing uses your browser only.',
    'image_workflow.error_no_steps': 'Add at least one workflow step.',
    'image_workflow.error_need_images': 'Add at least one image file.',
    'image_workflow.error_resize_dims': 'Enter width and height in pixels.',
    'image_workflow.error_run': 'Workflow failed. Try other images or fewer steps.',

    'sign_pdf.title': 'Sign PDF',
    'sign_pdf.description':
      'Upload a PDF, set your name and initials, then choose how your signature looks: handwriting styles, freehand drawing, typed text, or an uploaded scan. Your file is not sent to our servers.',
    'sign_pdf.details_heading': 'Set your signature details',
    'sign_pdf.full_name': 'Full name',
    'sign_pdf.full_name_ph': 'Your name',
    'sign_pdf.initials': 'Initials',
    'sign_pdf.initials_ph': 'Your initials',
    'sign_pdf.mode_type': 'Type (plain text)',
    'sign_pdf.mode_style': 'Handwriting styles',
    'sign_pdf.mode_draw': 'Freehand',
    'sign_pdf.mode_upload': 'Upload image',
    'sign_pdf.tab_signature': 'Signature',
    'sign_pdf.tab_initials': 'Initials',
    'sign_pdf.tab_stamp': 'Company stamp',
    'sign_pdf.pick_style': 'Choose a style (preview updates with your name):',
    'sign_pdf.type_hint': 'Uses a clear sans font. Edit the full name field above.',
    'sign_pdf.initials_type_hint': 'Uses a clear sans font. Edit the initials field above.',
    'sign_pdf.upload_pick': 'Choose signature image…',
    'sign_pdf.upload_stamp': 'Choose stamp / logo image…',
    'sign_pdf.company_name': 'Company / stamp text',
    'sign_pdf.company_ph': 'Your company name',
    'sign_pdf.stamp_vector_hint':
      'Renders a simple bordered stamp with the text above. Switch to upload for a logo image.',
    'sign_pdf.draw_hint':
      'Draw your signature with your mouse, pen, or finger. Use the color swatches or picker for ink color.',
    'sign_pdf.draw_use_panel': 'Use the drawing area below.',
    'sign_pdf.draw_stamp_hint':
      'Your drawing will be placed on the PDF like a stamp image.',
    'sign_pdf.pen_size': 'Pen thickness',
    'sign_pdf.clear_drawing': 'Clear drawing',
    'sign_pdf.color_custom': 'Custom color',
    'sign_pdf.color_picker_label': 'Picker',
    'sign_pdf.color': 'Color',
    'sign_pdf.preview_label': 'Preview',
    'sign_pdf.preview_graphic_label': 'Signature graphic',
    'sign_pdf.preview_pdf_toggle': 'Preview signed PDF',
    'sign_pdf.preview_pdf_hint':
      'See your PDF with the signature applied. Updates shortly after you change options.',
    'sign_pdf.preview_pdf_heading': 'Signed document preview',
    'sign_pdf.preview_pdf_loading': 'Updating preview…',
    'sign_pdf.preview_pdf_need_upload':
      'Upload a signature image to generate the PDF preview.',
    'sign_pdf.preview_pdf_need_draw':
      'Draw something in the pad to generate the PDF preview.',
    'sign_pdf.preview_pdf_error':
      'Preview could not be built. Try another PDF or adjust your signature.',
    'sign_pdf.pages_label': 'Place signature on',
    'sign_pdf.pages_last': 'Last page only',
    'sign_pdf.pages_first': 'First page only',
    'sign_pdf.pages_all': 'Every page',
    'sign_pdf.apply': 'Apply signature & download',
    'sign_pdf.processing': 'Signing…',
    'sign_pdf.success': 'Signed PDF downloaded.',
    'sign_pdf.error_no_pdf': 'Add a PDF file first.',
    'sign_pdf.error_no_image': 'Choose an image for upload mode.',
    'sign_pdf.error_no_drawing': 'Draw your signature in the pad first.',
    'sign_pdf.error_process': 'Could not sign this PDF. Try another file.',
    'sign_pdf.drop_title': 'Drop your PDF here or click to browse',
    'sign_pdf.drop_desc': 'One PDF • Maximum size depends on your device',
    'sign_pdf.placeholder_signature': 'Signature',
    'sign_pdf.placeholder_initials': 'AB',
    'sign_pdf.placeholder_company': 'Company',

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
    'image_heic_to_jpg.title': 'HEIC to JPG',
    'image_heic_to_jpg.description':
      'Convert Apple HEIC/HEIF photos to JPEG (quality 92) for sharing and editing anywhere. All processing happens in your browser.',
    'image_heic_to_jpg.process': 'Convert to JPG',
    'image_heic_to_jpg.drop_title': 'Drop HEIC files here or click to browse',
    'image_heic_to_jpg.drop_desc': '.heic / .heif • Multiple files',
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
    'image_motion_blur.title': 'Motion & Gaussian blur',
    'image_motion_blur.description':
      'Choose Gaussian blur or motion blur. Adjust angle, distance, and sample count for motion. Turn on Blur background to keep the subject sharp while blurring the backdrop (uses the same on-device segmentation as remove background).',
    'image_motion_blur.process': 'Apply blur',
    'image_motion_blur.drop_title': 'Drop images here or click to browse',
    'image_motion_blur.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Multiple files',
    'image_motion_blur.blur_type': 'Blur type',
    'image_motion_blur.gaussian': 'Gaussian blur',
    'image_motion_blur.motion': 'Motion blur',
    'image_motion_blur.angle': 'Angle',
    'image_motion_blur.distance': 'Distance',
    'image_motion_blur.radius': 'Radius',
    'image_motion_blur.samples': 'Samples',
    'image_motion_blur.blur_background': 'Blur background',
    'image_motion_blur.blur_background_hint':
      'Detects the main subject and blurs only the backdrop. Works best on clear subjects; may take longer on export.',
    'image_motion_blur.gaussian_sliders_note':
      'Angle and samples apply to motion blur only. The radius slider controls Gaussian strength.',
    'image_motion_blur.preview_hint':
      'Live preview of the first selected image (or the thumbnail you pick).',
    'image_motion_blur.preview_loading': 'Updating preview…',
    'image_motion_blur.preview_error': 'Preview could not be built for this file.',
    'image_motion_blur.preview_thumbnails_hint': 'Preview another file:',
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
    'nav.sign_pdf': 'Firmar PDF',
    'nav.pdf_to_word': 'PDF a Word',
    'nav.pdf_to_jpg': 'PDF a JPG',
    'nav.pdf_to_text': 'PDF a Texto',
    'nav.word_to_pdf': 'Word a PDF',
    'nav.jpg_to_pdf': 'JPG a PDF',
    'nav.pdf_workflow': 'Flujo PDF',
    'nav.image_workflow': 'Flujo de imágenes',
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
    'nav.image_motion_blur': 'Desenfoque de movimiento',
    'nav.image_remove_bg': 'Quitar fondo',
    'nav.image_watermark': 'Marca de agua',
    'nav.image_ocr': 'Imagen a texto',
    'nav.image_heic_jpg': 'HEIC a JPG',
    'nav.login': 'Iniciar sesión',
    'nav.account': 'Cuenta',
    'auth.sign_in_google': 'Iniciar con Google',
    'auth.sign_out': 'Cerrar sesión',
    'login.title': 'Iniciar sesión o registrarse',
    'login.subtitle': 'Usa tu correo o Google para acceder a tu cuenta.',
    'login.tab_sign_in': 'Iniciar sesión',
    'login.tab_sign_up': 'Registrarse',
    'login.email': 'Correo',
    'login.password': 'Contraseña',
    'login.password_hint': 'Al menos 6 caracteres.',
    'login.submit_sign_in': 'Iniciar sesión',
    'login.submit_sign_up': 'Crear cuenta',
    'login.or': 'o',
    'login.continue_google': 'Continuar con Google',
    'login.check_email': 'Revisa tu correo para confirmar la cuenta y luego inicia sesión.',
    'login.back_home': 'Volver al inicio',

    'account.title': 'Cuenta',
    'account.subtitle': 'Perfil y flujos guardados.',
    'account.tab_profile': 'Perfil',
    'account.tab_workflows': 'Flujos',
    'account.profile_title': 'Tu perfil',
    'account.profile_desc': 'Correo y sesión.',
    'account.pdf_workflows': 'Flujos PDF',
    'account.image_workflows': 'Flujos de imagen',
    'account.no_workflows_pdf':
      'Crea un flujo nuevo — aún no tienes flujos PDF guardados.',
    'account.no_workflows_image':
      'Crea un flujo nuevo — aún no tienes flujos de imagen guardados.',
    'account.create_new_workflow': 'Crear flujo nuevo',
    'account.open_workflow': 'Abrir',
    'account.steps': 'Pasos',
    'account.updated': 'Actualizado',
    'account.delete_workflow': 'Eliminar flujo',
    'account.delete_failed': 'No se pudo eliminar el flujo. Inténtalo de nuevo.',
    'account.menu_title': 'Panel',
    'account.nav_aria': 'Secciones de la cuenta',
    
    // URL paths
    'url.merge': 'combinar-pdf',
    'url.split': 'dividir-pdf',
    'url.compress': 'comprimir-pdf',
    'url.rotate': 'rotar-pdf',
    'url.sign_pdf': 'firmar-pdf',
    'url.pdf_to_word': 'pdf-a-word',
    'url.pdf_to_jpg': 'pdf-a-jpg',
    'url.pdf_to_text': 'pdf-a-texto',
    'url.word_to_pdf': 'word-a-pdf',
    'url.jpg_to_pdf': 'jpg-a-pdf',
    'url.pdf_workflow': 'flujo-pdf',
    'url.image_workflow': 'flujo-imagenes',
    
    // Landing page descriptions (SEO: intención + “online / navegador / gratis”)
    'landing.merge_desc':
      'Fusionar PDF online gratis: combina varios PDF en un solo documento en el navegador. Rápido y privado.',
    'landing.split_desc':
      'Dividir PDF online: extrae páginas o separa un PDF en varios archivos. Se procesa en tu navegador; sin subir a nuestros servidores.',
    'landing.compress_desc':
      'Comprimir PDF online para reducir el tamaño manteniendo calidad. Reduce PDFs en el navegador antes de compartir.',
    'landing.rotate_desc':
      'Rotar PDF online: páginas a 90°, 180° o 270°. Corrige la orientación en el navegador; herramienta gratuita.',
    'landing.sign_pdf_desc':
      'Firmar PDF online: firma escrita, dibujada o imagen, iniciales y sellos. Firma electrónica en el navegador; los archivos no salen de tu dispositivo.',
    'landing.pdf_to_word_desc':
      'PDF a Word online: convierte PDF a DOCX editable en el navegador. Convertidor PDF a Word gratis sin instalar programas.',
    'landing.pdf_to_jpg_desc':
      'PDF a JPG online: exporta páginas como imágenes JPEG de alta calidad. Convertidor PDF a imagen gratis en el navegador.',
    'landing.pdf_to_text_desc':
      'PDF a texto online: extrae y copia texto de PDF gratis en el navegador. Extractor de texto de PDF rápido.',
    'landing.word_to_pdf_desc':
      'Word a PDF online: convierte DOCX a PDF en el navegador. Convertidor Word a PDF seguro y gratuito con buen maquetado.',
    'landing.jpg_to_pdf_desc':
      'JPG a PDF online: une imágenes en un PDF o ajusta el tamaño de página. Convertidor de imagen a PDF gratis en el navegador.',
    'landing.pdf_workflow_desc':
      'Flujo PDF: encadena fusionar, dividir, comprimir y rotar en un solo flujo. Guarda configuraciones con cuenta; todo en tu navegador.',
    'landing.image_workflow_desc':
      'Flujo de imagen: conecta redimensionar, comprimir, rotar y convertir en una tubería. Guarda local o en tu cuenta; en el navegador.',
    'landing.image_resize_desc':
      'Redimensionar imágenes en lote online: mismo ancho y alto con recorte centrado. Gratis en tu navegador.',
    'landing.image_compress_desc':
      'Comprimir imágenes online en lote: recompresión sin pérdida para PNG, WebP y JPEG más ligeros. Privado y rápido.',
    'landing.image_webp_desc':
      'Convertir a WebP online en lote: formato moderno, alta calidad, archivos más pequeños. Gratis en el navegador.',
    'landing.image_jpg_desc':
      'Convertidor JPG en lote online: de PNG, WebP, GIF y más a JPEG compatible en el navegador.',
    'landing.image_gif_desc':
      'Crear GIF online: anima varias fotos, tiempo por fotograma y bucle en el panel. Todo en tu navegador.',
    'landing.image_crop_desc':
      'Recortar imágenes online: marco arrastrable o píxeles exactos, misma zona en varios archivos. Recorte por lotes gratis.',
    'landing.image_rotate_desc':
      'Rotar imágenes online en lote: 90°, 180° o 270°. Descarga sueltas o en ZIP; en el navegador.',
    'landing.image_blur_face_desc':
      'Desenfocar caras online: detección automática para privacidad. Procesa en el navegador; imágenes o ZIP.',
    'landing.image_motion_blur_desc':
      'Desenfoque de movimiento y gaussiano online: ángulo, distancia y calidad. Opción solo fondo; en el navegador.',
    'landing.image_remove_bg_desc':
      'Quitar fondo de imagen online: fondos lisos o de estudio, descarga PNG transparentes en el navegador.',
    'landing.image_watermark_desc':
      'Marca de agua online: texto o logo, posición y opacidad; descarga PNG en el navegador.',
    'landing.image_ocr_desc':
      'OCR online: extrae texto de imágenes en el navegador. Elige idioma; copia o guarda el resultado.',
    'landing.image_heic_jpg_desc':
      'HEIC a JPG online: convierte fotos HEIC/HEIF del iPhone a JPEG estándar. Por lotes en el navegador.',
    
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

    'workflow.title': 'Flujo PDF',
    'workflow.description':
      'Simplifica tareas conectando herramientas en un flujo automatizado. Crea flujos personalizados, ajusta cada paso y guarda la configuración para acceder fácilmente, sin cuenta.',
    'workflow.name_label': 'Nombre del flujo',
    'workflow.name_hint':
      'Etiqueta opcional. Solo se guarda en esta sesión del navegador.',
    'workflow.name_placeholder': 'p.ej. Pack facturas',
    'workflow.select_tool': 'Seleccionar herramienta',
    'workflow.select_placeholder': 'Herramientas disponibles…',
    'workflow.add_step': 'Añadir paso →',
    'workflow.preview_heading': 'Vista previa del flujo',
    'workflow.preview_empty': 'Añade al menos un paso.',
    'workflow.no_more_after_split':
      'No se pueden añadir pasos después de dividir (salida en varios archivos).',
    'workflow.tool_merge': 'Combinar PDFs',
    'workflow.tool_compress': 'Comprimir PDF',
    'workflow.tool_rotate': 'Rotar páginas',
    'workflow.tool_split_each': 'Dividir — un archivo por página',
    'workflow.tool_split_range': 'Dividir — rangos de páginas',
    'workflow.rotate_angle': 'Rotación',
    'workflow.ranges_label': 'Rangos de página',
    'workflow.step_merge': 'Combinar PDFs',
    'workflow.step_compress': 'Comprimir',
    'workflow.step_rotate_90': 'Rotar 90° en sentido horario',
    'workflow.step_rotate_180': 'Rotar 180°',
    'workflow.step_rotate_270': 'Rotar 270° horario (90° antihorario)',
    'workflow.step_split_each': 'Dividir — cada página',
    'workflow.step_split_ranges': 'Dividir — rangos',
    'workflow.files_heading': 'Archivos',
    'workflow.files_hint_merge': 'Añade dos o más PDFs (la combinación va primero).',
    'workflow.files_hint_single': 'Añade un PDF.',
    'workflow.drop_title': 'Suelta PDF(s) aquí o haz clic',
    'workflow.drop_desc': 'Solo PDF • Se procesa en tu dispositivo',
    'workflow.clear_files': 'Quitar archivos',
    'workflow.run': 'Ejecutar flujo',
    'workflow.running': 'Ejecutando…',
    'workflow.success': 'Descarga iniciada.',
    'workflow.privacy':
      'Sin cuenta. Tus PDFs no se suben a nuestros servidores; el procesamiento es solo en tu navegador.',
    'workflow.error_no_steps': 'Añade al menos un paso al flujo.',
    'workflow.error_merge_files': 'Combinar requiere al menos dos archivos PDF.',
    'workflow.error_need_pdf': 'Añade un archivo PDF.',
    'workflow.error_ranges_required': 'Introduce rangos (p.ej. 1-3, 5).',
    'workflow.error_invalid_ranges': 'No se pudieron interpretar los rangos. Revisa los números.',
    'workflow.error_run': 'El flujo falló. Prueba otro PDF o menos pasos.',
    'workflow.load_remote_failed':
      'No se pudo cargar este flujo. Inicia sesión o revisa el enlace.',
    'workflow.save': 'Guardar',
    'workflow.saving': 'Guardando…',
    'workflow.saved_toast': 'Guardado.',
    'workflow.save_error': 'No se pudo guardar el flujo.',
    'workflow.saved_after_signin': 'Tu flujo se guardó en tu cuenta.',
    'workflow.save_failed_after_signin':
      'No se pudo guardar el flujo tras iniciar sesión. Pulsa Guardar otra vez.',

    'image_workflow.title': 'Flujo de imágenes',
    'image_workflow.description':
      'Simplifica tareas conectando herramientas en un flujo automatizado. Crea flujos de imágenes, ajusta cada paso y guarda la configuración para acceder fácilmente, sin cuenta.',
    'image_workflow.name_label': 'Nombre del flujo',
    'image_workflow.name_hint':
      'Etiqueta opcional. Solo se guarda en esta sesión del navegador.',
    'image_workflow.name_placeholder': 'p.ej. Fotos de producto',
    'image_workflow.select_tool': 'Seleccionar herramienta',
    'image_workflow.select_placeholder': 'Herramientas disponibles…',
    'image_workflow.add_step': 'Añadir paso →',
    'image_workflow.preview_heading': 'Vista previa del flujo',
    'image_workflow.preview_empty': 'Añade al menos un paso.',
    'image_workflow.tool_resize': 'Redimensionar (recorte cover)',
    'image_workflow.tool_compress': 'Recompresión sin pérdida',
    'image_workflow.tool_rotate': 'Rotación en pasos de 90°',
    'image_workflow.tool_to_webp': 'Convertir a WebP',
    'image_workflow.tool_to_jpg': 'Convertir a JPG',
    'image_workflow.rotate_angle': 'Rotación',
    'image_workflow.resize_width': 'Ancho (px)',
    'image_workflow.resize_height': 'Alto (px)',
    'image_workflow.step_resize': 'Redimensionar a',
    'image_workflow.step_compress': 'Recompresión sin pérdida',
    'image_workflow.step_rotate_0': 'Rotar 0° (re-codificar)',
    'image_workflow.step_rotate_90': 'Rotar 90° en sentido horario',
    'image_workflow.step_rotate_180': 'Rotar 180°',
    'image_workflow.step_rotate_270': 'Rotar 270° horario (90° antihorario)',
    'image_workflow.step_to_webp': 'Convertir a WebP',
    'image_workflow.step_to_jpg': 'Convertir a JPG',
    'image_workflow.files_heading': 'Imágenes',
    'image_workflow.files_hint': 'Añade una o más imágenes.',
    'image_workflow.drop_title': 'Suelta imágenes aquí o haz clic',
    'image_workflow.drop_desc': 'Solo imágenes • Se procesa en tu dispositivo',
    'image_workflow.clear_files': 'Quitar archivos',
    'image_workflow.run': 'Ejecutar flujo',
    'image_workflow.running': 'Ejecutando…',
    'image_workflow.success': 'Descarga iniciada.',
    'image_workflow.privacy':
      'Sin cuenta. Tus imágenes no se suben a nuestros servidores; el procesamiento es solo en tu navegador.',
    'image_workflow.error_no_steps': 'Añade al menos un paso al flujo.',
    'image_workflow.error_need_images': 'Añade al menos una imagen.',
    'image_workflow.error_resize_dims': 'Introduce ancho y alto en píxeles.',
    'image_workflow.error_run': 'El flujo falló. Prueba otras imágenes o menos pasos.',

    'sign_pdf.title': 'Firmar PDF',
    'sign_pdf.description':
      'Sube un PDF, indica nombre e iniciales y elige cómo se ve la firma: estilos manuscritos, trazo libre, texto o imagen escaneada. El archivo no se envía a nuestros servidores.',
    'sign_pdf.details_heading': 'Detalles de tu firma',
    'sign_pdf.full_name': 'Nombre completo',
    'sign_pdf.full_name_ph': 'Tu nombre',
    'sign_pdf.initials': 'Iniciales',
    'sign_pdf.initials_ph': 'Tus iniciales',
    'sign_pdf.mode_type': 'Texto plano',
    'sign_pdf.mode_style': 'Estilos manuscritos',
    'sign_pdf.mode_draw': 'Trazo libre',
    'sign_pdf.mode_upload': 'Subir imagen',
    'sign_pdf.tab_signature': 'Firma',
    'sign_pdf.tab_initials': 'Iniciales',
    'sign_pdf.tab_stamp': 'Sello',
    'sign_pdf.pick_style': 'Elige un estilo (la vista previa usa tu nombre):',
    'sign_pdf.type_hint': 'Usa una fuente sans clara. Edita el nombre arriba.',
    'sign_pdf.initials_type_hint': 'Usa una fuente sans clara. Edita las iniciales arriba.',
    'sign_pdf.upload_pick': 'Elegir imagen de firma…',
    'sign_pdf.upload_stamp': 'Elegir imagen de sello / logo…',
    'sign_pdf.company_name': 'Empresa / texto del sello',
    'sign_pdf.company_ph': 'Nombre de la empresa',
    'sign_pdf.stamp_vector_hint':
      'Genera un sello con borde y el texto de arriba. Cambia a subir imagen para un logo.',
    'sign_pdf.draw_hint':
      'Dibuja tu firma con ratón, lápiz o dedo. Usa los colores o el selector para el color del trazo.',
    'sign_pdf.draw_use_panel': 'Usa el área de dibujo de abajo.',
    'sign_pdf.draw_stamp_hint':
      'Tu dibujo se colocará en el PDF como una imagen de sello.',
    'sign_pdf.pen_size': 'Grosor del trazo',
    'sign_pdf.clear_drawing': 'Borrar dibujo',
    'sign_pdf.color_custom': 'Color personalizado',
    'sign_pdf.color_picker_label': 'Selector',
    'sign_pdf.color': 'Color',
    'sign_pdf.preview_label': 'Vista previa',
    'sign_pdf.preview_graphic_label': 'Gráfico de la firma',
    'sign_pdf.preview_pdf_toggle': 'Vista previa del PDF firmado',
    'sign_pdf.preview_pdf_hint':
      'Ve el PDF con la firma aplicada. Se actualiza al cambiar opciones.',
    'sign_pdf.preview_pdf_heading': 'Vista previa del documento firmado',
    'sign_pdf.preview_pdf_loading': 'Actualizando vista previa…',
    'sign_pdf.preview_pdf_need_upload':
      'Sube una imagen de firma para generar la vista previa del PDF.',
    'sign_pdf.preview_pdf_need_draw':
      'Dibuja algo en el lienzo para generar la vista previa del PDF.',
    'sign_pdf.preview_pdf_error':
      'No se pudo generar la vista previa. Prueba otro PDF o ajusta la firma.',
    'sign_pdf.pages_label': 'Colocar firma en',
    'sign_pdf.pages_last': 'Solo última página',
    'sign_pdf.pages_first': 'Solo primera página',
    'sign_pdf.pages_all': 'Todas las páginas',
    'sign_pdf.apply': 'Aplicar firma y descargar',
    'sign_pdf.processing': 'Firmando…',
    'sign_pdf.success': 'PDF firmado descargado.',
    'sign_pdf.error_no_pdf': 'Añade primero un PDF.',
    'sign_pdf.error_no_image': 'Elige una imagen en modo subida.',
    'sign_pdf.error_no_drawing': 'Dibuja primero tu firma en el lienzo.',
    'sign_pdf.error_process': 'No se pudo firmar este PDF. Prueba otro archivo.',
    'sign_pdf.drop_title': 'Suelta tu PDF aquí o haz clic',
    'sign_pdf.drop_desc': 'Un PDF • El tamaño máximo depende de tu dispositivo',
    'sign_pdf.placeholder_signature': 'Firma',
    'sign_pdf.placeholder_initials': 'AB',
    'sign_pdf.placeholder_company': 'Empresa',

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
    'image_heic_to_jpg.title': 'HEIC a JPG',
    'image_heic_to_jpg.description':
      'Convierte fotos HEIC/HEIF de Apple a JPEG (calidad 92) para compartir y editar en cualquier sitio. Todo en tu navegador.',
    'image_heic_to_jpg.process': 'Convertir a JPG',
    'image_heic_to_jpg.drop_title': 'Suelta archivos HEIC aquí o haz clic',
    'image_heic_to_jpg.drop_desc': '.heic / .heif • Varios archivos',
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
    'image_motion_blur.title': 'Desenfoque gaussiano y de movimiento',
    'image_motion_blur.description':
      'Elige desenfoque gaussiano o de movimiento. Ajusta ángulo, distancia y número de muestras para el movimiento. Activa Desenfocar fondo para mantener el sujeto nítido y difuminar el fondo (usa la misma segmentación en el dispositivo que quitar fondo).',
    'image_motion_blur.process': 'Aplicar desenfoque',
    'image_motion_blur.drop_title': 'Suelta imágenes aquí o haz clic',
    'image_motion_blur.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Varios archivos',
    'image_motion_blur.blur_type': 'Tipo de desenfoque',
    'image_motion_blur.gaussian': 'Desenfoque gaussiano',
    'image_motion_blur.motion': 'Desenfoque de movimiento',
    'image_motion_blur.angle': 'Ángulo',
    'image_motion_blur.distance': 'Distancia',
    'image_motion_blur.radius': 'Radio',
    'image_motion_blur.samples': 'Muestras',
    'image_motion_blur.blur_background': 'Desenfocar fondo',
    'image_motion_blur.blur_background_hint':
      'Detecta el sujeto principal y desenfoca solo el fondo. Mejor con sujetos claros; la exportación puede tardar más.',
    'image_motion_blur.gaussian_sliders_note':
      'Ángulo y muestras solo aplican al desenfoque de movimiento. El deslizador de radio controla la intensidad gaussiana.',
    'image_motion_blur.preview_hint':
      'Vista previa en vivo de la primera imagen (o la miniatura que elijas).',
    'image_motion_blur.preview_loading': 'Actualizando vista previa…',
    'image_motion_blur.preview_error': 'No se pudo generar la vista previa para este archivo.',
    'image_motion_blur.preview_thumbnails_hint': 'Vista previa de otro archivo:',
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
    'nav.sign_pdf': 'Signer PDF',
    'nav.pdf_to_word': 'PDF vers Word',
    'nav.pdf_to_jpg': 'PDF vers JPG',
    'nav.pdf_to_text': 'PDF vers Texte',
    'nav.word_to_pdf': 'Word vers PDF',
    'nav.jpg_to_pdf': 'JPG vers PDF',
    'nav.pdf_workflow': 'Workflow PDF',
    'nav.image_workflow': 'Workflow image',
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
    'nav.image_motion_blur': 'Flou de mouvement',
    'nav.image_remove_bg': 'Supprimer le fond',
    'nav.image_watermark': 'Filigrane image',
    'nav.image_ocr': 'Image vers texte',
    'nav.image_heic_jpg': 'HEIC vers JPG',
    'nav.login': 'Connexion',
    'nav.account': 'Compte',
    'auth.sign_in_google': 'Connexion avec Google',
    'auth.sign_out': 'Déconnexion',
    'login.title': 'Connexion ou inscription',
    'login.subtitle': 'Utilisez votre e-mail ou Google pour accéder à votre compte.',
    'login.tab_sign_in': 'Connexion',
    'login.tab_sign_up': 'Inscription',
    'login.email': 'E-mail',
    'login.password': 'Mot de passe',
    'login.password_hint': 'Au moins 6 caractères.',
    'login.submit_sign_in': 'Se connecter',
    'login.submit_sign_up': 'Créer un compte',
    'login.or': 'ou',
    'login.continue_google': 'Continuer avec Google',
    'login.check_email': 'Vérifiez votre boîte mail pour confirmer, puis connectez-vous.',
    'login.back_home': "Retour à l'accueil",

    'account.title': 'Compte',
    'account.subtitle': 'Profil et flux enregistrés.',
    'account.tab_profile': 'Profil',
    'account.tab_workflows': 'Flux',
    'account.profile_title': 'Votre profil',
    'account.profile_desc': 'E-mail et session.',
    'account.pdf_workflows': 'Flux PDF',
    'account.image_workflows': 'Flux image',
    'account.no_workflows_pdf':
      'Créez un nouveau flux — vous n’avez encore aucun flux PDF enregistré.',
    'account.no_workflows_image':
      'Créez un nouveau flux — vous n’avez encore aucun flux image enregistré.',
    'account.create_new_workflow': 'Créer un flux',
    'account.open_workflow': 'Ouvrir',
    'account.steps': 'Étapes',
    'account.updated': 'Mis à jour',
    'account.delete_workflow': 'Supprimer le flux',
    'account.delete_failed': 'Impossible de supprimer le flux. Réessayez.',
    'account.menu_title': 'Tableau de bord',
    'account.nav_aria': 'Sections du compte',
    
    // URL paths
    'url.merge': 'fusionner-pdf',
    'url.split': 'diviser-pdf',
    'url.compress': 'compresser-pdf',
    'url.rotate': 'rotation-pdf',
    'url.sign_pdf': 'signer-pdf',
    'url.pdf_to_word': 'pdf-vers-word',
    'url.pdf_to_jpg': 'pdf-vers-jpg',
    'url.pdf_to_text': 'pdf-vers-texte',
    'url.word_to_pdf': 'word-vers-pdf',
    'url.jpg_to_pdf': 'jpg-vers-pdf',
    'url.pdf_workflow': 'flux-pdf',
    'url.image_workflow': 'flux-images',
    
    // Landing page descriptions (SEO : intention + « en ligne / navigateur / gratuit »)
    'landing.merge_desc':
      'Fusionner PDF en ligne gratuitement : combinez plusieurs PDF en un seul document dans le navigateur. Rapide et privé.',
    'landing.split_desc':
      'Diviser un PDF en ligne : extrayez des pages ou séparez un PDF en plusieurs fichiers. Traitement local dans le navigateur.',
    'landing.compress_desc':
      'Compresser un PDF en ligne pour réduire la taille tout en gardant la qualité. Réduisez vos PDF dans le navigateur avant partage.',
    'landing.rotate_desc':
      'Faire pivoter un PDF en ligne : pages à 90°, 180° ou 270°. Corrigez l’orientation dans le navigateur ; outil gratuit.',
    'landing.sign_pdf_desc':
      'Signer un PDF en ligne : signature saisie, dessinée ou image, initiales et tampons. Signature électronique dans le navigateur ; fichiers sur votre appareil.',
    'landing.pdf_to_word_desc':
      'PDF vers Word en ligne : convertissez des PDF en DOCX modifiable dans le navigateur. Convertisseur PDF vers Word gratuit, sans installation.',
    'landing.pdf_to_jpg_desc':
      'PDF vers JPG en ligne : exportez les pages en images JPEG haute qualité. Convertisseur PDF vers image gratuit dans le navigateur.',
    'landing.pdf_to_text_desc':
      'PDF vers texte en ligne : extrayez et copiez le texte des PDF gratuitement dans le navigateur. Extracteur de texte PDF rapide.',
    'landing.word_to_pdf_desc':
      'Word vers PDF en ligne : convertissez DOCX en PDF dans le navigateur. Convertisseur Word vers PDF sécurisé et gratuit.',
    'landing.jpg_to_pdf_desc':
      'JPG vers PDF en ligne : regroupez des images en un PDF ou définissez le format de page. Convertisseur image vers PDF gratuit.',
    'landing.pdf_workflow_desc':
      'Workflow PDF : enchaînez fusion, division, compression et rotation dans un flux. Enregistrez vos réglages avec un compte ; tout dans le navigateur.',
    'landing.image_workflow_desc':
      'Workflow image : reliez redimensionnement, compression, rotation et conversion en un pipeline. Sauvegarde locale ou compte ; dans le navigateur.',
    'landing.image_resize_desc':
      'Redimensionner des images en lot en ligne : même largeur et hauteur (recadrage centré). Gratuit dans le navigateur.',
    'landing.image_compress_desc':
      'Compresser des images en ligne par lot : recompression sans perte pour des PNG, WebP et JPEG plus légers. Privé et rapide.',
    'landing.image_webp_desc':
      'Convertir en WebP en ligne par lot : format moderne, haute qualité, fichiers plus petits. Gratuit dans le navigateur.',
    'landing.image_jpg_desc':
      'Convertisseur JPG en lot en ligne : PNG, WebP, GIF et plus vers JPEG compatible, dans le navigateur.',
    'landing.image_gif_desc':
      'Créer un GIF en ligne : animez plusieurs photos, délai par image et boucle dans le panneau. Dans le navigateur.',
    'landing.image_crop_desc':
      'Recadrer des images en ligne : cadre déplaçable ou pixels exacts, même zone sur plusieurs fichiers. Recadrage par lot gratuit.',
    'landing.image_rotate_desc':
      'Faire pivoter des images en lot en ligne : 90°, 180° ou 270°. Téléchargement séparé ou ZIP ; dans le navigateur.',
    'landing.image_blur_face_desc':
      'Flouter les visages en ligne : détection automatique pour la confidentialité. Traitement dans le navigateur ; images ou ZIP.',
    'landing.image_motion_blur_desc':
      'Flou de mouvement et gaussien en ligne : angle, distance et qualité. Option arrière-plan seul ; dans le navigateur.',
    'landing.image_remove_bg_desc':
      'Supprimer le fond d’une image en ligne : fonds unis ou studio, téléchargez des PNG transparents dans le navigateur.',
    'landing.image_watermark_desc':
      'Filigrane en ligne : texte ou logo, position et opacité ; téléchargement PNG dans le navigateur.',
    'landing.image_ocr_desc':
      'OCR en ligne : extrayez le texte des images dans le navigateur. Choisissez la langue ; copiez ou enregistrez.',
    'landing.image_heic_jpg_desc':
      'HEIC vers JPG en ligne : convertissez les photos HEIC/HEIF iPhone en JPEG standard. Par lot dans le navigateur.',
    
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

    'workflow.title': 'Workflow PDF',
    'workflow.description':
      'Simplifiez vos tâches en connectant des outils dans un workflow automatisé. Créez des workflows personnalisés, peaufinez chaque étape et enregistrez la configuration pour un accès rapide, sans compte.',
    'workflow.name_label': 'Nom du workflow',
    'workflow.name_hint':
      'Libellé facultatif. Enregistré seulement dans cette session du navigateur.',
    'workflow.name_placeholder': 'ex. Lot factures',
    'workflow.select_tool': 'Choisir un outil',
    'workflow.select_placeholder': 'Outils disponibles…',
    'workflow.add_step': 'Ajouter une étape →',
    'workflow.preview_heading': 'Aperçu du workflow',
    'workflow.preview_empty': 'Ajoutez au moins une étape.',
    'workflow.no_more_after_split':
      'Aucune étape supplémentaire après la division (plusieurs fichiers en sortie).',
    'workflow.tool_merge': 'Fusionner des PDF',
    'workflow.tool_compress': 'Compresser le PDF',
    'workflow.tool_rotate': 'Faire pivoter les pages',
    'workflow.tool_split_each': 'Diviser — un fichier par page',
    'workflow.tool_split_range': 'Diviser — plages de pages',
    'workflow.rotate_angle': 'Rotation',
    'workflow.ranges_label': 'Plages de pages',
    'workflow.step_merge': 'Fusionner des PDF',
    'workflow.step_compress': 'Compresser',
    'workflow.step_rotate_90': 'Rotation 90° horaire',
    'workflow.step_rotate_180': 'Rotation 180°',
    'workflow.step_rotate_270': 'Rotation 270° horaire (90° antihoraire)',
    'workflow.step_split_each': 'Diviser — chaque page',
    'workflow.step_split_ranges': 'Diviser — plages',
    'workflow.files_heading': 'Fichiers',
    'workflow.files_hint_merge': 'Ajoutez au moins deux PDF (la fusion est en premier).',
    'workflow.files_hint_single': 'Ajoutez un PDF.',
    'workflow.drop_title': 'Déposez le(s) PDF ici ou cliquez',
    'workflow.drop_desc': 'PDF uniquement • Traitement sur votre appareil',
    'workflow.clear_files': 'Effacer les fichiers',
    'workflow.run': 'Lancer le workflow',
    'workflow.running': 'Exécution…',
    'workflow.success': 'Téléchargement lancé.',
    'workflow.privacy':
      'Pas de compte. Vos PDF ne sont pas envoyés à nos serveurs ; tout se fait dans le navigateur.',
    'workflow.error_no_steps': 'Ajoutez au moins une étape.',
    'workflow.error_merge_files': 'La fusion nécessite au moins deux fichiers PDF.',
    'workflow.error_need_pdf': 'Ajoutez un fichier PDF.',
    'workflow.error_ranges_required': 'Saisissez des plages (ex. 1-3, 5).',
    'workflow.error_invalid_ranges': 'Plages invalides. Vérifiez les numéros de page.',
    'workflow.error_run': 'Échec du workflow. Essayez un autre PDF ou moins d’étapes.',
    'workflow.load_remote_failed':
      'Impossible de charger ce flux. Connectez-vous ou vérifiez le lien.',
    'workflow.save': 'Enregistrer',
    'workflow.saving': 'Enregistrement…',
    'workflow.saved_toast': 'Enregistré.',
    'workflow.save_error': 'Impossible d’enregistrer le flux.',
    'workflow.saved_after_signin': 'Votre flux a été enregistré sur votre compte.',
    'workflow.save_failed_after_signin':
      'Impossible d’enregistrer le flux après connexion. Réessayez avec Enregistrer.',

    'image_workflow.title': 'Workflow image',
    'image_workflow.description':
      'Simplifiez vos tâches en connectant des outils dans un workflow automatisé. Créez des workflows image, peaufinez chaque étape et enregistrez la configuration pour un accès rapide, sans compte.',
    'image_workflow.name_label': 'Nom du workflow',
    'image_workflow.name_hint':
      'Libellé facultatif. Enregistré seulement dans cette session du navigateur.',
    'image_workflow.name_placeholder': 'ex. Photos produit',
    'image_workflow.select_tool': 'Choisir un outil',
    'image_workflow.select_placeholder': 'Outils disponibles…',
    'image_workflow.add_step': 'Ajouter une étape →',
    'image_workflow.preview_heading': 'Aperçu du workflow',
    'image_workflow.preview_empty': 'Ajoutez au moins une étape.',
    'image_workflow.tool_resize': 'Redimensionner (recadrage cover)',
    'image_workflow.tool_compress': 'Recompression sans perte',
    'image_workflow.tool_rotate': 'Rotation par pas de 90°',
    'image_workflow.tool_to_webp': 'Convertir en WebP',
    'image_workflow.tool_to_jpg': 'Convertir en JPG',
    'image_workflow.rotate_angle': 'Rotation',
    'image_workflow.resize_width': 'Largeur (px)',
    'image_workflow.resize_height': 'Hauteur (px)',
    'image_workflow.step_resize': 'Redimensionner en',
    'image_workflow.step_compress': 'Recompression sans perte',
    'image_workflow.step_rotate_0': 'Rotation 0° (ré-encodage)',
    'image_workflow.step_rotate_90': 'Rotation 90° horaire',
    'image_workflow.step_rotate_180': 'Rotation 180°',
    'image_workflow.step_rotate_270': 'Rotation 270° horaire (90° antihoraire)',
    'image_workflow.step_to_webp': 'Convertir en WebP',
    'image_workflow.step_to_jpg': 'Convertir en JPG',
    'image_workflow.files_heading': 'Images',
    'image_workflow.files_hint': 'Ajoutez une ou plusieurs images.',
    'image_workflow.drop_title': 'Déposez des images ici ou cliquez',
    'image_workflow.drop_desc': 'Images uniquement • Traitement sur votre appareil',
    'image_workflow.clear_files': 'Effacer les fichiers',
    'image_workflow.run': 'Lancer le workflow',
    'image_workflow.running': 'Exécution…',
    'image_workflow.success': 'Téléchargement lancé.',
    'image_workflow.privacy':
      'Pas de compte. Vos images ne sont pas envoyées à nos serveurs ; tout se fait dans le navigateur.',
    'image_workflow.error_no_steps': 'Ajoutez au moins une étape.',
    'image_workflow.error_need_images': 'Ajoutez au moins une image.',
    'image_workflow.error_resize_dims': 'Saisissez largeur et hauteur en pixels.',
    'image_workflow.error_run': 'Échec du workflow. Essayez d’autres images ou moins d’étapes.',

    'sign_pdf.title': 'Signer PDF',
    'sign_pdf.description':
      'Importez un PDF, renseignez nom et initiales, puis choisissez l’apparence : styles manuscrits, dessin à main levée, texte ou image scannée. Le fichier n’est pas envoyé à nos serveurs.',
    'sign_pdf.details_heading': 'Détails de votre signature',
    'sign_pdf.full_name': 'Nom complet',
    'sign_pdf.full_name_ph': 'Votre nom',
    'sign_pdf.initials': 'Initiales',
    'sign_pdf.initials_ph': 'Vos initiales',
    'sign_pdf.mode_type': 'Texte simple',
    'sign_pdf.mode_style': 'Styles manuscrits',
    'sign_pdf.mode_draw': 'Main levée',
    'sign_pdf.mode_upload': 'Importer une image',
    'sign_pdf.tab_signature': 'Signature',
    'sign_pdf.tab_initials': 'Initiales',
    'sign_pdf.tab_stamp': 'Tampon',
    'sign_pdf.pick_style': 'Choisissez un style (l’aperçu utilise votre nom) :',
    'sign_pdf.type_hint': 'Police sans empattement lisible. Modifiez le nom ci-dessus.',
    'sign_pdf.initials_type_hint': 'Police sans empattement. Modifiez les initiales ci-dessus.',
    'sign_pdf.upload_pick': 'Choisir une image de signature…',
    'sign_pdf.upload_stamp': 'Choisir une image de tampon / logo…',
    'sign_pdf.company_name': 'Entreprise / texte du tampon',
    'sign_pdf.company_ph': 'Nom de l’entreprise',
    'sign_pdf.stamp_vector_hint':
      'Génère un tampon encadré avec le texte ci-dessus. Passez à l’import pour un logo.',
    'sign_pdf.draw_hint':
      'Tracez votre signature à la souris, au stylet ou au doigt. Utilisez les couleurs ou le sélecteur pour l’encre.',
    'sign_pdf.draw_use_panel': 'Utilisez la zone de dessin ci-dessous.',
    'sign_pdf.draw_stamp_hint':
      'Votre dessin sera placé sur le PDF comme une image de tampon.',
    'sign_pdf.pen_size': 'Épaisseur du trait',
    'sign_pdf.clear_drawing': 'Effacer le dessin',
    'sign_pdf.color_custom': 'Couleur personnalisée',
    'sign_pdf.color_picker_label': 'Sélecteur',
    'sign_pdf.color': 'Couleur',
    'sign_pdf.preview_label': 'Aperçu',
    'sign_pdf.preview_graphic_label': 'Graphique de la signature',
    'sign_pdf.preview_pdf_toggle': 'Aperçu du PDF signé',
    'sign_pdf.preview_pdf_hint':
      'Voir le PDF avec la signature. Mise à jour après vos changements.',
    'sign_pdf.preview_pdf_heading': 'Aperçu du document signé',
    'sign_pdf.preview_pdf_loading': 'Mise à jour de l’aperçu…',
    'sign_pdf.preview_pdf_need_upload':
      'Importez une image de signature pour générer l’aperçu PDF.',
    'sign_pdf.preview_pdf_need_draw':
      'Tracez quelque chose sur le bloc pour générer l’aperçu PDF.',
    'sign_pdf.preview_pdf_error':
      'Impossible de générer l’aperçu. Essayez un autre PDF ou modifiez la signature.',
    'sign_pdf.pages_label': 'Placer la signature sur',
    'sign_pdf.pages_last': 'Dernière page seulement',
    'sign_pdf.pages_first': 'Première page seulement',
    'sign_pdf.pages_all': 'Toutes les pages',
    'sign_pdf.apply': 'Appliquer la signature et télécharger',
    'sign_pdf.processing': 'Signature en cours…',
    'sign_pdf.success': 'PDF signé téléchargé.',
    'sign_pdf.error_no_pdf': 'Ajoutez d’abord un fichier PDF.',
    'sign_pdf.error_no_image': 'Choisissez une image en mode import.',
    'sign_pdf.error_no_drawing': 'Tracez d’abord votre signature sur le bloc.',
    'sign_pdf.error_process': 'Impossible de signer ce PDF. Essayez un autre fichier.',
    'sign_pdf.drop_title': 'Déposez votre PDF ici ou cliquez',
    'sign_pdf.drop_desc': 'Un PDF • Taille max selon votre appareil',
    'sign_pdf.placeholder_signature': 'Signature',
    'sign_pdf.placeholder_initials': 'AB',
    'sign_pdf.placeholder_company': 'Entreprise',

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
    'image_heic_to_jpg.title': 'HEIC vers JPG',
    'image_heic_to_jpg.description':
      'Convertissez les photos HEIC/HEIF Apple en JPEG (qualité 92) pour partager et éditer partout. Tout dans le navigateur.',
    'image_heic_to_jpg.process': 'Convertir en JPG',
    'image_heic_to_jpg.drop_title': 'Déposez des fichiers HEIC ici ou cliquez',
    'image_heic_to_jpg.drop_desc': '.heic / .heif • Fichiers multiples',
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
    'image_motion_blur.title': 'Flou gaussien et de mouvement',
    'image_motion_blur.description':
      'Choisissez un flou gaussien ou un flou de mouvement. Réglez l’angle, la distance et le nombre d’échantillons pour le mouvement. Cochez Flouter l’arrière-plan pour garder le sujet net tout en floutant le fond (même segmentation sur l’appareil que supprimer le fond).',
    'image_motion_blur.process': 'Appliquer le flou',
    'image_motion_blur.drop_title': 'Déposez des images ici ou cliquez',
    'image_motion_blur.drop_desc': 'PNG, JPEG, WebP, GIF, TIFF • Fichiers multiples',
    'image_motion_blur.blur_type': 'Type de flou',
    'image_motion_blur.gaussian': 'Flou gaussien',
    'image_motion_blur.motion': 'Flou de mouvement',
    'image_motion_blur.angle': 'Angle',
    'image_motion_blur.distance': 'Distance',
    'image_motion_blur.radius': 'Rayon',
    'image_motion_blur.samples': 'Échantillons',
    'image_motion_blur.blur_background': 'Flouter l’arrière-plan',
    'image_motion_blur.blur_background_hint':
      'Détecte le sujet principal et ne floute que l’arrière-plan. Mieux avec un sujet net ; l’export peut prendre plus de temps.',
    'image_motion_blur.gaussian_sliders_note':
      'L’angle et les échantillons concernent uniquement le flou de mouvement. Le curseur de rayon contrôle l’intensité du flou gaussien.',
    'image_motion_blur.preview_hint':
      'Aperçu en direct de la première image (ou de la miniature choisie).',
    'image_motion_blur.preview_loading': 'Mise à jour de l’aperçu…',
    'image_motion_blur.preview_error': 'Impossible de générer l’aperçu pour ce fichier.',
    'image_motion_blur.preview_thumbnails_hint': 'Aperçu d’un autre fichier :',
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
