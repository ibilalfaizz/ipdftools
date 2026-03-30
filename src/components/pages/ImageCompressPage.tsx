"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "../Header";
import Footer from "../Footer";
import ImageToolsBatchForm from "../ImageToolsBatchForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { processCompressBatch } from "@/lib/client-image-jobs";

export default function ImageCompressPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="tool-page-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                {t("image_compress.title")}
              </CardTitle>
              <p className="text-muted-foreground">{t("image_compress.description")}</p>
            </CardHeader>
            <CardContent className="p-0">
              <ImageToolsBatchForm
                translationPrefix="image_compress"
                processFiles={(files) => processCompressBatch(files)}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
