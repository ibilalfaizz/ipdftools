import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Server client for Server Components / Server Actions.
 * Uses Next's cookie store so Supabase can refresh sessions.
 */
export function createSupabaseServerClient(): SupabaseClient {
  const cookieStore = cookies();
  const { url, anonKey } = getSupabaseEnv();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components can't always set cookies; middleware/route handlers handle refresh.
        }
      },
    },
  });
}

