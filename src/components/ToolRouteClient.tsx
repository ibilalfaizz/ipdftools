"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

const loadFallback = () => (
  <div
    role="status"
    aria-live="polite"
    className="min-h-screen app-bg flex flex-col items-center justify-center px-4"
  >
    <div className="ipdf-route-loader" aria-hidden />
    <span className="sr-only">Loading</span>
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
const ImageRotatePage = dynamic(() => import("@/pages/ImageRotatePage"), {
  ssr: false,
  loading: loadFallback,
});
const ImageBlurFacePage = dynamic(() => import("@/pages/ImageBlurFacePage"), {
  ssr: false,
  loading: loadFallback,
});
const ImageRemoveBackgroundPage = dynamic(
  () => import("@/pages/ImageRemoveBackgroundPage"),
  { ssr: false, loading: loadFallback }
);
const ImageOcrPage = dynamic(() => import("@/pages/ImageOcrPage"), {
  ssr: false,
  loading: loadFallback,
});
const ImageHeicToJpgPage = dynamic(
  () => import("@/pages/ImageHeicToJpgPage"),
  { ssr: false, loading: loadFallback }
);

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
  "/image-rotate": ImageRotatePage,
  "/image-blur-face": ImageBlurFacePage,
  "/image-watermark": ImageWatermarkPage,
  "/image-remove-background": ImageRemoveBackgroundPage,
  "/image-ocr": ImageOcrPage,
  "/image-heic-to-jpg": ImageHeicToJpgPage,
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
