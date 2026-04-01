"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BlurMode } from "@/lib/image-blur-effects";
import {
  applyFullImageBlur,
  compositeBackgroundBlur,
  getSubjectAlphaMask,
} from "@/lib/image-blur-effects";

type Props = {
  files: File[];
  mode: BlurMode;
  angleDeg: number;
  distancePx: number;
  samples: number;
  blurBackground: boolean;
};

function useDebounced<T>(value: T, ms: number): T {
  const [d, setD] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setD(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return d;
}

export default function ImageMotionBlurLivePreview({
  files,
  mode,
  angleDeg,
  distancePx,
  samples,
  blurBackground,
}: Props) {
  const { t } = useLanguage();
  const [previewIndex, setPreviewIndex] = useState(0);
  const [thumbUrls, setThumbUrls] = useState<string[]>([]);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const previewBlobRef = useRef<string | null>(null);

  const debounceMs = blurBackground ? 500 : 200;
  const dMode = useDebounced(mode, debounceMs);
  const dAngle = useDebounced(angleDeg, debounceMs);
  const dDistance = useDebounced(distancePx, debounceMs);
  const dSamples = useDebounced(samples, debounceMs);
  const dBg = useDebounced(blurBackground, debounceMs);

  const safeIndex = Math.min(previewIndex, Math.max(0, files.length - 1));
  const file = files[safeIndex];

  useEffect(() => {
    setPreviewIndex(0);
  }, [files]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setThumbUrls(urls);
    return () => {
      for (const u of urls) URL.revokeObjectURL(u);
    };
  }, [files]);

  useEffect(() => {
    if (!file) {
      if (previewBlobRef.current) {
        URL.revokeObjectURL(previewBlobRef.current);
        previewBlobRef.current = null;
      }
      setObjectUrl(null);
      setLoading(false);
      return;
    }
    let alive = true;
    setObjectUrl(null);
    setLoading(true);

    void (async () => {
      let bitmap: ImageBitmap | null = null;
      try {
        bitmap = await createImageBitmap(file);
        const w = bitmap.width;
        const h = bitmap.height;
        let canvas = applyFullImageBlur(bitmap, {
          mode: dMode,
          angleDeg: dAngle,
          distancePx: dDistance,
          samples: dSamples,
        });
        if (dBg) {
          try {
            const mask = await getSubjectAlphaMask(file, w, h);
            if (alive) {
              canvas = compositeBackgroundBlur(bitmap, canvas, mask);
            }
          } catch {
            /* keep full-image blur */
          }
        }
        if (!alive) return;
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/jpeg", 0.88);
        });
        if (!alive || !blob) return;
        const u = URL.createObjectURL(blob);
        if (!alive) {
          URL.revokeObjectURL(u);
          return;
        }
        if (previewBlobRef.current) {
          URL.revokeObjectURL(previewBlobRef.current);
        }
        previewBlobRef.current = u;
        setObjectUrl(u);
      } catch {
        if (alive) setObjectUrl(null);
      } finally {
        bitmap?.close();
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      if (previewBlobRef.current) {
        URL.revokeObjectURL(previewBlobRef.current);
        previewBlobRef.current = null;
      }
    };
  }, [file, dMode, dAngle, dDistance, dSamples, dBg]);

  if (!file) return null;

  return (
    <div className="flex flex-col items-center gap-4 w-full min-w-0">
      <div className="relative w-full max-w-2xl rounded-lg border border-primary/15 bg-card/40 p-3 sm:p-4">
        <p className="mb-2 text-center text-xs text-muted-foreground">
          {t("image_motion_blur.preview_hint")}
        </p>
        <div className="relative flex min-h-[200px] items-center justify-center rounded-md bg-background/50">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
              <span className="text-xs">{t("image_motion_blur.preview_loading")}</span>
            </div>
          ) : objectUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={objectUrl}
              alt=""
              className="max-h-[min(60vh,520px)] w-auto max-w-full rounded object-contain"
            />
          ) : (
            <p className="px-4 text-center text-sm text-muted-foreground">
              {t("image_motion_blur.preview_error")}
            </p>
          )}
        </div>
      </div>

      {files.length > 1 ? (
        <div className="w-full max-w-2xl">
          <p className="mb-2 text-center text-xs text-muted-foreground">
            {t("image_motion_blur.preview_thumbnails_hint")}
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
                    : "border-primary/20 opacity-80 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbUrls[i] ?? ""}
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
