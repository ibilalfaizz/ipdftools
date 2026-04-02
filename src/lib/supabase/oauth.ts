import { getSupabaseBrowserClient } from "./client";

/**
 * Starts Google OAuth and navigates to Google's consent screen.
 * Uses skipBrowserRedirect + manual navigation so the redirect is reliable
 * across Next.js + @supabase/ssr (PKCE) environments.
 */
export async function signInWithGoogleOAuth(redirectTo: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  const url = data.url;
  if (!url) {
    throw new Error("No OAuth URL returned from Supabase.");
  }
  window.location.assign(url);
}
