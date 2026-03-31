"use client";

import type { ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IMAGE_TOOL_SHEET_RESERVE } from "@/lib/image-tool-sheet-layout";
import { cn } from "@/lib/utils";

type Props = {
  hasFiles: boolean;
  onClear: () => void;
  /** Title / description (and icon) — shifts with main content when the sheet is open. */
  intro?: ReactNode;
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

/**
 * Right offcanvas for PDF tools: opens when files exist, no backdrop, no X — matches {@link ImageToolsBatchForm}.
 */
export default function PdfToolOffcanvasShell({
  hasFiles,
  onClear,
  intro,
  children,
  sidebar,
}: Props) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-4xl mx-auto p-6 transition-[padding]",
        hasFiles && IMAGE_TOOL_SHEET_RESERVE
      )}
    >
      {intro}
      <div className="mx-auto w-full max-w-3xl p-2">{children}</div>
      <Sheet
        modal={false}
        open={hasFiles}
        onOpenChange={() => {
          /* Do not dismiss while files remain */
        }}
      >
        <SheetContent
          side="rightBelowHeader"
          hideOverlay
          hideCloseButton
          className="w-full sm:max-w-md p-0 gap-0 flex flex-col overflow-y-auto tool-side-panel"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{t("image_tools.sidebar_heading")}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-5 px-6 pb-8 pt-14">
            <div className="flex items-center justify-between gap-2 border-b border-[#d6ffd2]/15 pb-3">
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                {t("image_tools.sidebar_heading")}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-muted-foreground"
                onClick={onClear}
              >
                {t("image_tools.clear")}
              </Button>
            </div>
            {sidebar}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
