"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type WatermarkPreviewLayer = {
  id: string;
  kind: "text" | "image";
  text: string;
  textColor: string;
  fontSizeRatio: number;
  imageUrl: string | null;
  imageWidthRatio: number;
  anchorX: number;
  anchorY: number;
  opacity: number;
};

type DrawRect = { ox: number; oy: number; w: number; h: number };

function getImageDrawRect(img: HTMLImageElement): DrawRect | null {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (!nw || !nh) return null;
  const cw = img.clientWidth;
  const ch = img.clientHeight;
  const r = nw / nh;
  const boxR = cw / ch;
  if (r > boxR) {
    const w = cw;
    const h = cw / r;
    return { ox: 0, oy: (ch - h) / 2, w, h };
  }
  const h = ch;
  const w = ch * r;
  return { ox: (cw - w) / 2, oy: 0, w, h };
}

type Props = {
  imageUrl: string;
  naturalW: number;
  naturalH: number;
  layers: WatermarkPreviewLayer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onLayerAnchorChange: (id: string, x: number, y: number) => void;
  onLayerImageWidthRatioChange: (id: string, ratio: number) => void;
  onImageDimensions?: (w: number, h: number) => void;
  className?: string;
};

export default function ImageWatermarkCanvas({
  imageUrl,
  naturalW,
  naturalH,
  layers,
  activeLayerId,
  onSelectLayer,
  onLayerAnchorChange,
  onLayerImageWidthRatioChange,
  onImageDimensions,
  className,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [drawRect, setDrawRect] = useState<DrawRect | null>(null);

  const measure = useCallback(() => {
    const img = imgRef.current;
    if (!img?.complete) return;
    setDrawRect(getImageDrawRect(img));
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [measure, imageUrl, naturalW, naturalH]);

  const dragRef = useRef<{
    layerId: string;
    kind: "move" | "resize";
    startX: number;
    startY: number;
    startAnchorX: number;
    startAnchorY: number;
    startRatio: number;
  } | null>(null);

  const onPointerDownBox = (layer: WatermarkPreviewLayer, e: React.PointerEvent) => {
    if (e.button !== 0 || !drawRect) return;
    e.preventDefault();
    e.stopPropagation();
    onSelectLayer(layer.id);
    dragRef.current = {
      layerId: layer.id,
      kind: "move",
      startX: e.clientX,
      startY: e.clientY,
      startAnchorX: layer.anchorX,
      startAnchorY: layer.anchorY,
      startRatio: layer.imageWidthRatio,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerDownResize = (layer: WatermarkPreviewLayer, e: React.PointerEvent) => {
    if (e.button !== 0 || !drawRect) return;
    e.preventDefault();
    e.stopPropagation();
    onSelectLayer(layer.id);
    dragRef.current = {
      layerId: layer.id,
      kind: "resize",
      startX: e.clientX,
      startY: e.clientY,
      startAnchorX: layer.anchorX,
      startAnchorY: layer.anchorY,
      startRatio: layer.imageWidthRatio,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !drawRect) return;
    e.preventDefault();
    if (d.kind === "move") {
      const dx = (e.clientX - d.startX) / drawRect.w;
      const dy = (e.clientY - d.startY) / drawRect.h;
      onLayerAnchorChange(
        d.layerId,
        Math.min(1, Math.max(0, d.startAnchorX + dx)),
        Math.min(1, Math.max(0, d.startAnchorY + dy))
      );
    } else {
      const dx = (e.clientX - d.startX) / drawRect.w;
      const next = Math.min(0.95, Math.max(0.03, d.startRatio + dx * 1.2));
      onLayerImageWidthRatioChange(d.layerId, next);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragRef.current) {
      dragRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className={cn("relative inline-block max-w-full", className)}>
      <div ref={wrapRef} className="relative inline-block max-w-full">
        <img
          ref={imgRef}
          src={imageUrl}
          alt=""
          className="pointer-events-none mx-auto block max-h-[min(65vh,560px)] w-auto max-w-full select-none"
          draggable={false}
          onLoad={(e) => {
            measure();
            const im = e.currentTarget;
            onImageDimensions?.(im.naturalWidth, im.naturalHeight);
          }}
        />
        {drawRect && naturalW >= 1 && naturalH >= 1 ? (
          <div
            className="pointer-events-none absolute z-10 border border-dashed border-[#d6ffd2]/40"
            style={{
              left: drawRect.ox,
              top: drawRect.oy,
              width: drawRect.w,
              height: drawRect.h,
            }}
          />
        ) : null}
        {drawRect &&
          layers.map((layer, idx) => {
            const isActive = layer.id === activeLayerId;
            const previewFontPx = Math.max(
              10,
              Math.min(drawRect.w, drawRect.h) *
                Math.min(0.35, Math.max(0.01, layer.fontSizeRatio))
            );
            const wmDisplayW = drawRect.w * layer.imageWidthRatio;
            const z = 20 + idx;

            return (
              <div
                key={layer.id}
                className="absolute touch-none select-none"
                style={{
                  left: drawRect.ox + layer.anchorX * drawRect.w,
                  top: drawRect.oy + layer.anchorY * drawRect.h,
                  transform: "translate(-50%, -50%)",
                  opacity: Math.min(1, Math.max(0.2, layer.opacity)),
                  zIndex: z,
                }}
              >
                <div
                  className={cn(
                    isActive &&
                      "rounded-sm ring-2 ring-[#d6ffd2] ring-offset-2 ring-offset-[#103c44]/80"
                  )}
                >
                  <div
                    className={cn(isActive ? "cursor-move" : "cursor-pointer")}
                    onPointerDown={(e) => onPointerDownBox(layer, e)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                  >
                    {layer.kind === "text" ? (
                      <div
                        className="whitespace-pre-wrap text-center font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] max-w-[min(92vw,420px)] px-1 pointer-events-auto"
                        style={{
                          fontSize: previewFontPx,
                          color: layer.textColor,
                          lineHeight: 1.2,
                        }}
                      >
                        {layer.text.trim() || "—"}
                      </div>
                    ) : layer.imageUrl ? (
                      <div className="relative inline-block pointer-events-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={layer.imageUrl}
                          alt=""
                          className="block w-auto pointer-events-none"
                          style={{
                            width: wmDisplayW,
                            height: "auto",
                            maxHeight: "40vh",
                          }}
                          draggable={false}
                        />
                        {isActive ? (
                          <button
                            type="button"
                            className="absolute -right-1 -bottom-1 z-30 h-4 w-4 rounded-sm border border-[#00232d] bg-[#d6ffd2] shadow cursor-nwse-resize pointer-events-auto"
                            aria-label="Resize watermark"
                            onPointerDown={(e) => onPointerDownResize(layer, e)}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={onPointerUp}
                          />
                        ) : null}
                      </div>
                    ) : (
                      <div className="rounded border border-[#d6ffd2]/40 bg-black/30 px-3 py-2 text-xs text-[#d6ffd2]/80 pointer-events-auto">
                        …
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
