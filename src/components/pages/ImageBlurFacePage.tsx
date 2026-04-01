"use client";

import { useCallback, useState } from "react";
import { IMAGE_TOOL_SHEET_RESERVE } from "@/lib/image-tool-sheet-layout";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Header from "../Header";
import Footer from "../Footer";
import ImageToolsBatchForm from "../ImageToolsBatchForm";
import ImageBlurFaceLivePreview from "../ImageBlurFaceLivePreview";
import { useLanguage } from "@/contexts/LanguageContext";
import { processFaceBlurBatch } from "@/lib/client-image-jobs";
import type { FaceBlurBox } from "@/lib/face-blur-blazeface";

export default function ImageBlurFacePage() {
  const { t } = useLanguage();
  const [sidebarReserve, setSidebarReserve] = useState(false);
  const [blurPx, setBlurPx] = useState(20);
  const [boxesByFileKey, setBoxesByFileKey] = useState<
    Record<string, FaceBlurBox[]>
  >({});

  const setBoxesForFile = useCallback((key: string, boxes: FaceBlurBox[]) => {
    setBoxesByFileKey((prev) => ({ ...prev, [key]: boxes }));
  }, []);

  const onFilesChange = useCallback((files: File[]) => {
    if (files.length === 0) setBoxesByFileKey({});
  }, []);

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
                translationPrefix="image_blur_face"
                onFilesChange={onFilesChange}
                onSidebarReserveChange={setSidebarReserve}
                processFiles={(files) =>
                  processFaceBlurBatch(files, blurPx, boxesByFileKey)
                }
                renderWhenHasFiles={(files) => (
                  <ImageBlurFaceLivePreview
                    files={files}
                    blurPx={blurPx}
                    boxesByFileKey={boxesByFileKey}
                    onBoxesForFileChange={setBoxesForFile}
                  />
                )}
              >
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="face-blur-slider">
                        {t("image_blur_face.blur_strength")}
                      </Label>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {blurPx}px
                      </span>
                    </div>
                    <Slider
                      id="face-blur-slider"
                      min={6}
                      max={48}
                      step={2}
                      value={[blurPx]}
                      onValueChange={(v) => setBlurPx(v[0] ?? 20)}
                      className="py-1"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("image_blur_face.blur_hint")}
                    </p>
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
