create table public.interview_credentials (
 owner_id uuid primary key references auth.users(id) on delete cascade,
 sealed_key text not null
);
alter table public.interview_credentials enable row level security;
revoke all on public.interview_credentials from public, anon, authenticated;
grant select,insert,update on public.interview_credentials to service_role;
