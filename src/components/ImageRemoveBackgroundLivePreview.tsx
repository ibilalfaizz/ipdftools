"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ClientImageProcessResult } from "@/lib/client-image-jobs";
import { sanitizeStem } from "@/lib/image-zip-helpers";

type Props = {
  files: File[];
  result: ClientImageProcessResult | null;
  busy: boolean;
};

function findResultForFile(
  file: File,
  results: ClientImageProcessResult["files"]
): ClientImageProcessResult["files"][number] | undefined {
  const stem = sanitizeStem(file.name);
  const prefix = `${stem}_nobg`;
  return results.find(
    (r) =>
      r.name.startsWith(prefix) &&
      (r.name.endsWith(".png") || r.contentType.includes("png"))
  );
}

/** Data URLs avoid blob revoke races (e.g. React Strict Mode effect cleanup). */
function base64ToDataUrl(base64: string, contentType: string): string {
  return `data:${contentType};base64,${base64}`;
}

function filesIdentityKey(list: File[]): string {
  return list.map((f) => `${f.name}|${f.size}|${f.lastModified}`).join(";;");
}

export default function ImageRemoveBackgroundLivePreview({
  files,
  result,
  busy,
}: Props) {
  const { t } = useLanguage();
  const [previewIndex, setPreviewIndex] = useState(0);

  const filesKey = useMemo(() => filesIdentityKey(files), [files]);

  const safeIndex = Math.min(
    previewIndex,
    Math.max(0, files.length > 0 ? files.length - 1 : 0)
  );
  const file = files[safeIndex];

  /** Stable key avoids recreating/revoking blob URLs on unrelated parent re-renders. */
  const originalUrls = useMemo(() => {
    return files.map((f) => URL.createObjectURL(f));
    // filesKey captures the current file set; `files` in closure matches that render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally not [files] (reference churn)
  }, [filesKey]);

  const prevFilesKeyRef = useRef<string | null>(null);
  const originalBlobUrlsRef = useRef<string[]>([]);

  // Do not revoke in an effect *cleanup* tied to `originalUrls`: Strict Mode runs cleanup
  // before remount and revokes URLs the <img> is still loading (net::ERR_FILE_NOT_FOUND).
  useEffect(() => {
    if (
      prevFilesKeyRef.current !== null &&
      prevFilesKeyRef.current !== filesKey
    ) {
      for (const u of originalBlobUrlsRef.current) URL.revokeObjectURL(u);
    }
    prevFilesKeyRef.current = filesKey;
    originalBlobUrlsRef.current = originalUrls;
  }, [filesKey, originalUrls]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    return () => {
      for (const u of originalBlobUrlsRef.current) URL.revokeObjectURL(u);
    };
  }, []);

  const cutoutUrl = useMemo(() => {
    if (!result || !file) return null;
    const hit = findResultForFile(file, result.files);
    if (!hit) return null;
    return base64ToDataUrl(hit.data, hit.contentType || "image/png");
  }, [result, file]);

  const showingCutout = Boolean(cutoutUrl);
  const displaySrc = showingCutout ? cutoutUrl! : (originalUrls[safeIndex] ?? "");

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <p className="max-w-md text-center text-xs text-muted-foreground">
        {showingCutout
          ? t("image_remove_bg.preview_after")
          : t("image_remove_bg.preview_before")}
      </p>

      <div className="relative flex w-full min-h-[min(52vh,460px)] items-center justify-center overflow-hidden rounded-xl border border-[#d6ffd2]/20 bg-[#00232d]/40 p-6 sm:p-10">
        {busy ? (
          <div
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[#00232d]/55"
            aria-hidden
          >
            <Loader2 className="h-10 w-10 animate-spin text-[#d6ffd2]" />
          </div>
        ) : null}

        <div
          className="relative inline-flex max-h-[min(52vh,480px)] max-w-full items-center justify-center rounded-md p-1 shadow-lg ring-1 ring-[#d6ffd2]/15"
          style={
            showingCutout
              ? {
                  backgroundImage:
                    "repeating-conic-gradient(#163d44 0% 25%, #0e2b32 0% 50%)",
                  backgroundSize: "18px 18px",
                }
              : undefined
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displaySrc}
            alt=""
            className="max-h-[min(48vh,440px)] w-auto max-w-full rounded-md object-contain"
          />
        </div>
      </div>

      {files.length > 1 ? (
        <div className="w-full max-w-2xl">
          <p className="mb-2 text-center text-xs text-muted-foreground">
            {t("image_remove_bg.preview_thumbnails_hint")}
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
                  src={originalUrls[i] ?? ""}
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
