"use client";

import { Card, CardContent } from "@/components/ui/card";
import Header from "../Header";
import Footer from "../Footer";
import ImageToolsBatchForm from "../ImageToolsBatchForm";
import { processWebpBatch } from "@/lib/client-image-jobs";

export default function ImageWebpPage() {
  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="tool-page-card">
            <CardContent className="p-0">
              <ImageToolsBatchForm
                translationPrefix="image_webp"
                processFiles={(files) => processWebpBatch(files)}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
