"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FaceBlurBox } from "@/lib/face-blur-blazeface";
import { imageFileKey } from "@/lib/image-file-key";
import ImageBlurRegionsEditor from "@/components/ImageBlurRegionsEditor";

type Props = {
  files: File[];
  blurPx: number;
  boxesByFileKey: Record<string, FaceBlurBox[]>;
  onBoxesForFileChange: (fileKey: string, boxes: FaceBlurBox[]) => void;
};

/** When nothing is detected, user still gets one region to drag over the subject. */
function defaultBlurRegion(iw: number, ih: number): FaceBlurBox {
  const ratio = 0.45;
  let w = Math.round(iw * ratio);
  let h = Math.round(ih * ratio);
  w = Math.max(8, Math.min(w, iw));
  h = Math.max(8, Math.min(h, ih));
  const x = Math.round((iw - w) / 2);
  const y = Math.round((ih - h) / 2);
  return { x, y, w, h };
}

export default function ImageBlurFaceLivePreview({
  files,
  blurPx,
  boxesByFileKey,
  onBoxesForFileChange,
}: Props) {
  const { t } = useLanguage();
  const [previewIndex, setPreviewIndex] = useState(0);
  const [thumbUrls, setThumbUrls] = useState<string[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [noFacesInPreview, setNoFacesInPreview] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  const boxesByFileKeyRef = useRef(boxesByFileKey);
  boxesByFileKeyRef.current = boxesByFileKey;
  const onBoxesRef = useRef(onBoxesForFileChange);
  onBoxesRef.current = onBoxesForFileChange;

  const safeIndex = Math.min(previewIndex, Math.max(0, files.length - 1));
  const file = files[safeIndex];
  const fileKey = useMemo(
    () => (file ? imageFileKey(file) : ""),
    [file]
  );

  const currentBoxes = fileKey ? boxesByFileKey[fileKey] : undefined;

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
    let cancelled = false;
    setPreviewError(false);
    setNoFacesInPreview(false);
    setNaturalSize({ w: 0, h: 0 });

    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const key = imageFileKey(file);
    const stored = boxesByFileKeyRef.current[key];

    setDetecting(true);

    (async () => {
      try {
        if (stored !== undefined) {
          const bitmap = await createImageBitmap(file);
          if (cancelled) {
            bitmap.close();
            return;
          }
          setNaturalSize({ w: bitmap.width, h: bitmap.height });
          bitmap.close();
          return;
        }

        const bitmap = await createImageBitmap(file);
        if (cancelled) {
          bitmap.close();
          return;
        }
        const iw = bitmap.width;
        const ih = bitmap.height;
        setNaturalSize({ w: iw, h: ih });

        const { getFaceBoxesFromBitmap } = await import(
          "@/lib/face-blur-blazeface"
        );
        const detected = await getFaceBoxesFromBitmap(bitmap);
        bitmap.close();
        if (cancelled) return;

        const boxes: FaceBlurBox[] =
          detected.length > 0
            ? detected
            : [defaultBlurRegion(iw, ih)];

        setNoFacesInPreview(detected.length === 0);
        onBoxesRef.current(key, boxes);
      } catch {
        if (!cancelled) setPreviewError(true);
      } finally {
        if (!cancelled) setDetecting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file, safeIndex]);

  const onEditorBoxesChange = useCallback(
    (boxes: FaceBlurBox[]) => {
      if (!fileKey) return;
      onBoxesForFileChange(fileKey, boxes);
    },
    [fileKey, onBoxesForFileChange]
  );

  if (files.length === 0) {
    return null;
  }

  const editorUrl = thumbUrls[safeIndex] ?? "";
  const showEditor =
    !detecting &&
    !previewError &&
    currentBoxes !== undefined &&
    naturalSize.w > 0 &&
    naturalSize.h > 0;

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <p className="max-w-md text-center text-xs text-muted-foreground">
        {t("image_blur_face.preview_hint")}
      </p>

      <div className="relative flex w-full min-h-[min(52vh,460px)] flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-[#d6ffd2]/20 bg-[#00232d]/40 p-6 sm:p-10">
        {detecting ? (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin" aria-hidden />
            <span className="text-sm">
              {t("image_blur_face.preview_detecting")}
            </span>
          </div>
        ) : previewError ? (
          <p className="max-w-sm text-center text-sm text-destructive">
            {t("image_tools.face_blur_model_failed")}
          </p>
        ) : (
          <>
            {showEditor ? (
              <ImageBlurRegionsEditor
                imageUrl={editorUrl}
                naturalW={naturalSize.w}
                naturalH={naturalSize.h}
                boxes={currentBoxes}
                blurPx={blurPx}
                onBoxesChange={onEditorBoxesChange}
              />
            ) : null}
            {noFacesInPreview && showEditor ? (
              <p className="max-w-md rounded-md bg-background/90 px-3 py-2 text-center text-xs text-muted-foreground">
                {t("image_blur_face.preview_no_faces")}
              </p>
            ) : null}
          </>
        )}
      </div>

      {files.length > 1 ? (
        <div className="w-full max-w-2xl">
          <p className="mb-2 text-center text-xs text-muted-foreground">
            {t("image_blur_face.preview_thumbnails_hint")}
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
