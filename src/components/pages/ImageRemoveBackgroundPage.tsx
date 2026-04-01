"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Header from "../Header";
import Footer from "../Footer";
import ImageToolsBatchForm from "../ImageToolsBatchForm";
import ImageRemoveBackgroundLivePreview from "../ImageRemoveBackgroundLivePreview";
import { processRemoveBackgroundBatch } from "@/lib/client-image-jobs";
import { IMAGE_TOOL_SHEET_RESERVE } from "@/lib/image-tool-sheet-layout";
import { cn } from "@/lib/utils";

export default function ImageRemoveBackgroundPage() {
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
                translationPrefix="image_remove_bg"
                processFiles={(files) => processRemoveBackgroundBatch(files)}
                onSidebarReserveChange={setSidebarReserve}
                renderWhenHasFiles={(files, ctx) => (
                  <ImageRemoveBackgroundLivePreview
                    key={files
                      .map((f) => `${f.name}|${f.size}|${f.lastModified}`)
                      .join(";;")}
                    files={files}
                    result={ctx!.result}
                    busy={ctx!.busy}
                  />
                )}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
