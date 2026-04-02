/** English canonical paths — use with `getLocalizedPath` / `toolPath`. */
export type ToolSearchItem = {
  href: string;
  labelKey: string;
  descriptionKey: string;
  category: "pdf" | "image";
};

export const TOOL_SEARCH_INDEX: ToolSearchItem[] = [
  {
    href: "/merge-pdf",
    labelKey: "nav.merge",
    descriptionKey: "landing.merge_desc",
    category: "pdf",
  },
  {
    href: "/split-pdf",
    labelKey: "nav.split",
    descriptionKey: "landing.split_desc",
    category: "pdf",
  },
  {
    href: "/compress-pdf",
    labelKey: "nav.compress",
    descriptionKey: "landing.compress_desc",
    category: "pdf",
  },
  {
    href: "/rotate-pdf",
    labelKey: "nav.rotate",
    descriptionKey: "landing.rotate_desc",
    category: "pdf",
  },
  {
    href: "/sign-pdf",
    labelKey: "nav.sign_pdf",
    descriptionKey: "landing.sign_pdf_desc",
    category: "pdf",
  },
  {
    href: "/pdf-to-word",
    labelKey: "nav.pdf_to_word",
    descriptionKey: "landing.pdf_to_word_desc",
    category: "pdf",
  },
  {
    href: "/pdf-to-jpg",
    labelKey: "nav.pdf_to_jpg",
    descriptionKey: "landing.pdf_to_jpg_desc",
    category: "pdf",
  },
  {
    href: "/pdf-to-text",
    labelKey: "nav.pdf_to_text",
    descriptionKey: "landing.pdf_to_text_desc",
    category: "pdf",
  },
  {
    href: "/word-to-pdf",
    labelKey: "nav.word_to_pdf",
    descriptionKey: "landing.word_to_pdf_desc",
    category: "pdf",
  },
  {
    href: "/jpg-to-pdf",
    labelKey: "nav.jpg_to_pdf",
    descriptionKey: "landing.jpg_to_pdf_desc",
    category: "pdf",
  },
  {
    href: "/pdf-workflow",
    labelKey: "nav.pdf_workflow",
    descriptionKey: "landing.pdf_workflow_desc",
    category: "pdf",
  },
  {
    href: "/image-workflow",
    labelKey: "nav.image_workflow",
    descriptionKey: "landing.image_workflow_desc",
    category: "image",
  },
  {
    href: "/bulk-image-resize",
    labelKey: "nav.image_resize",
    descriptionKey: "landing.image_resize_desc",
    category: "image",
  },
  {
    href: "/bulk-image-compress",
    labelKey: "nav.image_compress",
    descriptionKey: "landing.image_compress_desc",
    category: "image",
  },
  {
    href: "/bulk-image-webp",
    labelKey: "nav.image_webp",
    descriptionKey: "landing.image_webp_desc",
    category: "image",
  },
  {
    href: "/bulk-image-jpg",
    labelKey: "nav.image_jpg",
    descriptionKey: "landing.image_jpg_desc",
    category: "image",
  },
  {
    href: "/image-heic-to-jpg",
    labelKey: "nav.image_heic_jpg",
    descriptionKey: "landing.image_heic_jpg_desc",
    category: "image",
  },
  {
    href: "/bulk-image-gif",
    labelKey: "nav.image_gif",
    descriptionKey: "landing.image_gif_desc",
    category: "image",
  },
  {
    href: "/image-crop",
    labelKey: "nav.image_crop",
    descriptionKey: "landing.image_crop_desc",
    category: "image",
  },
  {
    href: "/image-rotate",
    labelKey: "nav.image_rotate",
    descriptionKey: "landing.image_rotate_desc",
    category: "image",
  },
  {
    href: "/image-blur-face",
    labelKey: "nav.image_blur_face",
    descriptionKey: "landing.image_blur_face_desc",
    category: "image",
  },
  {
    href: "/image-motion-blur",
    labelKey: "nav.image_motion_blur",
    descriptionKey: "landing.image_motion_blur_desc",
    category: "image",
  },
  {
    href: "/image-remove-background",
    labelKey: "nav.image_remove_bg",
    descriptionKey: "landing.image_remove_bg_desc",
    category: "image",
  },
  {
    href: "/image-watermark",
    labelKey: "nav.image_watermark",
    descriptionKey: "landing.image_watermark_desc",
    category: "image",
  },
  {
    href: "/image-ocr",
    labelKey: "nav.image_ocr",
    descriptionKey: "landing.image_ocr_desc",
    category: "image",
  },
];
