import type { SupabaseClient } from "@supabase/supabase-js";

export type AccountWorkflowRow = {
  id: string;
  name: string;
  steps: unknown;
  created_at: string;
  updated_at: string | null;
};

export async function listWorkflowsForAccount(
  supabase: SupabaseClient,
  table: "pdf_workflows" | "image_workflows"
): Promise<AccountWorkflowRow[]> {
  const { data, error } = await supabase
    .from(table)
    .select("id,name,steps,created_at,updated_at")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(100);
  if (error) throw error;
  return (data || []) as AccountWorkflowRow[];
}
