import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type WorkflowRow = {
  id: string;
  name: string;
  steps: unknown;
  updated_at: string | null;
};

export async function listWorkflows(table: "pdf_workflows" | "image_workflows") {
  const supabase = getSupabaseBrowserClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("not_signed_in");

  const { data, error } = await supabase
    .from(table)
    .select("id,name,steps,updated_at")
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []) as WorkflowRow[];
}

export async function upsertWorkflow(
  table: "pdf_workflows" | "image_workflows",
  args: { name: string; steps: unknown }
) {
  const supabase = getSupabaseBrowserClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("not_signed_in");

  const { data, error } = await supabase
    .from(table)
    .upsert(
      { user_id: user.id, name: args.name, steps: args.steps, updated_at: new Date().toISOString() },
      { onConflict: "user_id,name" }
    )
    .select("id,name,steps,updated_at")
    .single();
  if (error) throw error;
  return data as WorkflowRow;
}

export async function deleteWorkflow(
  table: "pdf_workflows" | "image_workflows",
  id: string
) {
  const supabase = getSupabaseBrowserClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("not_signed_in");

  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function getWorkflowById(
  table: "pdf_workflows" | "image_workflows",
  id: string
) {
  const supabase = getSupabaseBrowserClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("not_signed_in");

  const { data, error } = await supabase
    .from(table)
    .select("id,name,steps,updated_at")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as WorkflowRow;
}

