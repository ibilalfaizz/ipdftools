"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Props = {
  hasFiles: boolean;
  onClear: () => void;
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

/**
 * Right offcanvas for PDF tools: opens when files exist, no backdrop, no X — matches {@link ImageToolsBatchForm}.
 */
export default function PdfToolOffcanvasShell({
  hasFiles,
  onClear,
  children,
  sidebar,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="w-full relative">
      <div className="mx-auto w-full max-w-3xl p-2">{children}</div>
      <Sheet
        open={hasFiles}
        onOpenChange={() => {
          /* Do not dismiss while files remain */
        }}
      >
        <SheetContent
          side="right"
          hideOverlay
          hideCloseButton
          className="w-full sm:max-w-md p-0 gap-0 flex flex-col border-l bg-gradient-to-b from-slate-50 to-white overflow-y-auto"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{t("image_tools.sidebar_heading")}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-5 px-6 pb-8 pt-14">
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <h3 className="text-sm font-semibold tracking-tight text-gray-900">
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
