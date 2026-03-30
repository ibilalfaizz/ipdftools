"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type PixelCrop = { x: number; y: number; w: number; h: number };

type DrawRect = { ox: number; oy: number; w: number; h: number; scale: number };

const MIN_CROP = 2;
const HANDLE = 10;

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
    return { ox: 0, oy: (ch - h) / 2, w, h, scale: w / nw };
  }
  const h = ch;
  const w = ch * r;
  return { ox: (cw - w) / 2, oy: 0, w, h, scale: w / nw };
}

function clampCrop(c: PixelCrop, iw: number, ih: number): PixelCrop {
  let { x, y, w, h } = c;
  w = Math.max(MIN_CROP, Math.min(Math.round(w), iw));
  h = Math.max(MIN_CROP, Math.min(Math.round(h), ih));
  x = Math.max(0, Math.min(Math.round(x), iw - w));
  y = Math.max(0, Math.min(Math.round(y), ih - h));
  return { x, y, w, h };
}

/** Default crop ~50% of each dimension so shaded “draw” area is easy to hit. */
export function defaultCenteredCrop(iw: number, ih: number): PixelCrop {
  const ratio = 0.5;
  let w = Math.round(iw * ratio);
  let h = Math.round(ih * ratio);
  w = Math.max(MIN_CROP, Math.min(w, iw));
  h = Math.max(MIN_CROP, Math.min(h, ih));
  const x = Math.round((iw - w) / 2);
  const y = Math.round((ih - h) / 2);
  return { x, y, w, h };
}

type DragMode =
  | "move"
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

function isInsideDrawRect(lx: number, ly: number, dr: DrawRect): boolean {
  return (
    lx >= dr.ox &&
    lx <= dr.ox + dr.w &&
    ly >= dr.oy &&
    ly <= dr.oy + dr.h
  );
}

function clientToPixel(
  clientX: number,
  clientY: number,
  wrapRect: DOMRect,
  dr: DrawRect,
  iw: number,
  ih: number
): { px: number; py: number } | null {
  const lx = clientX - wrapRect.left;
  const ly = clientY - wrapRect.top;
  if (!isInsideDrawRect(lx, ly, dr)) return null;
  const ix = Math.max(dr.ox, Math.min(dr.ox + dr.w, lx));
  const iy = Math.max(dr.oy, Math.min(dr.oy + dr.h, ly));
  const px = (ix - dr.ox) / dr.scale;
  const py = (iy - dr.oy) / dr.scale;
  return {
    px: Math.max(0, Math.min(iw - 1e-6, px)),
    py: Math.max(0, Math.min(ih - 1e-6, py)),
  };
}

function cropFromMarquee(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  iw: number,
  ih: number
): PixelCrop {
  const x = Math.min(ax, bx);
  const y = Math.min(ay, by);
  const w = Math.abs(bx - ax);
  const h = Math.abs(by - ay);
  return clampCrop(
    {
      x: Math.floor(x),
      y: Math.floor(y),
      w: Math.round(w),
      h: Math.round(h),
    },
    iw,
    ih
  );
}

/**
 * Resize only when near the crop border (handles). The shaded area outside the crop
 * must NOT use edge hitboxes that extend to infinity (e.g. lx ≤ cl+h2), or the whole
 * dark band becomes “west edge” and only resize works — never a new marquee.
 *
 * Interior → move only when `wantInteriorMove` (Alt+drag). Otherwise interior draws.
 */
function hitTestHandle(
  lx: number,
  ly: number,
  cdX: number,
  cdY: number,
  cdW: number,
  cdH: number,
  wantInteriorMove: boolean
): DragMode | null {
  const h2 = HANDLE / 2;
  const cl = cdX;
  const cr = cdX + cdW;
  const ct = cdY;
  const cb = cdY + cdH;

  // Corners: tight boxes around each vertex (match visible handles).
  if (lx >= cl - h2 && lx <= cl + h2 && ly >= ct - h2 && ly <= ct + h2) return "nw";
  if (lx >= cr - h2 && lx <= cr + h2 && ly >= ct - h2 && ly <= ct + h2) return "ne";
  if (lx >= cl - h2 && lx <= cl + h2 && ly >= cb - h2 && ly <= cb + h2) return "sw";
  if (lx >= cr - h2 && lx <= cr + h2 && ly >= cb - h2 && ly <= cb + h2) return "se";

  // Edges: bands centered on each side (exclude corner squares).
  if (ly >= ct - h2 && ly <= ct + h2 && lx >= cl + h2 && lx <= cr - h2) return "n";
  if (ly >= cb - h2 && ly <= cb + h2 && lx >= cl + h2 && lx <= cr - h2) return "s";
  if (lx >= cl - h2 && lx <= cl + h2 && ly >= ct + h2 && ly <= cb - h2) return "w";
  if (lx >= cr - h2 && lx <= cr + h2 && ly >= ct + h2 && ly <= cb - h2) return "e";

  if (lx >= cl && lx <= cr && ly >= ct && ly <= cb) {
    return wantInteriorMove ? "move" : null;
  }

  return null;
}

