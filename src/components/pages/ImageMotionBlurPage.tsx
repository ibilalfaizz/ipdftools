"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "../Header";
import Footer from "../Footer";
import ImageToolsBatchForm from "../ImageToolsBatchForm";
import ImageMotionBlurLivePreview from "../ImageMotionBlurLivePreview";
import { useLanguage } from "@/contexts/LanguageContext";
import { processImageBlurBatch } from "@/lib/client-image-jobs";
import type { BlurMode } from "@/lib/image-blur-effects";
import { IMAGE_TOOL_SHEET_RESERVE } from "@/lib/image-tool-sheet-layout";
import { cn } from "@/lib/utils";

export default function ImageMotionBlurPage() {
  const { t } = useLanguage();
  const [sidebarReserve, setSidebarReserve] = useState(false);
  const [mode, setMode] = useState<BlurMode>("motion");
  const [angleDeg, setAngleDeg] = useState(112);
  const [distancePx, setDistancePx] = useState(38);
  const [samples, setSamples] = useState(18);
  const [blurBackground, setBlurBackground] = useState(false);

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
                translationPrefix="image_motion_blur"
                onSidebarReserveChange={setSidebarReserve}
                processFiles={(files) =>
                  processImageBlurBatch(files, {
                    mode,
                    angleDeg,
                    distancePx,
                    samples,
                    blurBackground,
                  })
                }
                renderWhenHasFiles={(files) => (
                  <ImageMotionBlurLivePreview
                    files={files}
                    mode={mode}
                    angleDeg={angleDeg}
                    distancePx={distancePx}
                    samples={samples}
                    blurBackground={blurBackground}
                  />
                )}
              >
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      {t("image_motion_blur.blur_type")}
                    </Label>
                    <RadioGroup
                      value={mode}
                      onValueChange={(v) => setMode(v as BlurMode)}
                      className="flex flex-col gap-2"
                    >
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <RadioGroupItem value="gaussian" id="blur-gaussian" />
                        <span>{t("image_motion_blur.gaussian")}</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <RadioGroupItem value="motion" id="blur-motion" />
                        <span>{t("image_motion_blur.motion")}</span>
                      </label>
                    </RadioGroup>
                  </div>

                  <div className="space-y-5">
                    <div
                      className={cn(
                        "space-y-2",
                        mode === "gaussian" && "opacity-55"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="motion-angle">
                          {t("image_motion_blur.angle")}
                        </Label>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {angleDeg}°
                        </span>
                      </div>
                      <Slider
                        id="motion-angle"
                        min={0}
                        max={360}
                        step={1}
                        value={[angleDeg]}
                        onValueChange={(v) => setAngleDeg(v[0] ?? 0)}
                        disabled={mode === "gaussian"}
                        className="py-1"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="blur-distance">
                          {mode === "motion"
                            ? t("image_motion_blur.distance")
                            : t("image_motion_blur.radius")}
                        </Label>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {distancePx}px
                        </span>
                      </div>
                      <Slider
                        id="blur-distance"
                        min={1}
                        max={mode === "motion" ? 120 : 80}
                        step={1}
                        value={[distancePx]}
                        onValueChange={(v) => setDistancePx(v[0] ?? 1)}
                        className="py-1"
                      />
                    </div>
                    <div
                      className={cn(
                        "space-y-2",
                        mode === "gaussian" && "opacity-55"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="motion-samples">
                          {t("image_motion_blur.samples")}
                        </Label>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {samples}
                        </span>
                      </div>
                      <Slider
                        id="motion-samples"
                        min={3}
                        max={64}
                        step={1}
                        value={[samples]}
                        onValueChange={(v) => setSamples(v[0] ?? 3)}
                        disabled={mode === "gaussian"}
                        className="py-1"
                      />
                    </div>
                  </div>
                  {mode === "gaussian" ? (
                    <p className="text-xs text-muted-foreground -mt-1">
                      {t("image_motion_blur.gaussian_sliders_note")}
                    </p>
                  ) : null}

                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      id="blur-bg"
                      checked={blurBackground}
                      onCheckedChange={(c) =>
                        setBlurBackground(c === true)
                      }
                    />
                    <span>{t("image_motion_blur.blur_background")}</span>
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {t("image_motion_blur.blur_background_hint")}
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
