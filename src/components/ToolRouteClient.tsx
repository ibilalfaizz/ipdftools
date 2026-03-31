"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const loadFallback = () => (
  <div
    role="status"
    aria-live="polite"
    className="min-h-screen app-bg flex flex-col items-center justify-center px-4"
  >
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className="absolute inset-[-6px] rounded-full border border-[#d6ffd2]/15"
          aria-hidden
        />
        <div className="rounded-full bg-[#103c44]/80 p-4 shadow-[0_0_32px_rgba(214,255,210,0.12)] ring-1 ring-[#d6ffd2]/25">
          <Loader2
            className="h-9 w-9 text-[#d6ffd2] animate-spin motion-reduce:animate-none"
            strokeWidth={2}
            aria-hidden
          />
        </div>
      </div>
    </div>
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
