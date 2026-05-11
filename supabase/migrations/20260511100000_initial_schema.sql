create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'rm', 'mid_office');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.task_status as enum (
  'new_request',
  'under_validation',
  'documents_pending',
  'awaiting_rm_response',
  'ready_for_processing',
  'submitted_to_amc',
  'in_progress',
  'completed',
  'rejected',
  'on_hold',
  'escalated',
  'closed'
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password text not null,
  role public.user_role not null,
  team text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.channel_partners (
  id uuid primary key default gen_random_uuid(),
  partner_name text not null,
  arn_number text,
  city text,
  rm_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  pan_number text,
  mobile text,
  email text,
  kyc_status text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.amcs (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table public.task_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  default_sla_hours integer not null default 24 check (default_sla_hours > 0)
);

create sequence public.task_ticket_seq start 1;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  ticket_number text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  channel_partner_id uuid references public.channel_partners(id) on delete set null,
  rm_id uuid references public.users(id) on delete set null,
  assigned_to uuid references public.users(id) on delete set null,
  task_type_id uuid references public.task_types(id) on delete set null,
  amc_id uuid references public.amcs(id) on delete set null,
  status public.task_status not null default 'new_request',
  priority public.task_priority not null default 'medium',
  description text,
  due_date timestamptz,
  sla_due_at timestamptz,
  completed_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  comment text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.task_activity_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  action_type text not null,
  field_name text,
  old_value text,
  new_value text,
  changed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index idx_tasks_status on public.tasks(status);
create index idx_tasks_priority on public.tasks(priority);
create index idx_tasks_assigned_to on public.tasks(assigned_to);
create index idx_tasks_created_by on public.tasks(created_by);
create index idx_tasks_rm_id on public.tasks(rm_id);
create index idx_tasks_sla_due_at on public.tasks(sla_due_at);
create index idx_task_comments_task_id on public.task_comments(task_id);
create index idx_task_attachments_task_id on public.task_attachments(task_id);
create index idx_task_activity_logs_task_id on public.task_activity_logs(task_id);

create or replace function public.generate_task_ticket()
returns text
language plpgsql
as $$
declare
  next_val bigint;
begin
  next_val := nextval('public.task_ticket_seq');
  return 'MF-' || lpad(next_val::text, 4, '0');
end;
$$;

create or replace function public.set_task_ticket_and_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.ticket_number is null or new.ticket_number = '' then
    new.ticket_number := public.generate_task_ticket();
  end if;

  new.updated_at := timezone('utc', now());

  if new.status in ('completed', 'closed') and new.completed_at is null then
    new.completed_at := timezone('utc', now());
  elsif new.status not in ('completed', 'closed') then
    new.completed_at := null;
  end if;

  return new;
end;
$$;

create trigger trg_tasks_before_write
before insert or update on public.tasks
for each row
execute function public.set_task_ticket_and_timestamps();

create or replace function public.log_task_creation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_activity_logs (task_id, action_type, field_name, new_value, changed_by)
  values (new.id, 'Task created', 'status', new.status::text, coalesce(new.created_by, auth.uid()));

  return new;
end;
$$;

create trigger trg_tasks_after_insert
after insert on public.tasks
for each row
execute function public.log_task_creation();

create or replace function public.log_task_updates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.task_activity_logs (task_id, action_type, field_name, old_value, new_value, changed_by)
    values (new.id, 'Status changed', 'status', old.status::text, new.status::text, auth.uid());
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    insert into public.task_activity_logs (task_id, action_type, field_name, old_value, new_value, changed_by)
    values (new.id, 'Assignment changed', 'assigned_to', old.assigned_to::text, new.assigned_to::text, auth.uid());
  end if;

  if new.priority is distinct from old.priority then
    insert into public.task_activity_logs (task_id, action_type, field_name, old_value, new_value, changed_by)
    values (new.id, 'Priority changed', 'priority', old.priority::text, new.priority::text, auth.uid());
  end if;

  return new;
end;
$$;

create trigger trg_tasks_after_update
after update on public.tasks
for each row
execute function public.log_task_updates();

create or replace function public.log_task_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.task_activity_logs (task_id, action_type, field_name, new_value, changed_by)
  values (new.task_id, 'Comment added', 'comment', left(new.comment, 300), coalesce(new.user_id, auth.uid()));

  return new;
end;
$$;

create trigger trg_comments_after_insert
after insert on public.task_comments
for each row
execute function public.log_task_comment();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

create or replace function public.can_access_task(task_row public.tasks)
returns boolean
language sql
stable
as $$
  select
    public.is_admin()
    or task_row.created_by = auth.uid()
    or task_row.rm_id = auth.uid()
    or task_row.assigned_to = auth.uid();
$$;

alter table public.users enable row level security;
alter table public.channel_partners enable row level security;
alter table public.clients enable row level security;
alter table public.amcs enable row level security;
alter table public.task_types enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.task_activity_logs enable row level security;

create policy "users_self_select" on public.users
for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "users_admin_manage" on public.users
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "lookup_select_authenticated" on public.channel_partners
for select
to authenticated
using (true);

create policy "lookup_admin_manage_channel_partners" on public.channel_partners
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "clients_select_authenticated" on public.clients
for select
to authenticated
using (true);

create policy "clients_admin_manage" on public.clients
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "amcs_select_authenticated" on public.amcs
for select
to authenticated
using (true);

create policy "amcs_admin_manage" on public.amcs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "task_types_select_authenticated" on public.task_types
for select
to authenticated
using (true);

create policy "task_types_admin_manage" on public.task_types
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "tasks_select_accessible" on public.tasks
for select
to authenticated
using (public.can_access_task(tasks));

create policy "tasks_insert_creator" on public.tasks
for insert
to authenticated
with check (created_by = auth.uid() or public.is_admin());

create policy "tasks_update_accessible" on public.tasks
for update
to authenticated
using (public.can_access_task(tasks))
with check (public.can_access_task(tasks));

create policy "tasks_delete_admin" on public.tasks
for delete
to authenticated
using (public.is_admin());

create policy "task_comments_select_accessible" on public.task_comments
for select
to authenticated
using (
  exists (
    select 1 from public.tasks
    where tasks.id = task_comments.task_id
      and public.can_access_task(tasks)
  )
);

create policy "task_comments_insert_accessible" on public.task_comments
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.tasks
    where tasks.id = task_comments.task_id
      and public.can_access_task(tasks)
  )
);

create policy "task_attachments_select_accessible" on public.task_attachments
for select
to authenticated
using (
  exists (
    select 1 from public.tasks
    where tasks.id = task_attachments.task_id
      and public.can_access_task(tasks)
  )
);

create policy "task_attachments_insert_accessible" on public.task_attachments
for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and exists (
    select 1 from public.tasks
    where tasks.id = task_attachments.task_id
      and public.can_access_task(tasks)
  )
);

create policy "task_activity_logs_select_accessible" on public.task_activity_logs
for select
to authenticated
using (
  exists (
    select 1 from public.tasks
    where tasks.id = task_activity_logs.task_id
      and public.can_access_task(tasks)
  )
);

insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', false)
on conflict (id) do nothing;

alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.task_comments;
