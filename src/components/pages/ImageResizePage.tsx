"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "../Header";
import Footer from "../Footer";
import SEOHead from "../SEOHead";
import ImageToolsBatchForm from "../ImageToolsBatchForm";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ImageResizePage() {
  const { t } = useLanguage();
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      <SEOHead toolName="image_resize" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {t("image_resize.title")}
              </CardTitle>
              <p className="text-gray-600">{t("image_resize.description")}</p>
            </CardHeader>
            <CardContent>
              <ImageToolsBatchForm
                apiPath="/api/resize"
                translationPrefix="image_resize"
                appendToFormData={(fd) => {
                  fd.append("width", String(width));
                  fd.append("height", String(height));
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="img-w">{t("image_resize.width")}</Label>
                    <Input
                      id="img-w"
                      type="number"
                      min={1}
                      max={8192}
                      value={width}
                      onChange={(e) =>
                        setWidth(
                          Math.min(
                            8192,
                            Math.max(1, parseInt(e.target.value, 10) || 1)
                          )
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="img-h">{t("image_resize.height")}</Label>
                    <Input
                      id="img-h"
                      type="number"
                      min={1}
                      max={8192}
                      value={height}
                      onChange={(e) =>
                        setHeight(
                          Math.min(
                            8192,
                            Math.max(1, parseInt(e.target.value, 10) || 1)
                          )
                        )
                      }
                    />
                  </div>
                </div>
              </ImageToolsBatchForm>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
