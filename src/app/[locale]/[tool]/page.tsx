import { notFound } from "next/navigation";
import {
  allLocaleToolStaticParams,
  isLocalePrefix,
  isValidLocaleToolPair,
  slugToOriginalPath,
} from "@/lib/urlPaths";
import ToolRouteClient from "@/components/ToolRouteClient";

export function generateStaticParams() {
  return allLocaleToolStaticParams();
}

export default function ToolPage({
  params,
}: {
  params: { locale: string; tool: string };
}) {
  const locale =
    typeof params?.locale === "string" ? params.locale.trim() : "";
  const tool = typeof params?.tool === "string" ? params.tool.trim() : "";
  if (!isLocalePrefix(locale)) {
    notFound();
  }
  const originalPath = slugToOriginalPath(tool);
  if (!originalPath || !isValidLocaleToolPair(locale, tool)) {
    notFound();
  }
  return <ToolRouteClient originalPath={originalPath} />;
}
