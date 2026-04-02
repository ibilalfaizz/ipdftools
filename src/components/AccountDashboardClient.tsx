"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  FileImage,
  FileText,
  GitBranch,
  LogOut,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { deleteWorkflow } from "@/lib/workflows/supabase-workflow-store";
import type { AccountWorkflowRow } from "@/lib/workflows/server-workflows";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function stepCount(steps: unknown): number {
  return Array.isArray(steps) ? steps.length : 0;
}

type Props = {
  pdfWorkflows: AccountWorkflowRow[];
  imageWorkflows: AccountWorkflowRow[];
  email: string;
};

export default function AccountDashboardClient({
  pdfWorkflows,
  imageWorkflows,
  email,
}: Props) {
  const { t, language, getLocalizedPath } = useLanguage();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [section, setSection] = useState<"profile" | "workflows">("profile");

  const NavItems = ({
    onPick,
    layout = "vertical",
  }: {
    onPick?: () => void;
    layout?: "vertical" | "grid";
  }) => (
    <nav
      className={cn(
        "p-2",
        layout === "vertical" ? "flex flex-col gap-1" : "grid grid-cols-2 gap-1"
      )}
      aria-label={t("account.nav_aria")}
    >
      <button
        type="button"
        onClick={() => {
          setSection("profile");
          onPick?.();
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          layout === "grid" ? "justify-center" : "justify-start text-left",
          section === "profile"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <UserRound className="h-4 w-4 shrink-0" aria-hidden />
        {t("account.tab_profile")}
      </button>
      <button
        type="button"
        onClick={() => {
          setSection("workflows");
          onPick?.();
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          layout === "grid" ? "justify-center" : "justify-start text-left",
          section === "workflows"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <GitBranch className="h-4 w-4 shrink-0" aria-hidden />
        {t("account.tab_workflows")}
      </button>
    </nav>
  );

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(language === "es" ? "es" : language === "fr" ? "fr" : "en", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [language]
  );

  const formatWhen = (row: AccountWorkflowRow) => {
    const raw = row.updated_at || row.created_at;
    if (!raw) return "—";
    try {
      return dateFmt.format(new Date(raw));
    } catch {
      return "—";
    }
  };

  const onSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push(getLocalizedPath("/"));
    router.refresh();
  };

  const removePdf = async (row: AccountWorkflowRow) => {
    setDeletingId(`pdf-${row.id}`);
    try {
      await deleteWorkflow("pdf_workflows", row.id);
      router.refresh();
    } catch {
      toast.error(t("account.delete_failed"));
    } finally {
      setDeletingId(null);
    }
  };

  const removeImage = async (row: AccountWorkflowRow) => {
    setDeletingId(`img-${row.id}`);
    try {
      await deleteWorkflow("image_workflows", row.id);
      router.refresh();
    } catch {
      toast.error(t("account.delete_failed"));
    } finally {
      setDeletingId(null);
    }
  };

  const pdfBase = getLocalizedPath("/pdf-workflow");
  const imageBase = getLocalizedPath("/image-workflow");

  return (
    <div className="min-h-screen app-bg flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              {t("account.title")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("account.subtitle")}</p>
          </div>

          <aside className="md:hidden rounded-xl border border-primary/15 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
            <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("account.menu_title")}
            </p>
            <NavItems layout="grid" />
          </aside>

          <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
            <aside className="hidden md:block w-56 shrink-0 lg:w-60">
              <div className="sticky top-24 rounded-xl border border-primary/15 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                <p className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("account.menu_title")}
                </p>
                <NavItems />
              </div>
            </aside>

            <div className="min-w-0 flex-1 space-y-6">
              {section === "profile" ? (
              <Card className="border-primary/15 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>{t("account.profile_title")}</CardTitle>
                  <CardDescription>{t("account.profile_desc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t("login.email")}
                    </p>
                    <p className="text-foreground mt-1 font-medium break-all">{email}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-primary/25"
                      onClick={() => void onSignOut()}
                    >
                      <LogOut className="h-4 w-4 mr-2" aria-hidden />
                      {t("auth.sign_out")}
                    </Button>
                    <Button asChild variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15">
                      <Link href={getLocalizedPath("/")}>{t("login.back_home")}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ) : (
              <div className="space-y-4">
              <Card className="border-primary/15 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-5 w-5 text-primary shrink-0" aria-hidden />
                      <CardTitle className="text-lg">{t("account.pdf_workflows")}</CardTitle>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="shrink-0 w-fit bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Link href={pdfBase}>
                        <Plus className="h-4 w-4 mr-1.5" aria-hidden />
                        {t("account.create_new_workflow")}
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pdfWorkflows.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-1">{t("account.no_workflows_pdf")}</p>
                  ) : (
                    <ul className="space-y-2">
                      {pdfWorkflows.map((w) => (
                        <li
                          key={w.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-primary/10 bg-background/40 px-3 py-3"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{w.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t("account.steps")}: {stepCount(w.steps)} · {t("account.updated")}{" "}
                              {formatWhen(w)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button asChild size="sm" variant="outline" className="border-primary/25">
                              <Link href={`${pdfBase}?wf=${encodeURIComponent(w.id)}`}>
                                <ExternalLink className="h-4 w-4 mr-1.5" aria-hidden />
                                {t("account.open_workflow")}
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deletingId === `pdf-${w.id}`}
                              onClick={() => void removePdf(w)}
                              aria-label={t("account.delete_workflow")}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card className="border-primary/15 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileImage className="h-5 w-5 text-primary shrink-0" aria-hidden />
                      <CardTitle className="text-lg">{t("account.image_workflows")}</CardTitle>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="shrink-0 w-fit bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Link href={imageBase}>
                        <Plus className="h-4 w-4 mr-1.5" aria-hidden />
                        {t("account.create_new_workflow")}
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {imageWorkflows.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-1">{t("account.no_workflows_image")}</p>
                  ) : (
                    <ul className="space-y-2">
                      {imageWorkflows.map((w) => (
                        <li
                          key={w.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-primary/10 bg-background/40 px-3 py-3"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{w.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t("account.steps")}: {stepCount(w.steps)} · {t("account.updated")}{" "}
                              {formatWhen(w)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button asChild size="sm" variant="outline" className="border-primary/25">
                              <Link href={`${imageBase}?wf=${encodeURIComponent(w.id)}`}>
                                <ExternalLink className="h-4 w-4 mr-1.5" aria-hidden />
                                {t("account.open_workflow")}
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deletingId === `img-${w.id}`}
                              onClick={() => void removeImage(w)}
                              aria-label={t("account.delete_workflow")}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
              </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
