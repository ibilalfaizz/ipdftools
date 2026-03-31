"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { FaceBlurBox } from "@/lib/face-blur-blazeface";

type DrawRect = { ox: number; oy: number; w: number; h: number; scale: number };

const MIN_BOX = 8;
const HANDLE = 10;

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

function clampBox(b: FaceBlurBox, iw: number, ih: number): FaceBlurBox {
  let { x, y, w, h } = b;
  w = Math.max(MIN_BOX, Math.min(Math.round(w), iw));
  h = Math.max(MIN_BOX, Math.min(Math.round(h), ih));
  x = Math.max(0, Math.min(Math.round(x), iw - w));
  y = Math.max(0, Math.min(Math.round(y), ih - h));
  return { x, y, w, h };
}

function isInsideDrawRect(lx: number, ly: number, dr: DrawRect): boolean {
  return (
    lx >= dr.ox &&
    lx <= dr.ox + dr.w &&
    ly >= dr.oy &&
    ly <= dr.oy + dr.h
  );
}

function hitTestHandle(
  lx: number,
  ly: number,
  cdX: number,
  cdY: number,
  cdW: number,
  cdH: number
): DragMode | null {
  const h2 = HANDLE / 2;
  const cl = cdX;
  const cr = cdX + cdW;
  const ct = cdY;
  const cb = cdY + cdH;

  if (lx >= cl - h2 && lx <= cl + h2 && ly >= ct - h2 && ly <= ct + h2) return "nw";
  if (lx >= cr - h2 && lx <= cr + h2 && ly >= ct - h2 && ly <= ct + h2) return "ne";
  if (lx >= cl - h2 && lx <= cl + h2 && ly >= cb - h2 && ly <= cb + h2) return "sw";
  if (lx >= cr - h2 && lx <= cr + h2 && ly >= cb - h2 && ly <= cb + h2) return "se";

  if (ly >= ct - h2 && ly <= ct + h2 && lx >= cl + h2 && lx <= cr - h2) return "n";
  if (ly >= cb - h2 && ly <= cb + h2 && lx >= cl + h2 && lx <= cr - h2) return "s";
  if (lx >= cl - h2 && lx <= cl + h2 && ly >= ct + h2 && ly <= cb - h2) return "w";
  if (lx >= cr - h2 && lx <= cr + h2 && ly >= ct + h2 && ly <= cb - h2) return "e";

  if (lx >= cl && lx <= cr && ly >= ct && ly <= cb) return "move";

  return null;
}

