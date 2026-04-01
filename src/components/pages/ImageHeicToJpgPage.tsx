"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Header from "../Header";
import Footer from "../Footer";
import ImageToolsBatchForm from "../ImageToolsBatchForm";
import {
  isHeicLike,
  processHeicToJpgBatch,
} from "@/lib/client-image-jobs";
import { IMAGE_TOOL_SHEET_RESERVE } from "@/lib/image-tool-sheet-layout";
import { cn } from "@/lib/utils";

const HEIC_ACCEPT =
  "image/heic,image/heif,image/heic-sequence,image/heif-sequence,.heic,.heif";

export default function ImageHeicToJpgPage() {
  const [sidebarReserve, setSidebarReserve] = useState(false);
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div
          className={cn(
            "max-w-6xl mx-auto transition-[padding]",
            sidebarReserve && IMAGE_TOOL_SHEET_RESERVE
          )}
        >
          <Card className="tool-page-card">
            <CardContent className="p-0">
              <ImageToolsBatchForm
                translationPrefix="image_heic_to_jpg"
                acceptedFormats={HEIC_ACCEPT}
                fileFilter={isHeicLike}
                processFiles={(files) => processHeicToJpgBatch(files)}
                onSidebarReserveChange={setSidebarReserve}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
