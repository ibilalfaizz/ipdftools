"use client";

import { useCallback, useState } from "react";
import { RotateCw, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "../Header";
import Footer from "../Footer";
import ImageToolsBatchForm from "../ImageToolsBatchForm";
import ImageRotateLivePreview from "../ImageRotateLivePreview";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  processRotateBatch,
  type ImageRotateDegrees,
} from "@/lib/client-image-jobs";
import { IMAGE_TOOL_SHEET_RESERVE } from "@/lib/image-tool-sheet-layout";
import { cn } from "@/lib/utils";

function normalizeRotation90(n: number): ImageRotateDegrees {
  const x = ((Math.round(n) % 360) + 360) % 360;
  if (x === 0 || x === 90 || x === 180 || x === 270) return x;
  return 0;
}

export default function ImageRotatePage() {
  const { t } = useLanguage();
  const [rotationDeg, setRotationDeg] = useState(0);
  const [sidebarReserve, setSidebarReserve] = useState(false);

  const handleFilesChange = useCallback((files: File[]) => {
    if (files.length === 0) setRotationDeg(0);
  }, []);

  const rotateRight = useCallback(() => {
    setRotationDeg((d) => (d + 90) % 360);
  }, []);

  const rotateLeft = useCallback(() => {
    setRotationDeg((d) => (((d - 90) % 360) + 360) % 360);
  }, []);

  const effective = normalizeRotation90(rotationDeg);

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
                translationPrefix="image_rotate"
                onFilesChange={handleFilesChange}
                onSidebarReserveChange={setSidebarReserve}
                processFiles={(files) =>
                  processRotateBatch(files, effective)
                }
                renderWhenHasFiles={(files) => (
                  <ImageRotateLivePreview
                    files={files}
                    rotationDegrees={rotationDeg}
                  />
                )}
              >
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("image_rotate.sidebar_rotation_heading")}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 flex-1 gap-2 border-[#d6ffd2]/25 px-3"
                      onClick={rotateLeft}
                    >
                      <RotateCcw className="h-5 w-5 shrink-0" />
                      <span className="truncate text-sm">
                        {t("image_rotate.rotate_left")}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 flex-1 gap-2 border-[#d6ffd2]/25 px-3"
                      onClick={rotateRight}
                    >
                      <RotateCw className="h-5 w-5 shrink-0" />
                      <span className="truncate text-sm">
                        {t("image_rotate.rotate_right")}
                      </span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("image_rotate.net_rotation_label")}{" "}
                    <span className="font-medium text-foreground tabular-nums">
                      {effective}°
                    </span>
                  </p>
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
