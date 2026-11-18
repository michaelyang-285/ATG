create table public.directory_progress (
  owner_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null,
  step smallint not null check(step between 0 and 4),
  fields jsonb not null,
  updated_at timestamptz not null default now(),
  primary key(owner_id,listing_id)
);
alter table public.directory_progress enable row level security;
revoke all on public.directory_progress from public,anon,authenticated;
grant all on public.directory_progress to service_role;
