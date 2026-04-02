import { redirect } from "next/navigation";
import AccountDashboardClient from "@/components/AccountDashboardClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listWorkflowsForAccount } from "@/lib/workflows/server-workflows";
import { isLocalePrefix } from "@/lib/urlPaths";

export default async function AccountPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = typeof params?.locale === "string" ? params.locale.trim() : "";
  if (!isLocalePrefix(locale)) {
    redirect("/en/account");
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    redirect(`/${locale}/login?next=/account`);
  }

  let pdfWorkflows: Awaited<ReturnType<typeof listWorkflowsForAccount>> = [];
  let imageWorkflows: Awaited<ReturnType<typeof listWorkflowsForAccount>> = [];
  try {
    [pdfWorkflows, imageWorkflows] = await Promise.all([
      listWorkflowsForAccount(supabase, "pdf_workflows"),
      listWorkflowsForAccount(supabase, "image_workflows"),
    ]);
  } catch {
    /* tables or RLS not ready */
  }

  return (
    <AccountDashboardClient
      email={user.email ?? ""}
      pdfWorkflows={pdfWorkflows}
      imageWorkflows={imageWorkflows}
    />
  );
}
