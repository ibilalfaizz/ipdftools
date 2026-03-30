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
    href: "/bulk-image-crop",
    labelKey: "nav.image_crop",
    descriptionKey: "landing.image_crop_desc",
    category: "image",
  },
];
