import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function safeNextPath(next: string | null): string {
  if (!next) return "/";
  // only allow relative paths
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  return "/";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const pathname = requestUrl.pathname; // /en/auth/callback
  const localeMatch = pathname.match(/^\/(en|es|fr)\//);
  const locale = localeMatch?.[1] ?? "en";

  const redirectUrl = new URL(`/${locale}${next}`, requestUrl.origin);

  if (!code) {
    redirectUrl.searchParams.set("auth", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  let response = NextResponse.redirect(redirectUrl);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !anonKey) {
    redirectUrl.searchParams.set("auth", "missing_env");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    redirectUrl.searchParams.set("auth", "exchange_failed");
    response = NextResponse.redirect(redirectUrl);
  }

  return response;
}

