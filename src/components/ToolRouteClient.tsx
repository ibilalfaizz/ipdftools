"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

const loadFallback = () => (
  <div className="min-h-screen app-bg flex items-center justify-center text-muted-foreground">
    Loading…
  </div>
);

const MergePage = dynamic(() => import("@/pages/MergePage"), {
  ssr: false,
  loading: loadFallback,
});
const SplitPage = dynamic(() => import("@/pages/SplitPage"), {
  ssr: false,
  loading: loadFallback,
});
const CompressPage = dynamic(() => import("@/pages/CompressPage"), {
  ssr: false,
  loading: loadFallback,
});
const RotatePage = dynamic(() => import("@/pages/RotatePage"), {
  ssr: false,
  loading: loadFallback,
});
const PDFToWordPage = dynamic(() => import("@/pages/PDFToWordPage"), {
  ssr: false,
  loading: loadFallback,
});
const PDFToJPGPage = dynamic(() => import("@/pages/PDFToJPGPage"), {
  ssr: false,
  loading: loadFallback,
});
const PDFToTextPage = dynamic(() => import("@/pages/PDFToTextPage"), {
  ssr: false,
  loading: loadFallback,
});
const WordToPDFPage = dynamic(() => import("@/pages/WordToPDFPage"), {
  ssr: false,
  loading: loadFallback,
});
const JPGToPDFPage = dynamic(() => import("@/pages/JPGToPDFPage"), {
  ssr: false,
  loading: loadFallback,
});
const ImageResizePage = dynamic(() => import("@/pages/ImageResizePage"), {
  ssr: false,
  loading: loadFallback,
});
const ImageCompressPage = dynamic(() => import("@/pages/ImageCompressPage"), {
  ssr: false,
  loading: loadFallback,
});
const ImageWebpPage = dynamic(() => import("@/pages/ImageWebpPage"), {
  ssr: false,
  loading: loadFallback,
});
const ImageJpgPage = dynamic(() => import("@/pages/ImageJpgPage"), {
  ssr: false,
  loading: loadFallback,
});
const ImageGifPage = dynamic(() => import("@/pages/ImageGifPage"), {
  ssr: false,
  loading: loadFallback,
});
const ImageCropPage = dynamic(() => import("@/pages/ImageCropPage"), {
  ssr: false,
  loading: loadFallback,
});
const ImageWatermarkPage = dynamic(() => import("@/pages/ImageWatermarkPage"), {
  ssr: false,
  loading: loadFallback,
});

const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "/merge-pdf": MergePage,
  "/split-pdf": SplitPage,
  "/compress-pdf": CompressPage,
  "/rotate-pdf": RotatePage,
  "/pdf-to-word": PDFToWordPage,
  "/pdf-to-jpg": PDFToJPGPage,
  "/pdf-to-text": PDFToTextPage,
  "/word-to-pdf": WordToPDFPage,
  "/jpg-to-pdf": JPGToPDFPage,
  "/bulk-image-resize": ImageResizePage,
  "/bulk-image-compress": ImageCompressPage,
  "/bulk-image-webp": ImageWebpPage,
  "/bulk-image-jpg": ImageJpgPage,
  "/bulk-image-gif": ImageGifPage,
  "/image-crop": ImageCropPage,
  "/image-watermark": ImageWatermarkPage,
};

export default function ToolRouteClient({
  originalPath,
}: {
  originalPath: string;
}) {
  const Page = TOOL_COMPONENTS[originalPath];
  if (!Page) return null;
  return <Page />;
}