/** Resize on handles/edges; move inside crop only with Alt; else crosshair (draw). */
function getCursorForPosition(
  clientX: number,
  clientY: number,
  wrapRect: DOMRect,
  dr: DrawRect,
  crop: PixelCrop,
  iw: number,
  ih: number,
  wantInteriorMove: boolean
): string {
  const lx = clientX - wrapRect.left;
  const ly = clientY - wrapRect.top;
  if (!isInsideDrawRect(lx, ly, dr)) return "";
  const ec = crop.w >= 2 && crop.h >= 2 ? crop : defaultCenteredCrop(iw, ih);
  const cdX = dr.ox + ec.x * dr.scale;
  const cdY = dr.oy + ec.y * dr.scale;
  const cdW = ec.w * dr.scale;
  const cdH = ec.h * dr.scale;
  const mode = hitTestHandle(
    lx,
    ly,
    cdX,
    cdY,
    cdW,
    cdH,
    wantInteriorMove
  );
  if (mode) return getResizeCursor(mode);
  return "crosshair";
}

type Props = {
  imageUrl: string;
  naturalW: number;
  naturalH: number;
  crop: PixelCrop;
  onCropChange: (c: PixelCrop) => void;
  onImageDimensions?: (w: number, h: number) => void;
  className?: string;
};

