"use client";

import { Card, CardContent } from "@/components/ui/card";
import Header from "../Header";
import Footer from "../Footer";
import ImageToolsBatchForm from "../ImageToolsBatchForm";
import ImageRemoveBackgroundLivePreview from "../ImageRemoveBackgroundLivePreview";
import { processRemoveBackgroundBatch } from "@/lib/client-image-jobs";

export default function ImageRemoveBackgroundPage() {
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="tool-page-card">
            <CardContent className="p-0">
              <ImageToolsBatchForm
                translationPrefix="image_remove_bg"
                processFiles={(files) => processRemoveBackgroundBatch(files)}
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
