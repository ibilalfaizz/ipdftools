"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { signInWithGoogleOAuth } from "@/lib/supabase/oauth";
import { cn } from "@/lib/utils";

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("..")) {
    return "/";
  }
  return raw;
}

function LoginAuthInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, getLocalizedPath } = useLanguage();

  const locale = useMemo(() => {
    const m = (pathname || "").match(/^\/(en|es|fr)(\/|$)/);
    return (m?.[1] as "en" | "es" | "fr") ?? "en";
  }, [pathname]);

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const nextPath = safeNextPath(searchParams.get("next"));
  const redirectAfterAuth = getLocalizedPath(nextPath);

  const onGoogle = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    const redirectTo = `${window.location.origin}/${locale}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    try {
      await signInWithGoogleOAuth(redirectTo);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = getSupabaseBrowserClient();

    try {
      if (tab === "signup") {
        const emailRedirectTo = `${window.location.origin}/${locale}/auth/callback?next=${encodeURIComponent(nextPath)}`;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo },
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (data.session) {
          router.refresh();
          router.push(redirectAfterAuth);
          return;
        }
        setInfo(t("login.check_email"));
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.refresh();
      router.push(redirectAfterAuth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 md:py-14">
        <div className="max-w-md mx-auto rounded-xl border border-primary/15 bg-card/50 backdrop-blur-sm p-6 md:p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground text-center">
            {t("login.title")}
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {t("login.subtitle")}
          </p>

          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as "signin" | "signup");
              setError(null);
              setInfo(null);
            }}
            className="mt-8"
          >
            <TabsList
              className={cn(
                "grid h-auto w-full grid-cols-2 gap-1 rounded-xl border border-primary/25 bg-background/60 p-1.5 shadow-inner",
                "text-muted-foreground"
              )}
            >
              <TabsTrigger
                value="signin"
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "text-primary/55 hover:text-primary/80",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md",
                  "data-[state=active]:font-semibold data-[state=inactive]:font-normal"
                )}
              >
                {t("login.tab_sign_in")}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "text-primary/55 hover:text-primary/80",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md",
                  "data-[state=active]:font-semibold data-[state=inactive]:font-normal"
                )}
              >
                {t("login.tab_sign_up")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">{t("login.email")}</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/80"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">{t("login.password")}</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete={tab === "signup" ? "new-password" : "current-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/80"
              />
              <p className="text-xs text-muted-foreground">{t("login.password_hint")}</p>
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {info ? (
              <p className="text-sm text-primary" role="status">
                {info}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              <LogIn className="h-4 w-4 mr-2" aria-hidden />
              {tab === "signin" ? t("login.submit_sign_in") : t("login.submit_sign_up")}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary/15" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/80 px-2 text-muted-foreground">{t("login.or")}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-primary/25 bg-background/60"
            onClick={() => void onGoogle()}
            disabled={loading}
          >
            <GoogleGlyph className="h-5 w-5 mr-2 shrink-0" />
            {t("login.continue_google")}
          </Button>

          <p className="text-center mt-8">
            <Link
              href={getLocalizedPath("/")}
              className="text-sm text-primary hover:underline underline-offset-2"
            >
              {t("login.back_home")}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function LoginAuthClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen app-bg flex flex-col">
          <Header />
          <main className="flex-1 flex items-center justify-center px-4">
            <div className="ipdf-route-loader" aria-hidden />
            <span className="sr-only">Loading</span>
          </main>
        </div>
      }
    >
      <LoginAuthInner />
    </Suspense>
  );
}
