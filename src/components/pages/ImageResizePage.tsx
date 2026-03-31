"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "../Header";
import Footer from "../Footer";
import ImageToolsBatchForm from "../ImageToolsBatchForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { processResizeBatch } from "@/lib/client-image-jobs";

export default function ImageResizePage() {
  const { t } = useLanguage();
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);

  return (
    <div className="min-h-screen app-bg">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="tool-page-card">
            <CardContent className="p-0">
              <ImageToolsBatchForm
                translationPrefix="image_resize"
                processFiles={(files) =>
                  processResizeBatch(files, width, height)
                }
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
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