function hitTestBoxes(
  lx: number,
  ly: number,
  dr: DrawRect,
  boxes: FaceBlurBox[]
): { index: number; mode: DragMode } | null {
  for (let i = boxes.length - 1; i >= 0; i--) {
    const box = boxes[i];
    const cdX = dr.ox + box.x * dr.scale;
    const cdY = dr.oy + box.y * dr.scale;
    const cdW = box.w * dr.scale;
    const cdH = box.h * dr.scale;
    const mode = hitTestHandle(lx, ly, cdX, cdY, cdW, cdH);
    if (mode) return { index: i, mode };
  }
  return null;
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

type Props = {
  imageUrl: string;
  naturalW: number;
  naturalH: number;
  boxes: FaceBlurBox[];
  blurPx: number;
  onBoxesChange: (boxes: FaceBlurBox[]) => void;
  className?: string;
};

export default function ImageBlurRegionsEditor({
  imageUrl,
  naturalW,
  naturalH,
  boxes,
  blurPx,
  onBoxesChange,
  className,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const [drawRect, setDrawRect] = useState<DrawRect | null>(null);

  const dragRef = useRef<{
    index: number;
    mode: DragMode;
    startClientX: number;
    startClientY: number;
    box0: FaceBlurBox;
  } | null>(null);

  const boxesRef = useRef(boxes);
  boxesRef.current = boxes;

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

  const iw = naturalW;
  const ih = naturalH;

  const setCursorFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const node = overlayRef.current;
      const wrap = wrapRef.current;
      if (!node || !wrap || !drawRect || iw < 1 || ih < 1) return;
      lastPointerRef.current = { x: clientX, y: clientY };
      const b = wrap.getBoundingClientRect();
      const lx = clientX - b.left;
      const ly = clientY - b.top;
      if (!isInsideDrawRect(lx, ly, drawRect)) {
        node.style.cursor = "";
        return;
      }
      const hit = hitTestBoxes(lx, ly, drawRect, boxes);
      node.style.cursor = hit ? getResizeCursor(hit.mode) : "";
    },
    [drawRect, boxes, iw, ih]
  );

  useEffect(() => {
    const p = lastPointerRef.current;
    if (p) setCursorFromClient(p.x, p.y);
  }, [boxes, setCursorFromClient]);

  const onPointerDown = (e: React.PointerEvent) => {
    const wrap = wrapRef.current;
    if (e.button !== 0 || !drawRect || !wrap || iw < 1 || ih < 1) return;
    const b = wrap.getBoundingClientRect();
    const lx = e.clientX - b.left;
    const ly = e.clientY - b.top;
    const hit = hitTestBoxes(lx, ly, drawRect, boxes);
    if (!hit) return;
    e.preventDefault();
    const box0 = boxes[hit.index];
    if (!box0) return;
    dragRef.current = {
      index: hit.index,
      mode: hit.mode,
      startClientX: e.clientX,
      startClientY: e.clientY,
      box0: { ...box0 },
    };
    if (overlayRef.current) {
      overlayRef.current.style.cursor = getResizeCursor(hit.mode);
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || !drawRect) {
      if (drawRect && iw >= 1 && ih >= 1) {
        setCursorFromClient(e.clientX, e.clientY);
      }
      return;
    }

    e.preventDefault();
    if (overlayRef.current) {
      overlayRef.current.style.cursor = getResizeCursor(d.mode);
    }

    const dx = (e.clientX - d.startClientX) / drawRect.scale;
    const dy = (e.clientY - d.startClientY) / drawRect.scale;
    const c0 = d.box0;
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

    const next = boxesRef.current.map((box, i) =>
      i === d.index ? clampBox({ x, y, w, h }, iw, ih) : box
    );
    onBoxesChange(next);
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
    setCursorFromClient(e.clientX, e.clientY);
  };

  const onPointerLeave = () => {
    if (dragRef.current) return;
    const node = overlayRef.current;
    if (node) node.style.cursor = "";
  };

  const showOverlay =
    Boolean(drawRect && iw >= 1 && ih >= 1) && boxes.length > 0;

  const cssBlur = Math.min(48, Math.max(2, blurPx));

  return (
    <div className={cn("relative inline-block max-w-full", className)}>
      <div ref={wrapRef} className="relative inline-block max-w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt=""
          className="pointer-events-none mx-auto block max-h-[min(48vh,400px)] w-auto max-w-full select-none rounded-md shadow-lg ring-1 ring-[#d6ffd2]/15"
          draggable={false}
          onLoad={() => measure()}
        />
        {showOverlay
          ? boxes.map((box, bi) => {
              const dr = drawRect!;
              const cdX = dr.ox + box.x * dr.scale;
              const cdY = dr.oy + box.y * dr.scale;
              const cdW = box.w * dr.scale;
              const cdH = box.h * dr.scale;
              return (
                <div
                  key={`blur-${bi}`}
                  className="pointer-events-none absolute z-[1] overflow-hidden"
                  style={{
                    left: cdX,
                    top: cdY,
                    width: cdW,
                    height: cdH,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt=""
                    className="absolute max-w-none select-none"
                    draggable={false}
                    style={{
                      left: dr.ox - cdX,
                      top: dr.oy - cdY,
                      width: dr.w,
                      height: dr.h,
                      filter: `blur(${cssBlur}px)`,
                    }}
                  />
                </div>
              );
            })
          : null}
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
            {boxes.map((box, bi) => {
              const cdX = drawRect!.ox + box.x * drawRect!.scale;
              const cdY = drawRect!.oy + box.y * drawRect!.scale;
              const cdW = box.w * drawRect!.scale;
              const cdH = box.h * drawRect!.scale;
              const handles: {
                key: string;
                mode: DragMode;
                left: number;
                top: number;
              }[] = [
                {
                  key: `${bi}-nw`,
                  mode: "nw",
                  left: cdX - HANDLE / 2,
                  top: cdY - HANDLE / 2,
                },
                {
                  key: `${bi}-n`,
                  mode: "n",
                  left: cdX + cdW / 2 - HANDLE / 2,
                  top: cdY - HANDLE / 2,
                },
                {
                  key: `${bi}-ne`,
                  mode: "ne",
                  left: cdX + cdW - HANDLE / 2,
                  top: cdY - HANDLE / 2,
                },
                {
                  key: `${bi}-w`,
                  mode: "w",
                  left: cdX - HANDLE / 2,
                  top: cdY + cdH / 2 - HANDLE / 2,
                },
                {
                  key: `${bi}-e`,
                  mode: "e",
                  left: cdX + cdW - HANDLE / 2,
                  top: cdY + cdH / 2 - HANDLE / 2,
                },
                {
                  key: `${bi}-sw`,
                  mode: "sw",
                  left: cdX - HANDLE / 2,
                  top: cdY + cdH - HANDLE / 2,
                },
                {
                  key: `${bi}-s`,
                  mode: "s",
                  left: cdX + cdW / 2 - HANDLE / 2,
                  top: cdY + cdH - HANDLE / 2,
                },
                {
                  key: `${bi}-se`,
                  mode: "se",
                  left: cdX + cdW - HANDLE / 2,
                  top: cdY + cdH - HANDLE / 2,
                },
              ];
              return (
                <div key={bi}>
                  <div
                    className="pointer-events-none absolute box-border border-2 border-dashed border-[#d6ffd2]/90"
                    style={{ left: cdX, top: cdY, width: cdW, height: cdH }}
                  />
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
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
