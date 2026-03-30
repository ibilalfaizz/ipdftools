"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { TOOL_SEARCH_INDEX } from "@/lib/tool-search-index";
import { cn } from "@/lib/utils";

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

type Props = {
  variant?: "hero" | "header";
  className?: string;
  /** Called after navigating to a tool (e.g. close mobile sheet). */
  onNavigate?: () => void;
};

export default function ToolSearch({
  variant = "header",
  className,
  onNavigate,
}: Props) {
  const { t, getLocalizedPath } = useLanguage();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () =>
      TOOL_SEARCH_INDEX.map((row) => ({
        href: row.href,
        category: row.category,
        label: t(row.labelKey),
        description: t(row.descriptionKey),
      })),
    [t]
  );

  const filtered = useMemo(() => {
    const q = norm(query);
    if (!q) return [];
    return items.filter((item) => {
      const blob = norm(`${item.label} ${item.description} ${item.href}`);
      return blob.includes(q);
    });
  }, [query, items]);

  const showPanel = open && query.trim().length >= 1;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn("relative w-full", className)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d6ffd2]/50"
          aria-hidden
        />
        <Input
          type="search"
          enterKeyHint="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-autocomplete="list"
          placeholder={t("tool_search.placeholder")}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className={cn(
            "pl-9 pr-3 text-foreground placeholder:text-muted-foreground border-[#d6ffd2]/25 bg-[#103c44]/40 focus-visible:ring-[#d6ffd2]/35",
            variant === "hero" &&
              "h-12 text-base shadow-[inset_0_1px_0_rgba(214,255,210,0.06)]",
            variant === "header" && "h-9 md:h-10 text-sm"
          )}
        />
      </div>
      {showPanel ? (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-[min(320px,50vh)] overflow-y-auto rounded-md border border-[#d6ffd2]/20 bg-[#103c44] py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              {t("tool_search.no_results")}
            </p>
          ) : (
            <ul className="py-1">
              {filtered.map((item) => (
                <li key={item.href}>
                  <Link
                    href={getLocalizedPath(item.href)}
                    role="option"
                    className="block px-3 py-2.5 text-left transition-colors hover:bg-[#00232d] focus:bg-[#00232d] focus:outline-none"
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      onNavigate?.();
                    }}
                  >
                    <span className="font-medium text-[#d6ffd2]">{item.label}</span>
                    <span className="mt-0.5 block line-clamp-2 text-xs text-[#d6ffd2]/65">
                      {item.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
