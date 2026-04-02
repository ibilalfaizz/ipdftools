-- PDF + Image workflow sync tables for iPDFTOOLS
-- Run in Supabase SQL editor.

create table if not exists public.pdf_workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  steps jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create unique index if not exists pdf_workflows_user_name
  on public.pdf_workflows (user_id, name);

alter table public.pdf_workflows enable row level security;

drop policy if exists "pdf_workflows_select_own" on public.pdf_workflows;
create policy "pdf_workflows_select_own"
  on public.pdf_workflows
  for select
  using (auth.uid() = user_id);

drop policy if exists "pdf_workflows_insert_own" on public.pdf_workflows;
create policy "pdf_workflows_insert_own"
  on public.pdf_workflows
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "pdf_workflows_update_own" on public.pdf_workflows;
create policy "pdf_workflows_update_own"
  on public.pdf_workflows
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "pdf_workflows_delete_own" on public.pdf_workflows;
create policy "pdf_workflows_delete_own"
  on public.pdf_workflows
  for delete
  using (auth.uid() = user_id);


create table if not exists public.image_workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  steps jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create unique index if not exists image_workflows_user_name
  on public.image_workflows (user_id, name);

alter table public.image_workflows enable row level security;

drop policy if exists "image_workflows_select_own" on public.image_workflows;
create policy "image_workflows_select_own"
  on public.image_workflows
  for select
  using (auth.uid() = user_id);

drop policy if exists "image_workflows_insert_own" on public.image_workflows;
create policy "image_workflows_insert_own"
  on public.image_workflows
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "image_workflows_update_own" on public.image_workflows;
create policy "image_workflows_update_own"
  on public.image_workflows
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "image_workflows_delete_own" on public.image_workflows;
create policy "image_workflows_delete_own"
  on public.image_workflows
  for delete
  using (auth.uid() = user_id);

