"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "../Header";
import Footer from "../Footer";
import ImageToolsBatchForm from "../ImageToolsBatchForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { processWebpBatch } from "@/lib/client-image-jobs";

export default function ImageWebpPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden pb-5">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {t("image_webp.title")}
              </CardTitle>
              <p className="text-gray-600">{t("image_webp.description")}</p>
            </CardHeader>
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
