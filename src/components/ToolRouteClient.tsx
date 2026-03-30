"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

const loadFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-600">
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
  "/image-resize": ImageResizePage,
  "/image-compress": ImageCompressPage,
  "/image-webp": ImageWebpPage,
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
