"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLanguage, Language } from "../contexts/LanguageContext";

type LanguageSelectorProps = {
  /** Merged into `SelectTrigger` (e.g. compact width on mobile). */
  triggerClassName?: string;
};

const LanguageSelector = ({ triggerClassName }: LanguageSelectorProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, getOriginalPath, getLocalizedPathForLanguage } =
    useLanguage();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <Select
      value={language}
      onValueChange={(value: Language) => {
        setLanguage(value);
        const orig = getOriginalPath(pathname);
        router.push(getLocalizedPathForLanguage(orig, value));
      }}
    >
      <SelectTrigger
        className={cn("w-32 min-w-0", triggerClassName)}
      >
        <SelectValue>
          <span className="flex items-center space-x-2">
            <span>{currentLanguage?.flag}</span>
            <span className="hidden sm:inline">{currentLanguage?.name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center space-x-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
