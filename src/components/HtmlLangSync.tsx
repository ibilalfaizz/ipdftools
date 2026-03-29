"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isLocalePrefix } from "@/lib/urlPaths";

/** Sync `<html lang>` with the first URL segment (`/en/...`, `/es/...`, `/fr/...`). */
export function HtmlLangSync() {
  const pathname = usePathname();
  useEffect(() => {
    const seg = pathname.split("/").filter(Boolean)[0];
    if (isLocalePrefix(seg)) {
      document.documentElement.lang = seg;
    }
  }, [pathname]);
  return null;
}
