"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  files: File[];
  /** Cumulative clockwise rotation for preview (0, 90, 180, or 270). */
  rotationDegrees: number;
};

export default function ImageRotateLivePreview({
  files,
  rotationDegrees,
}: Props) {
  const { t } = useLanguage();
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    setPreviewIndex(0);
  }, [files]);

  const safeIndex = Math.min(
    previewIndex,
    Math.max(0, files.length - 1)
  );

  const [objectUrls, setObjectUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setObjectUrls(urls);
    return () => {
      for (const u of urls) URL.revokeObjectURL(u);
    };
  }, [files]);

  const mainUrl = objectUrls[safeIndex];
  const previewAngle = ((rotationDegrees % 360) + 360) % 360;

  if (files.length === 0 || !mainUrl) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <p className="max-w-md text-center text-xs text-muted-foreground">
        {t("image_rotate.preview_hint")}
      </p>

      <div
        className="relative flex w-full items-center justify-center overflow-visible rounded-xl border border-[#d6ffd2]/20 bg-[#00232d]/40 p-6 sm:p-10"
        style={{ minHeight: "min(52vh, 460px)" }}
      >
        <div
          className="flex items-center justify-center transition-transform duration-300 ease-out"
          style={{ transform: `rotate(${previewAngle}deg)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainUrl}
            alt=""
            className="max-h-[min(48vh,400px)] max-w-[min(92vw,720px)] w-auto h-auto object-contain rounded-md shadow-lg ring-1 ring-[#d6ffd2]/15"
          />
        </div>
      </div>

      {files.length > 1 ? (
        <div className="w-full max-w-2xl">
          <p className="mb-2 text-center text-xs text-muted-foreground">
            {t("image_rotate.thumbnails_hint")}
          </p>
          <div className="flex justify-center gap-2 overflow-x-auto pb-1 pt-1">
            {files.map((f, i) => (
              <button
                key={`${f.name}-${f.size}-${f.lastModified}-${i}`}
                type="button"
                onClick={() => setPreviewIndex(i)}
                className={`shrink-0 overflow-hidden rounded-md border-2 transition-opacity ${
                  i === safeIndex
                    ? "border-primary opacity-100 ring-2 ring-primary/30"
                    : "border-[#d6ffd2]/25 opacity-80 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={objectUrls[i]}
                  alt=""
                  className="h-14 w-14 object-cover sm:h-16 sm:w-16"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
