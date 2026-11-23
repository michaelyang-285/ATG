create table public.author_assignments (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 title text not null,
 questions text[] not null,
 answers jsonb not null default '{}',
 submitted boolean not null default false,
 revision integer not null default 1,
 updated_at timestamptz not null default now()
);
create index author_assignments_owner on public.author_assignments(owner_id,updated_at desc);
alter table public.author_assignments enable row level security;
revoke all on public.author_assignments from public, anon, authenticated;
grant select,insert,update on public.author_assignments to service_role;
