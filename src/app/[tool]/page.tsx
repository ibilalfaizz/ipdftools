import { notFound } from "next/navigation";
import { allLocalizedSlugs, slugToOriginalPath } from "@/lib/urlPaths";
import ToolRouteClient from "@/components/ToolRouteClient";

export function generateStaticParams() {
  return allLocalizedSlugs().map((tool) => ({ tool }));
}

export default function ToolPage({
  params,
}: {
  params: { tool: string };
}) {
  const slug =
    typeof params?.tool === "string" ? params.tool.trim() : String(params?.tool ?? "");
  const originalPath = slugToOriginalPath(slug);
  if (!originalPath) {
    notFound();
  }
  return <ToolRouteClient originalPath={originalPath} />;
}
