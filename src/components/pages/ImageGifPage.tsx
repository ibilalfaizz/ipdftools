"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Header from "../Header";
import Footer from "../Footer";
import ImageToolsBatchForm from "../ImageToolsBatchForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { processGifBatch } from "@/lib/client-image-gif";
import { IMAGE_TOOL_SHEET_RESERVE } from "@/lib/image-tool-sheet-layout";
import { cn } from "@/lib/utils";

export default function ImageGifPage() {
  const { t } = useLanguage();
  const [secondsPerImage, setSecondsPerImage] = useState(1);
  const [loop, setLoop] = useState(true);
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
                translationPrefix="image_gif"
                downloadPrimaryLabelKey="image_tools.download_gif"
                processFiles={(files) =>
                  processGifBatch(files, { secondsPerImage, loop })
                }
                onSidebarReserveChange={setSidebarReserve}
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gif-seconds">{t("image_gif.seconds_label")}</Label>
                    <Input
                      id="gif-seconds"
                      type="number"
                      min={0.05}
                      max={30}
                      step={0.05}
                      value={secondsPerImage}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setSecondsPerImage(
                          Number.isFinite(v) ? v : 1
                        );
                      }}
                      className="border-[#d6ffd2]/25 bg-[#103c44]/50 text-[#d6ffd2]"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("image_gif.seconds_hint")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-[#d6ffd2]/15 bg-[#103c44]/40 px-3 py-2">
                    <Label htmlFor="gif-loop" className="cursor-pointer text-sm">
                      {t("image_gif.loop_label")}
                    </Label>
                    <Switch
                      id="gif-loop"
                      checked={loop}
                      onCheckedChange={setLoop}
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