export default function ImageCropCanvas({
  imageUrl,
  naturalW,
  naturalH,
  crop,
  onCropChange,
  onImageDimensions,
  className,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const [altHeld, setAltHeld] = useState(false);
  const [drawRect, setDrawRect] = useState<DrawRect | null>(null);

  const dragRef = useRef<{
    mode: DragMode;
    startClientX: number;
    startClientY: number;
    crop: PixelCrop;
  } | null>(null);

  const freeMarqueeRef = useRef<{
    startPx: { x: number; y: number };
  } | null>(null);

  const measure = useCallback(() => {
    const img = imgRef.current;
    if (!img?.complete) return;
    const r = getImageDrawRect(img);
    setDrawRect(r);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [measure, imageUrl, naturalW, naturalH]);

  useEffect(() => {
    const sync = (e: KeyboardEvent) => setAltHeld(e.altKey);
    window.addEventListener("keydown", sync);
    window.addEventListener("keyup", sync);
    return () => {
      window.removeEventListener("keydown", sync);
      window.removeEventListener("keyup", sync);
    };
  }, []);

  const setCursorFromClient = useCallback(
    (clientX: number, clientY: number, altForMove?: boolean) => {
      const node = overlayRef.current;
      const wrap = wrapRef.current;
      const el = imgRef.current;
      const iw = el?.naturalWidth ?? naturalW;
      const ih = el?.naturalHeight ?? naturalH;
      if (!node || !wrap || !drawRect || iw < 1 || ih < 1) return;
      lastPointerRef.current = { x: clientX, y: clientY };
      const wantMove = altForMove ?? altHeld;
      node.style.cursor = getCursorForPosition(
        clientX,
        clientY,
        wrap.getBoundingClientRect(),
        drawRect,
        crop,
        iw,
        ih,
        wantMove
      );
    },
    [drawRect, crop, naturalW, naturalH, altHeld]
  );

  useEffect(() => {
    const p = lastPointerRef.current;
    if (p) setCursorFromClient(p.x, p.y);
  }, [altHeld, setCursorFromClient]);

  /**
   * Corners/edges → resize. Alt + inside crop → move. Else → draw (marquee).
   */
  const onPointerDown = (e: React.PointerEvent) => {
    const el = imgRef.current;
    const wrap = wrapRef.current;
    const iw = el?.naturalWidth ?? naturalW;
    const ih = el?.naturalHeight ?? naturalH;
    if (e.button !== 0 || !drawRect || iw < 1 || ih < 1) return;
    if (!el || !wrap) return;
    const b = wrap.getBoundingClientRect();
    const lx = e.clientX - b.left;
    const ly = e.clientY - b.top;
    const ec =
      crop.w >= 2 && crop.h >= 2 ? crop : defaultCenteredCrop(iw, ih);
    const cdX = drawRect.ox + ec.x * drawRect.scale;
    const cdY = drawRect.oy + ec.y * drawRect.scale;
    const cdW = ec.w * drawRect.scale;
    const cdH = ec.h * drawRect.scale;
    const mode = hitTestHandle(lx, ly, cdX, cdY, cdW, cdH, e.altKey);
    if (mode) {
      e.preventDefault();
      if (overlayRef.current) {
        overlayRef.current.style.cursor = getResizeCursor(mode);
      }
      dragRef.current = {
        mode,
        startClientX: e.clientX,
        startClientY: e.clientY,
        crop: { ...ec },
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    const p = clientToPixel(e.clientX, e.clientY, b, drawRect, iw, ih);
    if (!p) return;
    e.preventDefault();
    freeMarqueeRef.current = { startPx: { x: p.px, y: p.py } };
    if (overlayRef.current) overlayRef.current.style.cursor = "crosshair";
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = imgRef.current;
    const wrap = wrapRef.current;
    const iw = el?.naturalWidth ?? naturalW;
    const ih = el?.naturalHeight ?? naturalH;

    if (freeMarqueeRef.current && drawRect && wrap && iw >= 1 && ih >= 1) {
      e.preventDefault();
      const b = wrap.getBoundingClientRect();
      const end = clientToPixel(e.clientX, e.clientY, b, drawRect, iw, ih);
      if (!end) return;
      const { startPx } = freeMarqueeRef.current;
      onCropChange(
        cropFromMarquee(startPx.x, startPx.y, end.px, end.py, iw, ih)
      );
      if (overlayRef.current) overlayRef.current.style.cursor = "crosshair";
      return;
    }

    const d = dragRef.current;
    if (!d || !drawRect) {
      if (drawRect && iw >= 1 && ih >= 1) {
        setCursorFromClient(e.clientX, e.clientY, e.altKey);
      }
      return;
    }

    e.preventDefault();
    if (overlayRef.current) {
      overlayRef.current.style.cursor = getResizeCursor(d.mode);
    }
    if (iw < 1 || ih < 1) return;
    const dx = (e.clientX - d.startClientX) / drawRect.scale;
    const dy = (e.clientY - d.startClientY) / drawRect.scale;
    const c0 = d.crop;
    let { x, y, w, h } = c0;

    switch (d.mode) {
      case "move":
        x = c0.x + dx;
        y = c0.y + dy;
        break;
      case "e":
        w = c0.w + dx;
        break;
      case "w":
        x = c0.x + dx;
        w = c0.w - dx;
        break;
      case "s":
        h = c0.h + dy;
        break;
      case "n":
        y = c0.y + dy;
        h = c0.h - dy;
        break;
      case "se":
        w = c0.w + dx;
        h = c0.h + dy;
        break;
      case "sw":
        x = c0.x + dx;
        w = c0.w - dx;
        h = c0.h + dy;
        break;
      case "ne":
        y = c0.y + dy;
        h = c0.h - dy;
        w = c0.w + dx;
        break;
      case "nw":
        x = c0.x + dx;
        y = c0.y + dy;
        w = c0.w - dx;
        h = c0.h - dy;
        break;
      default:
        break;
    }

    onCropChange(clampCrop({ x, y, w, h }, iw, ih));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (freeMarqueeRef.current) {
      freeMarqueeRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    if (dragRef.current) {
      dragRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    setCursorFromClient(e.clientX, e.clientY, e.altKey);
  };

  const onPointerLeave = () => {
    if (dragRef.current || freeMarqueeRef.current) return;
    const node = overlayRef.current;
    if (node) node.style.cursor = "";
  };

  const imgEl = imgRef.current;
  const iw0 = imgEl?.naturalWidth ?? naturalW;
  const ih0 = imgEl?.naturalHeight ?? naturalH;
  const showOverlay = Boolean(drawRect && iw0 >= 1 && ih0 >= 1);
  const ec =
    showOverlay && crop.w >= 2 && crop.h >= 2
      ? crop
      : defaultCenteredCrop(Math.max(1, iw0), Math.max(1, ih0));
  const cdX = drawRect ? drawRect.ox + ec.x * drawRect.scale : 0;
  const cdY = drawRect ? drawRect.oy + ec.y * drawRect.scale : 0;
  const cdW = drawRect ? ec.w * drawRect.scale : 0;
  const cdH = drawRect ? ec.h * drawRect.scale : 0;

  const handles: { key: string; mode: DragMode; left: number; top: number }[] =
    [
      { key: "nw", mode: "nw", left: cdX - HANDLE / 2, top: cdY - HANDLE / 2 },
      {
        key: "n",
        mode: "n",
        left: cdX + cdW / 2 - HANDLE / 2,
        top: cdY - HANDLE / 2,
      },
      {
        key: "ne",
        mode: "ne",
        left: cdX + cdW - HANDLE / 2,
        top: cdY - HANDLE / 2,
      },
      {
        key: "w",
        mode: "w",
        left: cdX - HANDLE / 2,
        top: cdY + cdH / 2 - HANDLE / 2,
      },
      {
        key: "e",
        mode: "e",
        left: cdX + cdW - HANDLE / 2,
        top: cdY + cdH / 2 - HANDLE / 2,
      },
      {
        key: "sw",
        mode: "sw",
        left: cdX - HANDLE / 2,
        top: cdY + cdH - HANDLE / 2,
      },
      {
        key: "s",
        mode: "s",
        left: cdX + cdW / 2 - HANDLE / 2,
        top: cdY + cdH - HANDLE / 2,
      },
      {
        key: "se",
        mode: "se",
        left: cdX + cdW - HANDLE / 2,
        top: cdY + cdH - HANDLE / 2,
      },
    ];

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
        {showOverlay ? (
          <div
            ref={overlayRef}
            className="pointer-events-auto absolute inset-0 z-10 touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerLeave}
          >
            <div
              className="absolute bg-black/55 pointer-events-none"
              style={{ left: 0, top: 0, right: 0, height: Math.max(0, cdY) }}
            />
            <div
              className="absolute bg-black/55 pointer-events-none"
              style={{ left: 0, right: 0, top: cdY + cdH, bottom: 0 }}
            />
            <div
              className="absolute bg-black/55 pointer-events-none"
              style={{
                left: 0,
                top: cdY,
                width: Math.max(0, cdX),
                height: cdH,
              }}
            />
            <div
              className="absolute bg-black/55 pointer-events-none"
              style={{ left: cdX + cdW, top: cdY, right: 0, height: cdH }}
            />

            <div
              className="pointer-events-none absolute box-border border-2 border-[#d6ffd2]"
              style={{ left: cdX, top: cdY, width: cdW, height: cdH }}
            >
              <svg
                className="absolute inset-0 h-full w-full overflow-visible"
                aria-hidden
              >
                <line
                  x1="33.333%"
                  y1="0"
                  x2="33.333%"
                  y2="100%"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <line
                  x1="66.666%"
                  y1="0"
                  x2="66.666%"
                  y2="100%"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <line
                  x1="0"
                  y1="33.333%"
                  x2="100%"
                  y2="33.333%"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <line
                  x1="0"
                  y1="66.666%"
                  x2="100%"
                  y2="66.666%"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            {handles.map((h) => (
              <div
                key={h.key}
                className="pointer-events-none absolute z-20 rounded-sm border border-[#00232d]/80 bg-[#d6ffd2] shadow-sm"
                style={{
                  left: h.left,
                  top: h.top,
                  width: HANDLE,
                  height: HANDLE,
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getResizeCursor(mode: DragMode): string {
  switch (mode) {
    case "move":
      return "move";
    case "n":
    case "s":
      return "ns-resize";
    case "e":
    case "w":
      return "ew-resize";
    case "ne":
    case "sw":
      return "nesw-resize";
    case "nw":
    case "se":
      return "nwse-resize";
    default:
      return "default";
  }
}
